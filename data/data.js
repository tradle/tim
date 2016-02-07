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
  status: 'Married / civil partnership',
},
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
