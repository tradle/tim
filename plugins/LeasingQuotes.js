import { xirr, convertRate, irr } from 'node-irr'
import { pmt, pv } from 'financial'
import dateformat from 'dateformat'
import cloneDeep from 'lodash/cloneDeep'
import size from 'lodash/size'
import extend from 'lodash/extend'
import isEqual from 'lodash/isEqual'
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

      let {costOfCapital, foundCloseGoal, formErrors, message, doTable} = await getQuote({form, models, search, currentResource, fixedProps, application})
      if (!foundCloseGoal  &&  fixedProps  &&  size(fixedProps))
        return {
          recalculate: true,
          message,
          formErrors,
          doTable
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
        form,
        doTable
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

  let { prefill, costOfCapital, foundCloseGoal, formErrors, message, calculateFormulas, doTable } = await quotationPerTerm({form, search, currentResource, fixedProps})
  if (prefill) {
    extend(form, prefill)
    return { costOfCapital, foundCloseGoal, formErrors, message, doTable }
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
    delayedFunding = 0,
    residualValue: residualValueQuote
  } = quotationInfo

  if (!asset)
    return {}

  if (isStub(asset)) {
    let { list } = await search({modelName: getType(asset), filterResource: {_permalink: getRootHash(asset)}, noTrigger: true, allow: true})
    asset = list && list[0]
    if (!asset) return {}
  }
  const { listPrice, maxBlindDiscount } = asset
  if (netPrice) {
    if (netPrice.value !== listPrice.value) {
      form.netPrice = listPrice
      return {calculateFormulas: true}
    }
  }
  else {
    form.netPrice = listPrice
    return {calculateFormulas: true}
  }

  let globalBounds = {}
  if (maxBlindDiscount)
    globalBounds.blindDiscount = {
      max: maxBlindDiscount
    }
  if (!termQuote || !factor || !netPrice || !exchangeRate || !deliveryTime ||
      !netPriceMx || !priceMx || !fundedInsurance) {
    return {}
  }
  let { list } = await search({modelName: COST_OF_CAPITAL, filterResource: {current: true}, noTrigger: true, allow: COST_OF_CAPITAL})
  if (!list || !list.length) return {}
  let costOfCapital = list[0]

  let quotationDetails = []
  let loanQuotationDetail = {}

  let ftype = getType(form)
  let model = getModel(ftype)
  let properties = model.properties
  let termsPropRef = properties.terms.items.ref
  let {
    deliveryFactor: configurationItems,
    minimumDeposit,
    lowDepositFactor: lowDepositPercent,
    presentValueFactor,
    monthlyRateLease = 0,
    monthlyRateLoan = 0
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
  monthlyRateLease /= 100
  monthlyRateLoan /= 100
  let defaultQC = configurationItems[0]

  let formXIRR = form.xirr
  let formMonthlyPayment = form.monthlyPayment && form.monthlyPayment.value

  let depositVal = depositValue && depositValue.value || 0
  // blindDiscount = blindDiscount/100
  let iterateBy
  let goalProp
  let valuesToIterate = [null]
  let foundCloseGoal = true
  let realTimeCalculations

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
          if (!residualValuePerTerm)
            residualValuePerTerm = {rv: 0}
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
  else {
    valuesToIterate = [depositPercentage, 20, 25, 30, 35, 40, 50]
    iterateBy = 'depositPercentage'
    realTimeCalculations = true
  }
  let termQuoteVal = termQuote.title.split(' ')[0]
  let formErrors
  let currentGoalValue
  let goalSeekSuccess
  let iterations = {}
  let residualValueIterator
  let finalBest = {}
  let valueToIterate
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
        case 'depositPercentage':
          depositPercentage = val
          break
        }
        iterateByPropValue = val
      }

      let k = 0
      let currentBest = {}
      iterations[val] = currentBest
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
          residualValuePerTerm = {rv: 0}
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

        currentBest[term.id] = {
          monthlyPayment
        }
        if (goalProp === 'monthlyPayment' && iterateBy &&  termVal === termQuoteVal) {
          currentGoalValue = monthlyPayment
          ;({formErrors, foundCloseGoal, currentBest} = checkBounds({
            term,
            termQuote,
            property: properties.monthlyPayment,
            goalProp,
            value: monthlyPayment,
            formValue: formMonthlyPayment,
            fixedProps,
            valueToIterate: valuesToIterate[ii],
            currentBest,
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
        let termIRR = parseInt(termVal)
        let deliveryTimeLoan = dtID.split('dt')[1] - 1
        let deposit = depositPercentage/100
        let delayedFundingVal = delayedFunding && delayedFunding.id.split('_df')[1] || 0

        let monthlyPaymentLoan = (priceMx.value - deposit * priceMx.value) / termIRR
        if (monthlyPaymentLoan) {
          qd.monthlyPaymentLoan = {
            value: mathRound(monthlyPaymentLoan),
            currency
          }
        }

        let monthlyPaymentLease = pmt(monthlyRateLease, termIRR, -priceMx.value / Math.pow((1 - monthlyRateLease), (deliveryTimeLoan - delayedFundingVal)) * (1 - (deposit + blindDiscountVal)), residualValuePerTerm * priceMx.value, 0)
        if (monthlyPaymentLease && monthlyPaymentLease !== Infinity) {
          qd.monthlyPaymentLease= {
            value: mathRound(monthlyPaymentLease),
            currency
          }
        }
        let finCostLoan = (pv(monthlyRateLoan, termIRR, monthlyPaymentLoan, residualValuePerTerm, 0) / (priceMx.value * (1 - deposit)) + 1) * (1 - deposit)
        if (finCostLoan)
          qd.finCostLoan = mathRound(finCostLoan * 100, 2)
        if (realTimeCalculations) {
          addToLoanQuotationDetail({loanQuotationDetail, term: termIRR, deliveryTimeLoan, delayedFundingVal, residualValuePerTerm, quotationInfo, qd, deposit})
          if (ii)
            continue
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

        if (!currentBest[term.id])
          currentBest[term.id] = {}
        if (!currentBest[term.id].min)
          currentBest[term.id].min = {}
        currentBest[term.id].min.xirr = minXIRR
        currentBest[term.id].xirr = xirrVal

        // if (termVal === termQuoteVal) {
        let inBounds
        ;({formErrors, foundCloseGoal, currentBest, inBounds} = checkBounds({
          term,
          termQuote,
          property: properties.xirr,
          goalProp,
          value: xirrVal,
          formValue: formXIRR,
          fixedProps,
          valueToIterate: valuesToIterate[ii],
          currentBest,
          currentGoalValue,
          formErrors,
          foundCloseGoal,
          // boundsOnly: termVal !== termQuoteVal
        }))
        // }
        if (!inBounds) {
          currentBest = {}
          break
        }

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
      else if (!iterateBy)
        break
    }
    let ilen = size(iterations)
    if (ilen === 1)
      finalBest = Object.values(iterations)[0]
    if (!ilen || jj || !goalProp || foundCloseGoal)
      break

    // if (!size(currentBest) || jj || !goalProp)
    //   break
    // valuesToIterate = [currentBest.valuesToIterate]
    ;({ valueToIterate, finalBest, foundCloseGoal } = findBest({iterations, iterateBy, goalProp, form})) // [currentBest.valuesToIterate]
    if (valueToIterate === -1)
      break
    iterations = {}
    goalSeekSuccess = foundCloseGoal
    valuesToIterate = [valueToIterate]
  }
  foundCloseGoal = goalSeekSuccess || foundCloseGoal
  let message
  let terms = ''

  if (size(finalBest)  &&  !formErrors) { //  &&  !goalSeekSuccess && !foundCloseGoal) {
    let i = 0
    for (let t in finalBest) {
      if (i++)
        terms += '    '
      if (finalBest[t].formErrors) {
        terms += `${t.split('_t')[1]} ❌`
        if (/*goalProp &&*/ t === termQuote.id)
          message = finalBest[t].formErrors[goalProp]
      }
      else
        terms += `${t.split('_t')[1]} ✅`
    }
    if (!formErrors)
      formErrors = {}
    formErrors._info = `${terms}`
  }
  return {
    prefill: {
      terms: quotationDetails,
      loanQuotationDetail
    },
    formErrors,
    doTable: size(loanQuotationDetail) && 'loanQuotationDetail',
    message,
    costOfCapital,
    foundCloseGoal
  }
}
function findBest({iterations, iterateBy, goalProp, form}) {
  // debugger
  let goalPropValue = form[goalProp]
  let term = form.term
  let numberOfTerms
  let filtered = {}
  let successfulTerms = {}
  for (let t in iterations) {
    let results = iterations[t]
    if (!numberOfTerms)
      numberOfTerms = size(results)
    let j = 0
    for (let r in results) {
      if (results[r].formErrors)
        continue
      j++
    }
    let st = successfulTerms[j]
    if (!st)
      st = successfulTerms[j] = {}
    st[t] = iterations[t]
    // if (j === numberOfTerms)
    //   filtered[t] = iterations[t]
  }
  for (let i=numberOfTerms; i>0 && !size(filtered); i--) {
    let s = successfulTerms[i]
    if (s)
      filtered[i] = s
  }
  if (!size(filtered))
    return {valueToIterate: -1, currentBest: Object.values(iterations)[0], foundCloseGoal: false}
  filtered = Object.values(filtered)[0]
  if (size(filtered) === 1) {
    let val = Object.keys(filtered)[0]
    return {valueToIterate: val, currentBest: filtered[val], foundCloseGoal: true}
  }
  let finalBest = {}
  let { properties } = getModel(form[TYPE])
  let currentIterateBy
  for (let key in filtered) {
    let rr = filtered[key]
    for (let c in rr) {
      for (let t in rr) {
        if (t !== term.id)
          continue
        let r = rr[t]
        if (!size(finalBest)) {
          finalBest = r
          currentIterateBy = key
          continue
        }
        let currentVal = r[goalProp]
        let finalBestVal = finalBest[goalProp]
        if (Math.abs(currentVal - goalPropValue) < Math.abs(finalBestVal - goalPropValue)) {
          finalBest = r
          currentIterateBy = key
        }
      }
    }
  }
  return { valueToIterate: currentIterateBy, finalBest, foundCloseGoal: true }
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
  term,
  termQuote,
  property,
  goalProp,
  // value,
  formValue,
  fixedProps,
  valueToIterate,
  currentBest,
  currentGoalValue,
  formErrors,
  foundCloseGoal,
}) {
  const prop = property.name
  let tId = term.id
  let cb = currentBest[tId]
  let {min, max} = cb || {}
  let minValue = min && min[prop]
  let maxValue = max && max[prop]
  let value = cb[prop]
  // cb[prop] = value
  if ((minValue && value < minValue) ||  (maxValue  &&  value > maxValue)) {
    cb.formErrors = {
      [prop]: translate('boundsLessError', prop, value, minValue)
    }
  }
  else {
    if (goalProp === prop  &&  fixedProps[prop] != null) {
      foundCloseGoal = true
      let diff

      if (cb[prop])
        diff = Math.abs(cb[prop] - formValue) > Math.abs(value - formValue)

      if (!cb[prop] || diff)
        cb[prop] = value
    }
    else if (cb[goalProp] && cb[goalProp] === currentGoalValue)
      cb[prop] = value
  }
  return {currentBest, inBounds: true}
}

function addToLoanQuotationDetail({
  loanQuotationDetail,
  term,
  deliveryTimeLoan,
  delayedFundingVal,
  residualValuePerTerm,
  deposit,
  quotationInfo,
  qd
}) {
  let {
    priceMx,
    vatRate,
    blindDiscount
  } = quotationInfo
  let {
    commissionFee: commissionFeeCalculated,
    finCostLoan,
    monthlyPaymentLease,
    monthlyPaymentLoan,
  } = qd
  let leaseIRR = []
  let loanIRR = []
  let leaseXIRR = []
  let loanXIRR = []

  let termIRR = term + deliveryTimeLoan

  finCostLoan = finCostLoan / 100
  let initialPayment = (priceMx.value * deposit) + (commissionFeeCalculated.value * (1 + vatRate))

  let d = new Date()
  let month = d.getTime()
  let month1 = month;

  let leasea = 0
  let leaseb = 0
  let loana = 0
  let loanb = 0
  let finalPayment = 0

  // IRR lease and loan
  for (let i=0; i <= termIRR; i++) {
    if (deliveryTimeLoan < i) {
      if (i - deliveryTimeLoan > termIRR) {
        leasea = 0
        loana = 0
      } else {
        leasea = monthlyPaymentLease.value
        loana = monthlyPaymentLoan.value
      }
    }
    if (delayedFundingVal === i) {
      leaseb = -priceMx.value
      loanb = -priceMx.value
    } else {
      leaseb = 0
      loanb = 0
    }
    if (i === 0) {
      leaseIRR.push(deposit * priceMx.value + leaseb)
      loanIRR.push(deposit * priceMx.value + loanb + finCostLoan * priceMx.value)
    } else if (i > 0) {
      if (i === termIRR)
        finalPayment = (residualValuePerTerm * priceMx.value + monthlyPaymentLease.value) - leasea - leaseb

      leaseIRR.push(leasea + leaseb + finalPayment)
      loanIRR.push(loana + loanb)
    }
  }

  // XIRR lease and loan
  nextMonth(d, delayedFundingVal)
  month = d.getTime()
  let date = dateformat(d.getTime(), 'yyyy-mm-dd')

  leaseXIRR.push({
    date,
    amount: -priceMx.value
  })
  loanXIRR.push({
    date,
    amount: -priceMx.value
  })
  leaseXIRR.push({
    date,
    amount: priceMx.value * blindDiscount / 100
  })
  loanXIRR.push({
    date,
    amount: -priceMx.value * finCostLoan * -1
  })
  month = month1
  leaseXIRR.push({
    date,
    amount: initialPayment
  })
  loanXIRR.push({
    date,
    amount: initialPayment
  })

  d = new Date()
  month = d.getTime()
  date = dateformat(d.getTime(), 'yyyy-mm-dd')
  nextMonth(d, 1 + deliveryTimeLoan)
  month = d.getTime()
  leaseXIRR.push({
    date,
    amount: monthlyPaymentLease.value
  })
  loanXIRR.push({
    date,
    amount: monthlyPaymentLoan.value
  })
  leasea = 0

  for (let x=1; x < term; x++) {
    nextMonth(d, 1)
    date = dateformat(d.getTime(), 'yyyy-mm-dd')
    if (x < term-1)
      leasea = monthlyPaymentLease.value
    else
      leasea = monthlyPaymentLease.value + (residualValuePerTerm * priceMx.value)

    leaseXIRR.push({
        date,
        amount: leasea
    })
    loanXIRR.push({
        date,
        amount: monthlyPaymentLoan.value
    })
    x++
  }
  //console.log(leaseIRR)
  //console.log(loanIRR)
  //console.log("leaseXIRR",leaseXIRR)
  //console.log("loanXIRR",loanXIRR)


  let { rate } = xirr(leaseXIRR)
  let xirrLease = Math.round(convertRate(rate, 365) * 10000) / 100

  let { rate:loanRate } = xirr(loanXIRR)
  let xirrLoan = Math.round(convertRate(loanRate, 365) * 10000) / 100

  let irrLoan = irr(loanIRR)
  let irrLease = irr(leaseIRR)


  // console.log("term", term,"leaseIRR", irr(leaseIRR), "loanIRR", irr(loanIRR),"leaseXIRR", xirrLease, "loanXIRR", xirrLoan)

  let p = deposit * 100 + ''
  let elm = loanQuotationDetail[p]
  if (!elm)
    loanQuotationDetail[p] = {}
  loanQuotationDetail[p][term] = {
    finCostLoan: qd.finCostLoan,
    term: termIRR,
    xirrLoan,
    xirrLease,
    irrLoan,
    irrLease,
    depositPercentage: deposit * 100
  }
}
