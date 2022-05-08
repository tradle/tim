const { xirr, convertRate, irr } = require('node-irr')
import dateformat from 'dateformat'
import cloneDeep from 'lodash/cloneDeep'
import size from 'lodash/size'
import extend from 'lodash/extend'
import { TYPE } from '@tradle/constants'
import { getMe, getModel, getType, getRootHash, isStub, translate, formatCurrency } from '../utils/utils'
import validateResource from '@tradle/validate-resource'
// @ts-ignore
const { sanitize } = validateResource.utils

const COST_OF_CAPITAL = 'tradle.credit.CostOfCapital'
const MONEY = 'tradle.Money'

module.exports = function LeasingQuotes ({ models }) {
  return {
    validateForm: async function validateForm ({
      application,
      form:formOrig,
      currentResource,
      search,
      fixedProps={}
    }) {
      if (!getMe().isEmployee || !application) return

      let form = cloneDeep(formOrig)
      const ftype = form[TYPE]
      if (!ftype.endsWith('.Quote')) return

      let {costOfCapital, foundCloseGoal, formErrors, message} = await getQuote({form, models, search, currentResource, fixedProps, application})
      if (!foundCloseGoal  &&  fixedProps  &&  size(fixedProps))
        return {
          recalculate: true,
          message,
          formErrors
        }
      chooseDetail({form, models, costOfCapital})
      if (formErrors)
        return {
          recalculate: size(formErrors) > 1,
          message,
          formErrors,
          form //: !size(fixedProps) ? form : null
        }
      if (message) {
        return {
          recalculate: true,
          message
        }
      }
      return {
        form
      }
    }
  }
}
function chooseDetail({form, models, costOfCapital}) {
  let ftype = getType(form)
  const m = models[ftype]

  if (!m) return

  let termsPropRef = m.properties.terms.items.ref
  if (!form.term)
    return

  let terms = form.terms
  if (!terms) return

  let termId = form.term.id
  let term = terms.find(t => t.term.id === termId)

  extend(form, term)
  form[TYPE] = ftype
  let { monthlyPayment, term:chosenTerm, purchaseOptionPrice } = form
  form.finalNoteValue = {
    currency: monthlyPayment.currency,
    value: Math.round(monthlyPayment.value * chosenTerm.id.split('_t')[1] - purchaseOptionPrice.value)
  }

  if (!costOfCapital) return
  if (form.xirr > costOfCapital.minXIRR)
    form.approve = true
  else
    form.approve = false
}
async function getQuote({form, models, search, currentResource, fixedProps, application}) {
  let model = models[getType(form)]
  if (!model) return {}

  let { prefill, costOfCapital, foundCloseGoal, formErrors, message, calculateFormulas } = await quotationPerTerm({form, search, currentResource, fixedProps})
  if (prefill) {
    extend(form, prefill)
    return { costOfCapital, foundCloseGoal, formErrors, message }
  }
  if (message)
    return { message }
  if (formErrors)
    return { formErrors }
  if (calculateFormulas) {
    let plugin = require('./ValidateSelectors')
    await plugin({models}).validateForm.call(
          {models: {[form[TYPE]]: model}},
          {application, form}
      )
  }

  return {}
}
async function quotationPerTerm({form, search, currentResource, fixedProps}) {
  const quotationInfo = form
  let {
    term: termQuote,
    factor,
    netPrice,
    commissionFeePercent,
    asset,
    exchangeRate,
    depositPercentage = 0,
    deliveryTime,
    netPriceMx,
    vatRate,
    priceMx,
    depositValue,
    fundedInsurance,
    discountFromVendor,
    blindDiscount = 0,
    residualValue: residualValueQuote
  } = quotationInfo

  if (!asset)
    return {}

  if (isStub(asset)) {
    let { list } = await search({modelName: getType(asset), filterResource: {_permalink: getRootHash(asset)}, noTrigger: true})
    asset = list && list[0]
    if (!asset) return {}
  }
  const { listPrice, maxBlindDiscount } = asset
  if (netPrice) {
    if (netPrice !== listPrice) {
      form.netPrice = listPrice
      return {calculateFormulas: true}
    }
  }
  else {
    form.netPrice = listPrice
    return {calculateFormulas: true}
  }

  if (!termQuote || !factor || !netPrice || !exchangeRate || !deliveryTime ||
      !netPriceMx || !priceMx || !fundedInsurance) {
    return {}
  }
  let { list } = await search({modelName: COST_OF_CAPITAL, filterResource: {current: true}, noTrigger: true})
  if (!list || !list.length) return {}
  let costOfCapital = list[0]

  let quotationDetails = []
  let ftype = getType(form)
  let model = getModel(ftype)
  let properties = model.properties
  let termsPropRef = properties.terms.items.ref
  const {
    deliveryFactor: configurationItems,
    minimumDeposit,
    lowDepositFactor: lowDepositPercent,
    presentValueFactor,
    // minXIRR
  } = costOfCapital
  let vendor
  if (asset.vendor) {
    let { list } = await search({modelName: getType(asset.vendor), filterResource: {_permalink: getRootHash(asset.vendor)}, noTrigger: true})
    vendor = list && list[0]
    if (vendor  && (!factor ||  factor < vendor.minFactor)) {
      factor = vendor.minFactor
      form.factor = factor
    }
  }
  let { residualValue } = asset
  let defaultQC = configurationItems[0]

  let formXIRR = form.xirr
  let formMonthlyPayment = form.monthlyPayment && form.monthlyPayment.value

  let depositVal = depositValue && depositValue.value || 0
  // blindDiscount = blindDiscount/100
  let iterateBy
  let goalProp
  let valuesToIterate = [null]
  let foundCloseGoal = true

  if (blindDiscount > maxBlindDiscount)
    form.blindDiscount = blindDiscount = maxBlindDiscount

  if (fixedProps  &&  Object.keys(fixedProps).length) {
    let goalSeekProps = model.goalSeek.filter(p => fixedProps[p] == null &&  !properties[p].readOnly)
    iterateBy = goalSeekProps.length && goalSeekProps[0]
    goalProp = model.goalSeek.find(p => fixedProps[p] != null  &&  properties[p].readOnly)
    if (!iterateBy) {
      return {
        message: translate('noIteratorPresent')
      }
    }
    if (iterateBy) {
      if (properties[iterateBy].type === 'object') {
        let pmodel = getModel(properties[iterateBy].ref)
        if (!pmodel || !pmodel.enum)
          iterateBy = null
        else
          valuesToIterate = pmodel.enum.map(v => {
            return {
              id: `${properties[iterateBy].ref}_${v.id}`,
              title: v.title
            }
          })
      }
      else if (properties[iterateBy].units === '%') {
        let start = 1 //form[goalSeekProp]
        if (iterateBy === 'residualValue') {
          let residualValuePerTerm = residualValue && residualValue.find(rv => {
            return rv.term.id === termQuote.id
          })
          valuesToIterate = Array(residualValuePerTerm.rv).fill().map((_, idx) => start + idx)
        }
        else if (iterateBy === 'blindDiscount')
          valuesToIterate = Array(maxBlindDiscount || 100).fill().map((_, idx) => start + idx)
        else
          valuesToIterate = Array(100).fill().map((_, idx) => start + idx)
      }
      foundCloseGoal = false
    }
  }
  let termQuoteVal = termQuote.title.split(' ')[0]
  let formErrors
  let currentGoalValue
  let prevBest
  let currentBest = {}
  let residualValueIterator
  for (let jj=0; jj<2; jj++) {
    for (let ii=0; ii<valuesToIterate.length; ii++) {
      let val = valuesToIterate[ii]

      let iterateByPropValue
      if (val) {
        switch (iterateBy) {
        case 'blindDiscount':
          blindDiscount = val
          break
        case 'deliveryTime':
          deliveryTime = val
          break
        case 'residualValue':
          residualValueQuote = val
          break
        }
        iterateByPropValue = val
      }

      let k = 0
      for (; k<configurationItems.length; k++) {
        let quotConf = configurationItems[k]
        let qc = cloneDeep(defaultQC)
        for (let p in quotConf)
          qc[p] = quotConf[p]

        let { term } = quotConf

        let residualValuePerTerm = residualValue && residualValue.find(rv => {
          return rv.term.id === term.id
        })
        if (!residualValuePerTerm)
          residualValuePerTerm = 0
        // residualValuePerTerm = residualValuePerTerm && residualValuePerTerm.rv / 100
        if (termQuote && term.id == termQuote.id) {
          if (residualValueQuote == null) {
            form.residualValue = residualValuePerTerm.rv
            residualValuePerTerm = residualValuePerTerm.rv
          }
          else if (residualValueQuote < residualValuePerTerm.rv)
            residualValuePerTerm = residualValueQuote
          else {
            form.residualValue = residualValuePerTerm.rv
            residualValuePerTerm = residualValuePerTerm.rv
          }
        }
        else if (residualValueQuote < residualValuePerTerm.rv)
          residualValuePerTerm = residualValueQuote
        else
          residualValuePerTerm = residualValuePerTerm.rv

        residualValuePerTerm = residualValuePerTerm / 100
        let termVal = term.title.split(' ')[0]
        let factorPercentage = mathRound(factor / 100 / 12 * termVal, 4)

        let dtID = deliveryTime.id.split('_')[1]
        let deliveryTermPercentage = qc[dtID] || 0
        let depositFactor = 0
        let lowDepositFactor
        if (depositPercentage < minimumDeposit)
          lowDepositFactor = termVal/12 * lowDepositPercent/100
        else
          lowDepositFactor = 0
        let totalPercentage = mathRound(1 + factorPercentage + deliveryTermPercentage + depositFactor + lowDepositFactor, 4)

        let factorVPdelVR = termVal/12 * presentValueFactor/100

        // let monthlyPayment = (priceMx.value - depositVal - (residualValuePerTerm * priceMx.value)/(1 + factorVPdelVR))/(1 + vatRate) * totalPercentage/termVal
        let blindDiscountVal = blindDiscount/100
        let monthlyPayment = (priceMx.value - depositVal * (1 + blindDiscountVal) - (residualValuePerTerm * priceMx.value)/(1 + factorVPdelVR))/(1 + vatRate) * totalPercentage/termVal * (1 - blindDiscountVal)

// =PMT(monthlyRateLease,term,(-priceMx/(1-monthlyRateLease)^(deliveryTime-delayedFunding))*(1-(deposit+blindDiscount)),residualValue*priceMx,0)

        if (goalProp === 'monthlyPayment' && iterateBy &&  termVal === termQuoteVal) {
          currentGoalValue = monthlyPayment
          ;({formErrors, foundCloseGoal, currentBest, prevBest} = checkBounds({
            property: properties.monthlyPayment,
            goalProp,
            value: monthlyPayment,
            formValue: formMonthlyPayment,
            fixedProps,
            valueToIterate: valuesToIterate[ii],
            currentBest,
            prevBest,
            currentGoalValue,
            formErrors,
            foundCloseGoal
          }))
        }

        let insurance = fundedInsurance.value
        let initialPayment = depositPercentage === 0 && monthlyPayment + insurance ||  depositVal / (1 + vatRate)
        let commissionFeeCalculated = priceMx.value * commissionFeePercent / 100
        let initialPaymentVat = (initialPayment + commissionFeeCalculated) * vatRate

        let currency = netPriceMx.currency
        let vatQc =  mathRound((monthlyPayment + insurance) * vatRate)
        let paymentFromVendor = (priceMx.value - depositVal) * discountFromVendor / 100
        let qd = {
          [TYPE]: termsPropRef,
          factorPercentage,
          deliveryTermPercentage,
          lowDepositFactor,
          term,
          commissionFee: {
            value: mathRound(commissionFeeCalculated),
            currency
          },
          initialPayment: initialPayment && {
            value: mathRound(initialPayment),
            currency
          },
          initialPaymentVat: initialPaymentVat && {
            value: mathRound(initialPaymentVat),
            currency
          },
          totalPercentage,
          totalInitialPayment: initialPayment && {
            value: mathRound(commissionFeeCalculated + initialPayment + initialPaymentVat),
            currency
          },
          monthlyPayment: monthlyPayment  &&  {
            value: mathRound(monthlyPayment),
            currency
          },
          monthlyInsurance: fundedInsurance,
          vatPerTerm: monthlyPayment && {
            value: vatQc,
            currency
          },
          totalPayment: monthlyPayment && {
            value: mathRound(monthlyPayment + insurance + vatQc),
            currency
          },
          purchaseOptionPrice: priceMx && {
            value: residualValuePerTerm ? mathRound(priceMx.value * residualValuePerTerm) : 1,
            currency
          },
        }
        if (paymentFromVendor) {
          qd.paymentFromVendor = {
            value: mathRound(paymentFromVendor),
            currency
          }
        }
        let totalPaymentLessInsuranceAndCommission = (qd.totalInitialPayment.value - qd.commissionFee.value * (1+vatRate))+(monthlyPayment*(1+vatRate)*termVal) + qd.purchaseOptionPrice.value
        if (totalPaymentLessInsuranceAndCommission) {
          qd.totalPaymentLessInsuranceAndCommission = {
            value: mathRound(totalPaymentLessInsuranceAndCommission),
            currency
          }
        }
        let payPerMonth = qd.monthlyPayment.value*(1 + vatRate)
        let initPayment = depositValue && depositValue.value > 0 ? qd.totalInitialPayment.value : payPerMonth
        let blindPayment = priceMx.value * blindDiscountVal
        if (blindPayment) {
          qd.blindPayment = {
            value: blindPayment,
            currency
          }
        }
        let d = new Date()
        let date = dateformat(d.getTime(), 'yyyy-mm-dd')

        let data = [
          {amount: -priceMx.value, date},
          {amount: initPayment, date},
          {amount: blindPayment, date}
        ]
        let m = d.getMonth()
        let firstMonth = deliveryTime.id.split('_')[1].split('dt')[1]

        for (let j=0; j<termVal - 1; j++) {
          nextMonth(d, j ? 1 : parseInt(firstMonth))
          let md = dateformat(d.getTime(), 'yyyy-mm-dd')
          data.push({amount: payPerMonth, date: md})
        }
        nextMonth(d, 1)
        data.push({amount: payPerMonth + qd.purchaseOptionPrice.value, date: dateformat(d.getTime(), 'yyyy-mm-dd')})

        const {days, rate} = xirr(data)
        let xirrVal = Math.round(convertRate(rate, 365) * 100 * 100)/100

        const irrData = data.map(d => d.amount)
        const irrRate = irr(irrData)
        let irrVal = Math.round(irrRate * 100 * 100)/100

        let minXIRR = calcMinXIRR({costOfCapital, asset, vendor, term, termProp: properties.term})
        let inBounds
        // if (termVal === termQuoteVal) {
        ;({formErrors, foundCloseGoal, currentBest, prevBest, inBounds} = checkBounds({
          property: properties.xirr,
          goalProp,
          value: xirrVal,
          minValue: minXIRR,
          formValue: formXIRR,
          fixedProps,
          valueToIterate: valuesToIterate[ii],
          currentBest,
          prevBest,
          currentGoalValue,
          formErrors,
          foundCloseGoal,
          boundsOnly: termVal !== termQuoteVal
        }))
        // }
        if (!inBounds)
          continue

        if (iterateBy) {
          qd[iterateBy] = iterateByPropValue
          form[iterateBy] = iterateByPropValue
        }
        qd.xirr = xirrVal
        qd.irr = irrVal
        qd = sanitize(qd).sanitized
        quotationDetails.push(qd)
      }
      // if (k < configurationItems.length || (iterateBy && !currentBest && !jj)) {
      if (!jj  &&  goalProp) {
        for (let kj=0; kj<k; kj++)
          quotationDetails.pop()
      }
      else
        break
    }
    if (!size(currentBest) || jj || !goalProp)
      break
    valuesToIterate = [currentBest.valuesToIterate]
  }
  let message
  if (!foundCloseGoal) {
    if (goalProp  &&  formErrors  &&  !formErrors.goalProp) {
      let key = Object.keys(formErrors)[0]
      message = translate('boundsError', `${formErrors[key]}`)
      formErrors = null
    }
  }
  let terms = ''
  if (formErrors  ||  quotationDetails.length !== configurationItems.length) {
    if (quotationDetails.length) {
      quotationDetails.forEach((t, i ) => {
        if (i)
          terms += '    '
        if (formErrors && t.term.id === termQuote.id)
          terms += `${t.term.title.split(' ')[0]} ❌`
        else
          terms += `${t.term.title.split(' ')[0]} ✅`
      })
      if (quotationDetails.length < configurationItems.length) {
        let notQD = configurationItems.filter(ci => !quotationDetails.find(qd => qd.term.id === ci.term.id))
        notQD.forEach((t, i ) => {
          terms += '    '
          terms += `${t.term.title.split(' ')[0]} ❌`
        })
      }
    }
    else
      configurationItems.forEach((t, i ) => {
        if (i)
          terms += '    '
        terms += `${t.term.title.split(' ')[0]} ❌`
      })
    if (!formErrors)
      formErrors = {}
    formErrors.term = `Warning: ${terms}`
  }
  return {
    prefill: {
      terms: quotationDetails,
    },
    formErrors,
    message,
    costOfCapital,
    foundCloseGoal
  }
}
function nextMonth(date, numberOfMonths) {
  let m = date.getMonth() + numberOfMonths
  if (m && m % 12 === 0) {
    m = 0
    date.setFullYear(date.getFullYear() + 1)
  }

  date.setMonth(m)
}

