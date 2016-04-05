'use strict'

var resources = [
{
  _t: 'tradle.SecurityCode',
  _z: '04e21cf6dc67f9c5430221031b433e1903ca5975dfd7338f338146a99202c86b',
  code: '1234567',
  organization: {
    id: 'tradle.Organization_71e4b7cd6c11ab7221537275988f113a879029ea',
    title: 'Rabobank'
  }
},
{
  _t: 'tradle.SecurityCode',
  _z: '04e21cf6dc67f9c5430221031b433e1903ca5975dfd7338f338146a99202c87b',
  code: '7654321',
  organization: {
    id: 'tradle.Organization_71e4b7cd6c11ab7221537275988f113a879029ea',
    title: 'Rabobank'
  }
},
{
  _t: 'tradle.Boolean',
  boolean: 'Yes'
},
{
  _t: 'tradle.Boolean',
  boolean: 'No'
},

{
  _t: 'tradle.PurposeOfTheAccount',
  purpose: 'Benefit Payments'
},
{
  _t: 'tradle.PurposeOfTheAccount',
  purpose: 'Bills / Expenses'
},
{
  _t: 'tradle.PurposeOfTheAccount',
  purpose: 'Capital Raising ( Scottish Widows Bank )'
},
{
  _t: 'tradle.PurposeOfTheAccount',
  purpose: 'Inheritance'
},
{
  _t: 'tradle.PurposeOfTheAccount',
  purpose: 'Probate / Executor / Trustee'
},
{
  _t: 'tradle.PurposeOfTheAccount',
  purpose: 'Salary / Pension / Other Regular Income'
},
{
  _t: 'tradle.PurposeOfTheAccount',
  purpose: 'Savings'
},
{
  _t: 'tradle.PurposeOfTheAccount',
  purpose: 'Spending money'
},
{
  _t: 'tradle.PurposeOfTheAccount',
  purpose: 'Student'
},
{
  _t: 'tradle.ResidentialStatus',
  status: 'Home owner (with mortgage)'
},
{
  _t: 'tradle.ResidentialStatus',
  status: 'Home owner (without mortgage)',
},
{
  _t: 'tradle.ResidentialStatus',
  status:  'Tenant (private)',
},
{
  _t: 'tradle.ResidentialStatus',
  status: 'Tenant (counsel)',
},
{
  _t: 'tradle.ResidentialStatus',
  status: 'Living with parents'
},
{
  _t: 'tradle.MaritalStatus',
  status: 'Single',
},
{
  _t: 'tradle.MaritalStatus',
  status: 'Married',
},
/*
{
  _t: 'tradle.MaritalStatus',
  status: 'Widowed',
},
{
  _t: 'tradle.MaritalStatus',
  status: 'Divorced/Dissolved civil partnership',
},
{
  _t: 'tradle.MaritalStatus',
  status: 'Separated'
},
*/

{
  _t: 'tradle.MaritalStatus',
  status:  "Married with prenuptial agreement"
},
{
  _t: 'tradle.MaritalStatus',
  status: 'Civil partnership'
},
{
  _t: 'tradle.MaritalStatus',
  status: 'Living together with agreement'
},
///
{
  _t: 'tradle.EducationNL',
  education: 'Elementary School'
},
{
  _t: 'tradle.EducationNL',
  education: 'High School'
},
{
  _t: 'tradle.EducationNL',
  education: 'Vocational Secondary School (Junior)'  // LBO
},
{
  _t: 'tradle.EducationNL',
  education: 'Vocational Secondary School (Senior)'  // MBO
},
{
  _t: 'tradle.EducationNL',
  education: 'College'                               // HBO
},
{
  _t: 'tradle.EducationNL',
  education: 'University'
},
{
  _t: "tradle.IDCardType",
  idCardType: 'Passport'
},
{
  _t: "tradle.IDCardType",
  idCardType: 'ID Card'
},
{
  _t: "tradle.IDCardType",
  idCardType: 'Residence permit'
},
{
  _t: 'tradle.SourceOfIncome',
  sourceOfIncome: 'Employed'
},
{
  _t: 'tradle.SourceOfIncome',
  sourceOfIncome: 'Self-Employed'
},
{
  _t: 'tradle.SourceOfIncome',
  sourceOfIncome: 'Alimony'
},
{
  _t: 'tradle.SourceOfIncome',
  sourceOfIncome: 'Income Out Of Renting Or Leasing'
},
{
  _t: 'tradle.SourceOfIncome',
  sourceOfIncome: 'Pension'
},
{
  _t: 'tradle.SourceOfIncome',
  sourceOfIncome: 'Pre-Pension'
},
{
  _t: 'tradle.SourceOfIncome',
  sourceOfIncome: 'Old age benefits'
},
{
  _t: 'tradle.SourceOfIncome',
  sourceOfIncome: 'Insurance Policy / Pension (Out Of Insurance)'
},
{
  _t: 'tradle.KindOfEngagement',
  kindOfEngagement: 'Fulltime Employee'
},
{
  _t: 'tradle.KindOfEngagement',
  kindOfEngagement: 'Temporary Employment'
},
{
  _t: 'tradle.KindOfEngagement',
  kindOfEngagement: 'Flex Encome'
},
{
  _t: "tradle.KindOfConstruction",
  kindOfConstruction: "Existing house"
},
{
  _t: "tradle.KindOfConstruction",
  kindOfConstruction: "New house"
},
{
  _t: "tradle.KindOfConstruction",
  kindOfConstruction: "Build it your self"
},
{
  _t: "tradle.KindOfHouse",
  kindOfHouse:  "Detached"
},
{
  _t: "tradle.KindOfHouse",
  kindOfHouse:  "Semi-Detached"
},
{
  _t: "tradle.KindOfHouse",
  kindOfHouse:  "Terraced house"
},
{
  _t: "tradle.KindOfHouse",
  kindOfHouse:  "Appartment"
},
{ _t: "tradle.MortgageGuarantee",
  mortgageGuarantee: "No"
},
{ _t: "tradle.MortgageGuarantee",
  mortgageGuarantee: "NHG"
},
{ _t: "tradle.MortgageGuarantee",
  mortgageGuarantee: "Gemeente Garantie"
},
{
  _t: "tradle.KindOfObligation",
  kindOfObligation: "Partner alimony"
},
{
  _t: "tradle.KindOfObligation",
  kindOfObligation: "Revolving Credit"
},
{
  _t: "tradle.KindOfObligation",
  kindOfObligation: "Personal Loan"
},
{
  _t: "tradle.KindOfObligation",
  kindOfObligation: "Overdraw"
},
{
  _t: "tradle.KindOfObligation",
  kindOfObligation: "Credit card"
},
{
  _t: "tradle.KindOfObligation",
  kindOfObligation: "Partner alimony"
},
{
  _t: "tradle.KindOfObligation",
  kindOfObligation: "Shopping credit"
},
{
  _t: "tradle.KindOfObligation",
  kindOfObligation: "Private Loan"
},
{
  _t: "tradle.KindOfObligation",
  kindOfObligation: "Study Loan"
},
{
  _t: "tradle.PaymentPeriod",
  paymentPeriod: "Monthly"
},
{
  _t: "tradle.PaymentPeriod",
  paymentPeriod: "Quarterly"
},
{
  _t: "tradle.PaymentPeriod",
  paymentPeriod: "Half Yearly"
},
{
  _t: "tradle.PaymentPeriod",
  paymentPeriod: "Yearly"
},
{
  _t: "tradle.EnergyLabel",
  energyLabel: "A"
},
{
  _t: "tradle.EnergyLabel",
  energyLabel: "B"
},
{
  _t: "tradle.EnergyLabel",
  energyLabel: "C"
},
{
  _t: "tradle.EnergyLabel",
  energyLabel: "D"
},
{
  _t: "tradle.EnergyLabel",
  energyLabel: "E"
},
{
  _t: "tradle.EnergyLabel",
  energyLabel: "F"
},
{
  _t: "tradle.EnergyLabel",
  energyLabel: "G"
},
{
  _t: "tradle.StatusOfInsurance",
  statusOfInsurance: "Existing Insurance"
},
{
  _t: "tradle.StatusOfInsurance",
  statusOfInsurance: "Temporary Coverage"
},
{
  _t: "tradle.StatusOfInsurance",
  statusOfInsurance: "To Be Arranged"
},
{
  _t: "tradle.KindOfInsurance",
  kindOfInsurance: "Equal Over Time"
},
{
  _t: "tradle.KindOfInsurance",
  kindOfInsurance: "Yearly Decreasing"
},
{
  _t: "tradle.KindOfInsurance",
  kindOfInsurance: "Lineary Decreasing"
},
{
  _t: "tradle.TypeOfCoverage",
  typeOfCoverage: "Equal Insured Amount"
},
{
  _t: "tradle.TypeOfCoverage",
  typeOfCoverage: "Lineair Decreasing Amount"
},
{
  _t: "tradle.TypeOfCoverage",
  typeOfCoverage: "Yearly decreasing based on a interest of 4% until the insured amount reaches 0%"
},
{
  _t: 'tradle.Nationality',
  nationality: 'British',
},
{
  _t: 'tradle.Nationality',
  nationality: 'American',
},
{
  _t: 'tradle.Nationality',
  nationality: 'French',
},
{
  _t: 'tradle.Nationality',
  nationality: 'Russian',
},
{
  _t: 'tradle.Nationality',
  nationality: 'Dutch'
},
{
  _t: 'tradle.PropertyType',
  propertyType: 'Freehold'
},
{
  _t: 'tradle.PropertyType',
  propertyType: 'Leasehold'
},
{
  _t: 'tradle.PropertyType',
  propertyType: 'New build or converted properties'
},
{
  _t: 'tradle.PropertyType',
  propertyType: 'Shared equity'
},
{
  _t: 'tradle.PropertyType',
  propertyType: 'Shared ownership'
},
{
  _t: 'tradle.PropertyType',
  propertyType: 'Right to Buy'
},
{
  _t: 'tradle.PropertyType',
  propertyType: 'Buy to let'
},
{
  _t: 'tradle.PropertyTypes',
  propertyType: 'Single Family House'
},
{
  _t: 'tradle.PropertyTypes',
  propertyType: 'Condominium'
},
{
  _t: 'tradle.PropertyTypes',
  propertyType: 'Duplex'
},
{
  _t: 'tradle.PropertyTypes',
  propertyType: 'High Volume Home'
},
{
  _t: 'tradle.PropertyTypes',
  propertyType: 'Vacation Home'
},
{
  _t: 'tradle.PropertyTypes',
  propertyType: 'Farm'
},
{
  _t: 'tradle.PropertyTypes',
  propertyType: 'Land'
},
{
  _t: 'tradle.PurposeOfMortgageLoan',
  purpose: 'Buy your first home'
},

{
  _t: 'tradle.PurposeOfMortgageLoan',
  purpose: 'Move home'
},
{
  _t: 'tradle.PurposeOfMortgageLoan',
  purpose: 'Find a new mortgage deal'
},

{
  _t: 'tradle.PurposeOfMortgageLoan',
  purpose: 'Buying to let'
},
{
  _t: 'tradle.PurposeOfMortgageLoan',
  purpose: 'Borrowing more'
},
{
  _t: 'tradle.Language',
  language: 'English',
  code: 'en'
},
{
  _t: 'tradle.Language',
  language: 'Dutch',
  code: 'nl'
},
// {
//   _t: 'tradle.Language',
//   language: 'Russian',
//   code: 'ru'
// },
{
  _t: 'tradle.Country',
  country: 'UK',
},
{
  _t: 'tradle.Country',
  country: 'US',
},
{
  _t: 'tradle.Country',
  country: 'France',
},
{
  _t: 'tradle.Country',
  country: 'Russia',
},
{
  _t: 'tradle.Country',
  country: 'Netherlands'
},
{
  _t: 'tradle.HowToFund',
  howToFund: 'Cash',
},
{
  _t: 'tradle.HowToFund',
  howToFund: 'Check',
},
{
  _t: 'tradle.HowToFund',
  howToFund: 'Direct to Bank'
},
{
  _t: 'tradle.PhoneTypes',
  phoneType: 'Home'
},
{
  _t: 'tradle.PhoneTypes',
  phoneType: 'Mobile',
},
{
  _t: 'tradle.PhoneTypes',
  phoneType: 'Work',
},

{
  _t: 'tradle.Currency',
  currency: 'USD',
  symbol: '$'
},
{
  _t: 'tradle.Currency',
  currency: 'Euro',
  symbol: '€'
},
{
  _t: 'tradle.Currency',
  currency: 'GBR',
  symbol: '£'
},
{
  _t: 'tradle.CommercialProduct',
  productType: 'Obvion'
},
{
  _t: 'tradle.CommercialProduct',
  productType: 'Basis'
},
{
  _t: 'tradle.CommercialProduct',
  productType: 'Compact'
},
{
  _t: 'tradle.CommercialProduct',
  productType: 'ABP'
},
{
  _t: 'tradle.RepaymentType',
  repaymentType: 'Annuity'
},
{
  _t: 'tradle.RepaymentType',
  repaymentType: 'Liniar'
},
{
  _t: 'tradle.RepaymentType',
  repaymentType: 'Interest Only'
},
{
  _t: 'tradle.LoanTypes',
  loanType: 'New Mortgage'
},
{
  _t: 'tradle.LoanTypes',
  loanType: 'Second Mortgage'
},
{
  _t: 'tradle.LoanTypes',
  loanType: 'Additional Mortgage Within Existing Contract'
},
{
  _t: 'tradle.LoanTypes',
  loanType: 'Coming Form Other Mortgage Supplier'
},
{
  _t: 'tradle.LoanTypes',
  loanType: 'Change Mortgage Construction'
},
{
  _t: 'tradle.InterestType',
  interestType: '30 years fixed'
},
{
  _t: 'tradle.InterestType',
  interestType: '15 years fixed'
},
{
  _t: 'tradle.InterestType',
  interestType: '10 years fixed'
},
{
  _t: 'tradle.InterestType',
  interestType: '5 adjustable'
},
{
  _t: 'tradle.InterestType',
  interestType: 'Variable'
},
{
  _t: 'tradle.RoleInContract',
  role: 'Co-signer'
},
{
  _t: 'tradle.ContractType',
  contractType: 'fixed'
},
{
  _t: 'tradle.ContractType',
  contractType: 'self-employed'
}

];

var myId;
var data = {
  getResources: function() {
    return resources;
  },
  getMyId: function() {
    return myId
  }
}
module.exports = data;
