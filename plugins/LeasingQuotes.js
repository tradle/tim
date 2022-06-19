import { xirr, convertRate, irr } from 'node-irr'
import { pmt, pv } from 'financial'
import dateformat from 'dateformat'
import cloneDeep from 'lodash/cloneDeep'
import size from 'lodash/size'
import extend from 'lodash/extend'
import { TYPE } from '@tradle/constants'
import { getMe, getModel, getType, getRootHash, isStub, translate, formatCurrency } from '../utils/utils'
import validateResource from '@tradle/validate-resource'
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
      additionalInfo={}
    }) {
      if (!getMe().isEmployee || !application) return

      let form = cloneDeep(formOrig)
      const ftype = form[TYPE]
      if (!ftype.endsWith('.Quote')) return

      let { fixedProps, calculatingForLoan, first } = additionalInfo || {}
      if (first)
        return
      if (calculatingForLoan) {
        return {
          form,
          requestedProperties: [],
          doTable: 'loanQuotationDetail'
        }
      }
      let {costOfCapital, foundCloseGoal, formErrors, message, doTable, requestedProperties} = await getQuote({form, models, search, currentResource, additionalInfo, application})
      if (!foundCloseGoal  &&  fixedProps  &&  size(fixedProps))
        return {
          recalculate: true,
          requestedProperties,
          message,
          formErrors,
          doTable
        }
      chooseDetail({form, models, costOfCapital, additionalInfo})
      if (formErrors)
        return {
          recalculate: size(formErrors) > 1,
          message,
          requestedProperties,
          formErrors,
          doTable,
          form //: !size(fixedProps) ? form : null
        }
      if (message) {
        return {
          recalculate: true,
          requestedProperties,
          message
        }
      }
      return {
        form,
        requestedProperties: requestedProperties || getRequestedProperties(form),
        doTable
      }
    }
  }
}
function chooseDetail({form, models, costOfCapital, additionalInfo}) {
  let ftype = getType(form)
  const m = models[ftype]

  if (!m) return

  if (!form.term)
    return

  let { terms, loanTerms, loanTerm } = form
  if (!terms) return

  let term
  let termId = form.term.id
  term = terms.find(t => t.term.id === termId)

  extend(form, term)

  if (loanTerm && loanTerms)
    extend(form, loanTerms)

  form[TYPE] = ftype
  let { monthlyPayment, term:chosenTerm, purchaseOptionPrice } = form

  let isLoan = loanTerm && chosenTerm.id === loanTerm.id
  if (!isLoan) {
    form.finalNoteValue = {
      currency: monthlyPayment.currency,
      value: Math.round(monthlyPayment.value * chosenTerm.id.split('_t')[1] - purchaseOptionPrice.value)
    }
  }
  if (!costOfCapital) return
  if (form.xirr > costOfCapital.minXIRR)
    form.approve = true
  else
    form.approve = false
}
async function getQuote({form, models, search, currentResource, additionalInfo, application}) {
  let model = models[getType(form)]
  if (!model) return {}

  let { prefill, costOfCapital, foundCloseGoal, formErrors, message, calculateFormulas, doTable, requestedProperties } = await quotationPerTerm({form, search, currentResource, additionalInfo})
  if (prefill) {
    extend(form, prefill)
    return { costOfCapital, foundCloseGoal, formErrors, message, doTable, requestedProperties }
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
async function quotationPerTerm({form, search, currentResource, additionalInfo}) {
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
    residualValue: residualValueQuote,
    loanTerm,
    loanDeposit
  } = quotationInfo
  if (!asset)
    return {}

  if (isStub(asset)) {
    let { list } = await search({modelName: getType(asset), filterResource: {_permalink: getRootHash(asset)}, noTrigger: true, allow: true})
    asset = list && list[0]
    if (!asset) return {}
  }
  const { listPrice, maxBlindDiscount, allowLoan } = asset
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

  let {
    deliveryFactor: configurationItems,
    minimumDeposit,
    lowDepositFactor: lowDepositPercent,
    presentValueFactor,
    monthlyRateLease = 0,
    monthlyRateLoan = 0,
    maxDeposit=50,
    minXIRR
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

  let { fixedProps } = additionalInfo
  let formXIRR = form.xirr

  let formMonthlyPayment = form.monthlyPayment && form.monthlyPayment.value

  let depositVal = depositValue && depositValue.value || 0

  // blindDiscount = blindDiscount/100
  let iterateBy
  let goalProp
  let valuesToIterate = [null]
  let foundCloseGoal = true
  let realTimeCalculations
  let originalDepositPercentage = depositPercentage

  if (depositPercentage > maxDeposit)
    form.depositPercentage = depositPercentage = maxDeposit
  if (blindDiscount > maxBlindDiscount)
    form.blindDiscount = blindDiscount = maxBlindDiscount

  let ftype = getType(form)
  let model = getModel(ftype)
  let properties = model.properties

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
        else if (iterateBy === 'depositPercentage')
          valuesToIterate = Array(maxDeposit).fill().map((_, idx) => start + idx)
        else
          valuesToIterate = Array(100).fill().map((_, idx) => start + idx)
      }
      foundCloseGoal = false
    }
  }
  else if (allowLoan) {
    valuesToIterate = [depositPercentage, 10, 15, 20, 25, 30, 35, 40, 50]
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
  let loanTermInt = loanTerm && parseInt(loanTerm.title.split(' ')[0])
  let quotationDetails = []
  let loanQuotationDetail = {}
  let termsPropRef = properties.terms.items.ref
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
      if (realTimeCalculations && ii || iterateBy === 'depositPercentage')
        depositVal = (netPrice.value * exchangeRate * vatRate + netPrice.value * exchangeRate) * depositPercentage/100 || 0

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
        let deliveryTimeLoan = dtID.split('dt')[1] - 1
        let deposit = depositPercentage/100
        let delayedFundingVal = delayedFunding && parseInt(delayedFunding.id.split('_df')[1]) || 0


        let termInt = parseInt(termVal)
        let monthlyPaymentLease = pmt(monthlyRateLease, termInt, -priceMx.value / Math.pow((1 - monthlyRateLease), (deliveryTimeLoan - delayedFundingVal)) * (1 - (deposit + blindDiscountVal)), residualValuePerTerm * priceMx.value, 0)
        if (monthlyPaymentLease && monthlyPaymentLease !== Infinity) {
          qd.monthlyPaymentLease = {
            value: mathRound(monthlyPaymentLease),
            currency
          }
        }
        let payPerMonth = qd.monthlyPayment.value * (1 + vatRate)
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

        let numberOfMonthlyPayments = depositPercentage ?  termVal - 1 : termVal - 2

        for (let j=0; j<numberOfMonthlyPayments; j++) {
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
        let isLoan = (allowLoan  &&  loanTerm  &&  termInt === loanTermInt)
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
        if (allowLoan  &&  !fixedProps) {
          let discountedLoanPrice = priceMx.value * (1 - blindDiscountVal)

          let monthlyPaymentLoan = (discountedLoanPrice - deposit * discountedLoanPrice) / termInt
          if (monthlyPaymentLoan) {
            qd.monthlyPaymentLoan = {
              value: mathRound(monthlyPaymentLoan),
              currency
            }
          }
          let finCostLoan = (pv(monthlyRateLoan, termInt, monthlyPaymentLoan, residualValuePerTerm, 0) / (priceMx.value * (1 - deposit)) + 1) * (1 - deposit)
          if (finCostLoan && allowLoan && loanTerm && termVal == loanTermInt)
            qd.finCostLoan = mathRound(finCostLoan * 100, 2)
          // if (realTimeCalculations) {
            // if (ii   ||  termVal == loanTermInt)
          addLoanLease({loanQuotationDetail, minXIRR, discountedLoanPrice, term, termVal: termInt, deliveryTimeLoan, delayedFundingVal, residualValuePerTerm, quotationInfo, qd, deposit, finCostLoan})

          let result = loanQuotationDetail[depositPercentage] && loanQuotationDetail[depositPercentage][termVal]
          if (realTimeCalculations && ii === 0  &&  termVal == loanTermInt) {
            // qd.xirrLoan = mathRound(result.xirrLoan)
            quotationInfo.xirrLoan = result.xirrLoan
            quotationInfo.irrLoan = result.irrLoan
            // delete loanQuotationDetail[depositPercentage]
          }
          else if (!isLoan) {
            // qd.xirr = mathRound(result.xirrLease)
            // qd.irr = mathRound(result.irrLease)
            delete qd.monthlyPaymentLoan
            delete qd.finCostLoan
          }
        }
        if (ii)
          continue
        if (!inBounds) {
          currentBest = {}
          break
        }

        if (iterateBy  &&  iterateByPropValue) {
          qd[iterateBy] = iterateByPropValue
          form[iterateBy] = iterateByPropValue
        }
        qd.xirr = xirrVal
        qd.irr = irrVal
        qd = sanitize(qd).sanitized
        if (isLoan)  {
          if (termInt === loanTermInt)
            quotationDetails.push(qd)
        }
        else if (!loanTerm  ||  termInt !== loanTermInt)
          quotationDetails.push(qd)
      }
      // if (k < configurationItems.length || (iterateBy && !currentBest && !jj)) {
      if (!jj  &&  goalProp) {
        for (let kj=0; kj<k; kj++)
          quotationDetails.pop()
      }
      else if (!iterateBy)
        break
      else if (realTimeCalculations && !ii)
        finalBest = currentBest
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
  let lidx = loanTerm && quotationDetails.findIndex(qd => qd.term.id === loanTerm.id) || -1
  let loanTerms
  if (loanTerm) {
    let idx = quotationDetails.findIndex(qd => qd.term.id === loanTerm.id)
    // quotationDetails.splice(lidx, 1)
    loanTerms = loanQuotationDetail[loanDeposit][loanTermInt]
  }
  // else if (loanTerm) {
  //   quotationDetails.splice(lidx, 1)
  //   loanTerms = loanQuotationDetail[loanDeposit][loanTermInt]
  // }

  if (realTimeCalculations)
    delete loanQuotationDetail[originalDepositPercentage]
  if (!formErrors) {
    if (size(finalBest)) { //  &&  !goalSeekSuccess && !foundCloseGoal) {
      let hasSuccessful
      let hasFailed
      let i = 0
      for (let t in finalBest) {
        if (i++)
          terms += '    '
        if (finalBest[t].formErrors) {
          hasFailed = true
          terms += `${t.split('_t')[1]} ❌`
          if (/*goalProp &&*/ t === termQuote.id)
            message = finalBest[t].formErrors[goalProp]
        }
        else {
          terms += `${t.split('_t')[1]} ✅`
          hasSuccessful = true
        }
      }
      if (!formErrors)
        formErrors = {}
      formErrors._info = {message: `${terms}`, hasSuccessful, hasFailed}
    }
  }
  let requestedProperties = getRequestedProperties(quotationInfo)

  // if (!loanTerm) {
  //   requestedProperties.push({ name: 'loanInfo_group', hide: true })
  //   requestedProperties.push({ name: 'loanTerm', hide: true })
  //   requestedProperties.push({ name: 'loanDeposit', hide: true })
  //   requestedProperties.push({ name: 'xirrLoan', hide: true })
  //   requestedProperties.push({ name: 'irrLoan', hide: true })
  //   requestedProperties.push({ name: 'monthlyRateLoan', hide: true })
  //   requestedProperties.push({ name: 'monthlyPaymentLoan', hide: true })
  //   requestedProperties.push({ name: 'finCostLoan', hide: true })
  // }
  // if (allowLoan) {
  //   let valuesToIterate = [20, 25, 30, 35, 40, 50]
  //   for (let k=0; k<configurationItems.length; k++) {
  //     let quotConf = configurationItems[k]
  //     let qc = cloneDeep(defaultQC)
  //     for (let p in quotConf)
  //       qc[p] = quotConf[p]

  //     let { term } = quotConf
  //     let termVal = term.title.split(' ')[0]

  //     for (let i=0 i<valueToIterate.length; i++) {
  //       let discountedLoanPrice = priceMx.value * (1 - blindDiscount/100)
  //       addLoanLease({loanQuotationDetail, minXIRR, discountedLoanPrice, term, termVal: termInt, deliveryTimeLoan, delayedFundingVal, residualValuePerTerm, quotationInfo, qd: quotationDetails[i], deposit:valuesToIterate[i], finCostLoan})
  //     }
  //   }
  // }
  return {
    prefill: {
      terms: quotationDetails,
      loanQuotationDetail,
      loanTerms
    },
    requestedProperties,
    formErrors,
    doTable: realTimeCalculations && allowLoan && size(loanQuotationDetail) && 'loanQuotationDetail',
    message,
    costOfCapital,
    foundCloseGoal
  }
}
function getRequestedProperties(form) {
  let requestedProperties = []
  if (form.loanTerm)
    return requestedProperties
  requestedProperties.push({ name: 'loanInfo_group', hide: true })
  requestedProperties.push({ name: 'loanTerm', hide: true })
  requestedProperties.push({ name: 'loanDeposit', hide: true })
  requestedProperties.push({ name: 'xirrLoan', hide: true })
  requestedProperties.push({ name: 'irrLoan', hide: true })
  requestedProperties.push({ name: 'monthlyRateLoan', hide: true })
  requestedProperties.push({ name: 'monthlyPaymentLoan', hide: true })
  requestedProperties.push({ name: 'finCostLoan', hide: true })
  return requestedProperties
}
function findBest({iterations, iterateBy, goalProp, form}) {
  // debugger
  let goalPropValue = form[goalProp].value
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
  let { properties } = getModel(form[TYPE])
  let finalBests = {}
  for (let p in successfulTerms) {
    let values = successfulTerms[p]
    if (size(Object.values(values)) === 1) {
      debugger
      let val = Object.keys(values)[0]
      return {valueToIterate: val, currentBest: values[val], foundCloseGoal: true}
    }
    let { finalBest, currentIterateBy } = getFinalBest({values, term, goalProp, goalPropValue})
    finalBests[p] = {finalBest, currentIterateBy}
  }
  if (!size(finalBests))
    return {valueToIterate: -1, currentBest: Object.values(iterations)[0], foundCloseGoal: false}
  let finalBest, currentIterateBy
  for (let p in finalBests) {
    let {finalBest:curBest, currentIterateBy:curIterateBy} = finalBests[p]
    if (!finalBest) {
      finalBest = curBest
      currentIterateBy = curIterateBy
    }
    else {
      let currentVal = curBest[goalProp]
      let finalBestVal = finalBest[goalProp]
      if (Math.abs(currentVal - goalPropValue) < Math.abs(finalBestVal - goalPropValue)) {
        finalBest = curBest
        currentIterateBy = curIterateBy
      }
    }
  }
  return { valueToIterate: currentIterateBy, finalBest, foundCloseGoal: true }
}
function getFinalBest({values, term, goalProp, goalPropValue}) {
  let currentIterateBy
  let finalBest = {}
  for (let key in values) {
    let rr = values[key]
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
  return { finalBest, currentIterateBy }
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
  let adj = 0
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

function addLoanLease({
  loanQuotationDetail,
  term,
  termVal,
  deliveryTimeLoan,
  delayedFundingVal,
  discountedLoanPrice,
  residualValuePerTerm,
  deposit,
  quotationInfo,
  minXIRR,
  finCostLoan,
  qd
}) {
  let {
    priceMx,
    vatRate,
    blindDiscount=0
  } = quotationInfo
  let {
    commissionFee: commissionFeeCalculated,
    // finCostLoan,
    monthlyPayment,
    monthlyPaymentLoan,
  } = qd
  let leaseIRR = []
  let loanIRR = []
  let leaseXIRR = []
  let loanXIRR = []

  let termIRR = termVal + deliveryTimeLoan

  // finCostLoan = finCostLoan / 100
  let initialPayment = (discountedLoanPrice * deposit) + (commissionFeeCalculated.value * (1 + vatRate))

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
        leasea = monthlyPayment.value
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
        finalPayment = (residualValuePerTerm * priceMx.value + monthlyPayment.value) - leasea - leaseb

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
    amount: monthlyPayment.value
  })
  loanXIRR.push({
    date,
    amount: monthlyPaymentLoan.value
  })
  leasea = 0

  for (let x=1; x < termVal; x++) {
    nextMonth(d, 1)
    date = dateformat(d.getTime(), 'yyyy-mm-dd')
    if (x < termVal-1)
      leasea = monthlyPayment.value
    else
      leasea = monthlyPayment.value + (residualValuePerTerm * priceMx.value)

    leaseXIRR.push({
        date,
        amount: leasea
    })
    loanXIRR.push({
        date,
        amount: monthlyPaymentLoan.value
    })
  }

  let { rate } = xirr(leaseXIRR)
  let xirrLease = mathRound(convertRate(rate, 365) * 100)

  let { rate:loanRate } = xirr(loanXIRR)
  let xirrLoan = mathRound(convertRate(loanRate, 365) * 100)

  let irrLoan = mathRound(irr(loanIRR) * 100)
  let irrLease = mathRound(irr(leaseIRR) * 100)


  // console.log("term", term,"leaseIRR", irr(leaseIRR), "loanIRR", irr(loanIRR),"leaseXIRR", xirr, "loanXIRR", xirrLoan)

  let p = deposit * 100 + ''
  let elm = loanQuotationDetail[p]
  if (!elm)
    loanQuotationDetail[p] = {}
  // let type = getModel(quotationInfo[TYPE]).properties.loanQuotationDetail.items.ref
  loanQuotationDetail[p][termVal] = {
    // [TYPE]: type,
    finCostLoan: mathRound(finCostLoan * 100, 2),
    termIRR,
    loanTerm: term,
    irrLoan,
    xirrLoan,
    status: xirrLoan > minXIRR ? 'pass' : 'fail',
    // irrLease,
    // xirrLease,
    // initialPayment,
    monthlyPaymentLoan,
    loanDeposit: deposit * 100
  }
}
