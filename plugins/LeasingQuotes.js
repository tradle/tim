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
      search
    }) {
      if (!getMe().isEmployee || !application) return
      const ftype = form[TYPE]
      if (!ftype.endsWith('.Quote')) return
      // if (ftype.endsWith(QUOTATION_DETAILS))
      //   return await chooseDetail(form, models)
      // if (ftype.endsWith(QUOTE)) {
        let {costOfCapital} = await getQuote({form, models, search, currentResource})
        return chooseDetail({form, models, costOfCapital})
      // }
    }
  }
}
function chooseDetail({form, models, costOfCapital}) {
  let ftype = getType(form)
  const m = models[ftype]

  if (!m) return

  let termsPropRef = m.properties.terms.items.ref
  let requestedProperties
  if (!form.term) {
    return
    // requestedProperties = [{name: 'term'}]
    // return ftype === getModel(termsPropRef) && { requestedProperties }
  }
  let terms = form.terms
  if (!terms) return

  let termId = form.term.id
  let term = terms.find(t => t.term.id === termId)

  extend(form, term)
  form[TYPE] = ftype

  if (!costOfCapital) return
  if (form.xirr > costOfCapital.minIRR)
    form.approve = true
  else
    form.approve = false
}
async function getQuote({form, models, search, currentResource}) {
  let model = models[getType(form)]
  if (!model) return {}

  let { prefill, costOfCapital } = await quotationPerTerm({form, search, currentResource})
  if (!prefill) return {}
  extend(form, prefill)
  return { costOfCapital }
}
async function quotationPerTerm({form, search, currentResource}) {
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
  if (!factor || !netPrice || !exchangeRate || !deliveryTime ||
      !netPriceMx || !priceMx || !fundedInsurance) {
    return {}
  }
  debugger
  let { list } = await search({modelName: COST_OF_CAPITAL, filterResource: {current: true}, noTrigger: true})
  if (!list || !list.length) return {}
  let costOfCapital = list[0]

  let quotationDetails = []
  let ftype = getType(form)
  let termsPropRef = getModel(ftype).properties.terms.items.ref
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

  let depositVal = depositValue && depositValue.value || 0
  blindDiscount = blindDiscount/100

  configurationItems.forEach((quotConf, i) => {
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
    // blindDiscount = blindDiscount/100
    let monthlyPayment = (priceMx.value - depositVal * (1 + blindDiscount) - (residualValuePerTerm * priceMx.value)/(1 + factorVPdelVR))/(1 + vatRate) * totalPercentage/termVal * (1 - blindDiscount)
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
      paymentFromVendor: paymentFromVendor && {
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
    let blindPayment = priceMx.value * blindDiscount
    let d = new Date()
    let date = dateformat(d.getTime(), 'yyyy-mm-dd')

    let data = [
      {amount: -priceMx.value, date},
      {amount: initPayment, date},
      {amount: blindPayment, date}
    ]
    let m = d.getMonth()
    for (let j=0; j<termVal - 1; j++) {
      nextMonth(d)
      let md = dateformat(d.getTime(), 'yyyy-mm-dd')
      data.push({amount: payPerMonth, date: md})
    }
    nextMonth(d)
    data.push({amount: payPerMonth + qd.purchaseOptionPrice.value, date: dateformat(d.getTime(), 'yyyy-mm-dd')})

    const {days, rate} = xirr(data)
    qd.xirr = Math.round(convertRate(rate, 365) * 100 * 100)/100

    qd = sanitize(qd).sanitized
    quotationDetails.push(qd)
  })
  return {
    prefill: {
      // type: ftype,
      terms: quotationDetails,
    },
    costOfCapital
  }
}
function nextMonth(date) {
  let m = date.getMonth() + 1
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
function nextMonth(date) {
  let m = date.getMonth() + 1
  if (m && m % 12 === 0) {
    m = 0
    date.setFullYear(date.getFullYear() + 1)
  }

  date.setMonth(m)
}
