const { xirr, convertRate } = require('node-irr')
import dateformat from 'dateformat'
import cloneDeep from 'lodash/cloneDeep'
import size from 'lodash/size'
import extend from 'lodash/extend'
import { TYPE } from '@tradle/constants'
import { getMe, getModel, getType, getCurrentHash, isStub } from '../utils/utils'
import validateResource from '@tradle/validate-resource'
// @ts-ignore
const { sanitize } = validateResource.utils

const COST_OF_CAPITAL = 'tradle.credit.CostOfCapital'

module.exports = function LeasingQuotes ({ models }) {
  return {
    validateForm: async function validateForm ({
      application,
      form,
      currentResource,
      search,
      fixedProps={}
    }) {
      if (!getMe().isEmployee || !application) return
      const ftype = form[TYPE]
      if (!ftype.endsWith('.Quote')) return
      // if (ftype.endsWith(QUOTATION_DETAILS))
      //   return await chooseDetail(form, models)
      // if (ftype.endsWith(QUOTE)) {
        let {costOfCapital, foundCloseGoal} = await getQuote({form, models, search, currentResource, fixedProps})
        if (!foundCloseGoal  &&  fixedProps  &&  size(fixedProps))
          return {
            recalculate: true
          }
        chooseDetail({form, models, costOfCapital})
      // }
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
  debugger
  form.finalNoteValue = {
    currency: monthlyPayment.currency,
    value: Math.round(monthlyPayment.value * chosenTerm.id.split('_t')[1] - purchaseOptionPrice.value)
  }

  if (!costOfCapital) return
  if (form.xirr > costOfCapital.minIRR)
    form.approve = true
  else
    form.approve = false
}
async function getQuote({form, models, search, currentResource, fixedProps}) {
  let model = models[getType(form)]
  if (!model) return {}

  let { prefill, costOfCapital, foundCloseGoal } = await quotationPerTerm({form, search, currentResource, fixedProps})
  if (!prefill) return {}
  extend(form, prefill)
  return { costOfCapital, foundCloseGoal }
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
  if (!termQuote || !factor || !netPrice || !exchangeRate || !deliveryTime ||
      !netPriceMx || !priceMx || !fundedInsurance) {
    return {}
  }
  debugger
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
  } = costOfCapital
  if (isStub(asset)) {
    let { list } = await search({modelName: getType(asset), filterResource: {_link: getCurrentHash(asset)}, noTrigger: true})
    asset = list && list[0]
    if (!asset) return {}
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

  if (fixedProps  &&  Object.keys(fixedProps).length) {
    let goalSeekProps = model.goalSeek.filter(p => !fixedProps[p]  &&  !properties[p].readOnly)
    iterateBy = goalSeekProps.length && goalSeekProps[0]
    goalProp = model.goalSeek.find(p => fixedProps[p]  &&  properties[p].readOnly)
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
        valuesToIterate = Array(100).fill().map((_, idx) => start + idx)
      }
      foundCloseGoal = false
    }
  }
  let termQuoteVal = termQuote.title.split(' ')[0]
  for (let ii=0; ii<valuesToIterate.length; ii++) {
    let val = valuesToIterate[ii]

    let iterateByPropValue
    if (val) {
      if (iterateBy === 'blindDiscount')
        blindDiscount = val
      else if (iterateBy === 'deliveryTime')
        deliveryTime = val

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
        if (!residualValueQuote) {
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

      if (goalProp === 'monthlyPayment' && iterateBy &&  termVal === termQuoteVal) {
        if (Math.abs(monthlyPayment - formMonthlyPayment) > formMonthlyPayment/100)
          break
        foundCloseGoal = true
      }

      // let monthlyPaymentPMT = (vatRate/12)/(((1+vatRate/12)**termVal)-1)*(netPriceMx.value*((1+vatRate/12)**termVal)-(netPriceMx.value*residualValue/100))

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
          value: mathRound(priceMx.value * residualValuePerTerm),
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
      if (goalProp === 'xirr'  &&  iterateBy  && fixedProps.xirr &&  termVal === termQuoteVal) {
        if (formXIRR > xirrVal) {
          // if (ii !== valuesToIterate.length - 1)
          //   break
          if (Math.abs(formXIRR - xirrVal) > 1)
            break
        }
        foundCloseGoal = true
      }
      if (iterateBy) {
        qd[iterateBy] = iterateByPropValue
        form[iterateBy] = iterateByPropValue
      }
      qd.xirr = xirrVal
      qd = sanitize(qd).sanitized
      quotationDetails.push(qd)
    }
    if (k < configurationItems.length) {
      for (let jj=0; jj<k; jj++)
        quotationDetails.pop()
    }
    else
      break
  }
  return {
    prefill: {
      // type: ftype,
      terms: quotationDetails,
    },
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