function mathRound(val, digits) {
  if (!digits)
    digits = 2
  let pow = Math.pow(10, digits)
  return Math.round(val * pow)/pow
}
function calcMinXIRR({costOfCapital, asset, vendor, term, termProp}) {
  let minXIRR = costOfCapital.minXIRR
  let adj
  if (asset.xirrAdjustmentPerTerm) {
    let adjPerTerm = asset.xirrAdjustmentPerTerm.find(r => r.term.id === term.id)
    if (adjPerTerm)
      adj = adjPerTerm.xirrAdjustment
  }
  if (!adj  &&  asset.xirrAdjustment)
    adj = asset.xirrAdjustment
  if (!adj  &&  vendor  &&  vendor.xirrAdjustment)
    adj = vendor.xirrAdjustment
  minXIRR += adj
  // now apply increment for term
  let termModel = getModel(termProp.ref)
  let currentTerm = termModel.enum.find(t => term.id.endsWith(`_${t.id}`))
  if (currentTerm && currentTerm.coef)
    minXIRR += costOfCapital.xirrIncrement * currentTerm.coef

  return minXIRR
}
function checkBounds({
  property,
  goalProp,
  value,
  minValue,
  maxValue,
  formValue,
  fixedProps,
  valueToIterate,
  currentBest,
  prevBest,
  currentGoalValue,
  formErrors,
  foundCloseGoal,
  boundsOnly
}) {
  const prop = property.name
  let inBounds = true
  if ((minValue && value < minValue) ||  (maxValue  &&  value > maxValue)) {
    if (boundsOnly)
      inBounds = false
    if (!fixedProps || !currentBest[prop]) {
      currentBest = {}
      if (prevBest) {
        currentBest = prevBest
        prevBest = null
      }
      else  if (!boundsOnly) {
        foundCloseGoal = false
        formErrors = {
          [prop]: translate('boundsLessError', prop, value, minValue)
        }
      }
    }
  }
  else if (!boundsOnly) {
    if (goalProp === prop  &&  fixedProps[prop] != null) {
      foundCloseGoal = true
      let diff
      if (currentBest[prop])
        diff = Math.abs(currentBest[prop] - formValue) > Math.abs(value - formValue)

      if (!currentBest[prop] || diff) {
        prevBest = currentBest || null
        currentBest = {
          [prop]: value,
          valuesToIterate: valueToIterate
        }
      }
    }
    else if (currentBest[goalProp] && currentBest[goalProp] === currentGoalValue)
      currentBest[prop] = value

    if (formErrors && formErrors[prop])
      formErrors = null
  }
  return { formErrors, foundCloseGoal, currentBest, prevBest, inBounds }
}
