'use strict'


// var myId = 'b25da36eaf4b01b37fc2154cb1103eb5324a52fa'; // Jane Choi
// var myId = '31eb0b894cad3601adc76713d55a11c88e48b4a2'; // Kate Blair
// var myId = '38980944449570d2783d7c8af5db8ca9463391f3'; // Sophia
// var myId = 'b25da36eaf4b01b37fc2154cb1103eb5324a12348'; // Timo
// var myId = 'b25da36eaf4b01b37fc2154cb1103eb5324a12345'; // Ted




































// var securityCodes = [
// {
//   _t: 'tradle.SecurityCode',
//   code: '1234567',
//   organization: {
//     id: 'tradle.Organization_71e4b7cd6c11ab7221537275988f113a879029ea',
//     title: 'Rabobank'
//   }
// },
// {
//   _t: 'tradle.SecurityCode',
//   code: '7654321',
//   organization: {
//     id: 'tradle.Organization_71e4b7cd6c11ab7221537275988f113a879029ea',
//     title: 'Rabobank'
//   }
// },
// ]

// ResidencyVerification - address - bank statement, utility bill
// EmploymentVerification - employer
// SalaryVerification - latest pay stub
var identities = [
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

// "{
//   "_i": "71e4b7cd6c11ab7221537275988f113a879029ea:71e4b7cd6c11ab7221537275988f113a879029ea",
//   "_s": "3045022100cb2dc8331d8eb7a22940988f88e2496e22f0521824f4b9f6045a02e10a9c05e002206ade3dce404b9c9c41f64133e185fd4759225d74bf35b6fc76e12f98ba21df1d",
//   "_t": "tradle.Verification",
//   "_z": "Rb5u0JBP8sKXn9\/DfHwXu\/9aoyhKR6YW5ANZ+ZfN1Iw=",
//   "document": {
//     "id": "tradle.AboutYou_05bd7b0d480997fdc119d2f5b6be3cfe2e494d8f",
//     "title": "tradle.AboutYou"
//   },
//   "documentOwner": {
//     "id": "tradle.Identity_6072296facffb77088426d02f6cc11b131fe960d",
//     "title": "Bill S. Preston"
//   },
//   organization: {
//     id: 'tradle.Organization_71e4b7cd6c11ab7221537275988f113a879029ea',
//     title: 'Rabobank'
//   }
//   "time": 1446290725510
// }

// {
//   _t: 'tradle.SecurityCode',
//   _z: '14e21cf6dc67f9c5430221031b433e1903ca5975dfd7338f338146a99202c86b',
//   code: '1abc',
//   organization: {
//     id: 'tradle.Organization_96e460ca282d62e41d4b59c85b212d102d7a5a6e',
//     title: 'Lloyds'
//   }
// },
// {
//   _t: 'tradle.SecurityCode',
//   _z: '14e21cf6dc67f9c5430221031b433e1903ca5975dfd7338f338146a99202c87b',
//   code: '2abc',
//   organization: {
//     id: 'tradle.Organization_96e460ca282d62e41d4b59c85b212d102d7a5a6e',
//     title: 'Lloyds'
//   }
// },
/*
{
  _t:'tradle.Identity',
  'firstName':'Kate',
  'lastName':'Blair',
  'street':'200 Columbus Ave',
  'city':'New York',
  'region':'NY',
  'country':'USA',
  'owner':{
     id: 'tradle.Identity_b25da36eaf4b01b37fc2154cb1103eb5324a52fa',
     title: 'Jane Choi'
  },
  organization: {
    id: 'tradle.Organization_0191ef415aa2ec76fb8ec8760b55112cadf573bc',
    title: 'HSBC'
  },
  'contact': [
    {
      'identifier':'jane@ms.com',
      'type':'email'
    },
    {
      'identifier':'212-234-4567',
      'type':'phone'
    }
  ],
  'photos': [
    {
      'tags': 'headshot',
      'url': 'https://stocklandmartel.blob.core.windows.net/media/images/JC00065.jpg'
    }
  ],
  'pubkeys': [
    {
      '_sig': '304302200be2aeec26edbbf6d516441de0fedebacf0252f7a3d4d2993f4f8c76ec949cd8021f4eadda2cb931d233925c1a922a6de5cf41befafe0567b718efba4e3942f693',
      'curve': 'ed25519',
      'fingerprint': 'c40c3041cbbdcbce7540b51fe49795bf0932965f5c25158fc09c8ab829782a7f',
      'purpose': 'update',
      'type': 'ec',
      'value': '0352261ed98ccf4674f216307250171e10ad4bfe80e2f976c092dea3d653a13be8'
    },
    {
      '_sig': '304402200774032810f6fc1cbac43805b123c83ba5f8967e1305d32301651c7d3d02f12e0220043c1fa262bfc10c48d6904094f6667d4ddc638cdea89d6fd4c7c9f61d5695cc',
      'curve': 'ed25519',
      'fingerprint': 'd7678020b9a82d75c8160585asdd6cc1c8a8563cf94c45e644724635a45df134',
      'purpose': 'sign',
      'type': 'ec',
      'value': '021c315fd64987714c1c7a039645073asd17ec6206ec3009a65e62e6d49948c0c6'
    },
    {
      '_sig': 'asdqwe201b3d649dc269e8d795f38622bf03d0e020190816023bcd3c5e3d5d033c8f4e5602202f6c4ecfbcdf4661840ffad36146d892bcad144a210320a9de44fadebb1d8cf1',
      'fingerprint': 'miasdaRV8Fcs993NsSZVUpEqU8FEN7r2b1L',
      'label': 'most excellent key',
      'networkName': 'testnet',
      'purpose': 'payment',
      'type': 'bitcoin',
      'value': '026cc5795asddd554105c0bab90f4f0aa711693d6d12c4a6bfb517f13ffa8abe66d'
    }
  ],
  'websites':[
    {
      'url':'ms.com'
    }
  ],
  _r : '31eb0b894cad3601adc76713d55a11c88e48b4a2'
},
{
  _t: 'tradle.Identity',
  _r: 'b25da36eaf4b01b37fc2154cb1103eb5324a12345',
  'contact': [
    {
      'identifier': 'somebodyelse',
      'type': 'skype'
    }
  ],
  'city': 'San Dimas',
  'country': 'USA',
  'postalCode': '666',
  'region': 'California',
  'street': '666 Wyld Stallyns Dr',
  'firstName': 'Ted',
  'lastName': 'Logan',
  'middleName': 'Theodore',
  'owner':{
     id: 'tradle.Identity_b25da36eaf4b01b37fc2154cb1103eb5324a52fa',
     title: 'Jane Choi'
  },
  organization: {
     id: 'tradle.Organization_96e460ca282d62e41d4b59c85b212d102d7a5a6e',
     title: 'Lloyds'
  },
  'photos': [
    {
      'tags': 'headshot',
      'url': 'http://fc09.deviantart.net/fs70/f/2011/334/9/f/second__man__drawing__by_namitokiwa-d4hteh4.jpg'
    }
  ],
  'pubkeys': [
    {
      '_sig': '304302200be2aeec26edbbf6d516441de0fedebacf0252f7a3d4d2993f4f8c76ec949cd8021f4eadda2cb931d233925c1a922a6de5cf41befafe0567b718efba4e3942f693',
      'curve': 'ed25519',
      'fingerprint': 'c40c3041cbbdcbce7540b51fe49795bf0932965f5c25158fc09c8ab829782a7f',
      'purpose': 'update',
      'type': 'ec',
      'value': '0352261ed98ccf4674f216307250171e10ad4bfe80e2f976c092dea3d653a13be8'
    },
    {
      '_sig': '304402200774032810f6fc1cbac43805b787c83ba5f8967e1305d32301651c7d3d02f12e0220043c1fa262bfc10c48d6904094f6667d4ddc638cdea89d6fd4c7c9f61d5695cc',
      'curve': 'ed25519',
      'fingerprint': 'd7678020b9a82d75c81605856d5d6cc1c8a8563cf94c45e644724635a45df134',
      'purpose': 'sign',
      'type': 'ec',
      'value': '021c315fd64987714c1c7a0396450737ad17ec6206ec3009a65e62e6d49948c0c6'
    },
    {
      '_sig': '304402200094a5dffab7885457b90038245ba09f62b506c1e3425eaa73e0f859f3c911dd02200ac8e4139f314ca2e9ee8fed9054c3a9d77aceda50a5d07b01570e5ece2dbc50',
      'curve': 'ed25519',
      'fingerprint': '2a9fcfdd47395d229bcc4aa0b9b8a5e065464d2b18db052a4f0be5f6f5cbaf60',
      'purpose': 'sign',
      'type': 'ec',
      'value': '0370a79ba2fd9b943e750103f67d458e790b15e5f9140fe6cffd782df29ed9cfe2'
    },
    {
      '_sig': '304402200bb598494e060caf1ad4711c85cc09fffe7169350327abf538a4281fb8217ce5022000afd4d9bc4df34e8edec3296bd55b812407fe5cff64dbbaa86fd9e77b73a490',
      'curve': 'ed25519',
      'fingerprint': '24a021520135f0f077cf725f87d2a95b2abcf9b5e9accf3d4eb671546d964be8',
      'purpose': 'encrypt',
      'type': 'ec',
      'value': '0276168d37e2a1d4be57038a09c41140b6271399bd4cb5bf0942ba0f8a4236756f'
    },
    {
      '_sig': '3044022016166dd4715b5e727c244e8d9af9470c7e6f122082bddb5b01f6228b21bb52e6022066cd7f09f90f517013d2fdf70eccbc4a53dceb8fae46fa79f9cfe87a062ef50d',
      'fingerprint': '19HWX1DvxHWgRVfbLWRCn36jHmgsonmTEU',
      'label': 'most triumphant key',
      'networkName': 'bitcoin',
      'purpose': 'payment',
      'type': 'bitcoin',
      'value': '034e0458925058ca2c02a9a97dddc209488762343c96786fb25ff576ce7f6ab486'
    },
    {
      '_sig': '304402201b3d649dc269e8d795f38622bf03d0e020190816023bcd3c5e3d5d033c8f4e5602202f6c4ecfbcdf4661840ffad36146d892bcad144a210320a9de44fadebb1d8cf1',
      'fingerprint': 'miGmaRV8Fcs993NsSZVUpEqU8FEN7r2b1L',
      'label': 'most excellent key',
      'networkName': 'testnet',
      'purpose': 'payment',
      'type': 'bitcoin',
      'value': '026cc579570dd554105c0bab90f4f0aa711693d6d12c4a6bfb517f13ffa8abe66d'
    }
  ],
  'summary': 'Bill\'s best friend',
  'v': '0.3',
  'websites': [
    {
      'url': 'wyldstallyns.com'
    }
  ]
},
{
  _t: 'tradle.Identity',
  'contact': [
    {
      'identifier': 'somebodyelse',
      'type': 'skype'
    }
  ],
  'city': 'San Dimas',
  'country': 'USA',
  'postalCode': '666',
  'region': 'California',
  'street': '666 Wyld Stallyns Dr',
  'firstName': 'Jane',
  'lastName': 'Choi',
  _r: 'b25da36eaf4b01b37fc2154cb1103eb5324a52fa',
  'owner':{
     id: 'tradle.Identity_b25da36eaf4b01b37fc2154cb1103eb5324a52fa',
     title: 'Jane Choi'
  },
  organization: {
     id: 'tradle.Organization_0b462e6124d39fda3af523b49b07affb67129102',
     title: 'Morgan Stanley'
  },
  'photos': [
    {
      'tags': 'headshot',
      'url': 'http://www.morganstanley.com/assets/images/people/tiles/audrey-choi-large.jpg'
    }
  ],
  'pubkeys': [
    {
      '_sig': '304302200be2aeec26edbbf6d516441de0fedebacf0252f7a3d4d2993f4f8c76ec949cd8021f4eadda2cb931d233925c1a922a6de5cf41befafe0567b718efba4e3942f693',
      'curve': 'ed25519',
      'fingerprint': 'c40c3041cbbdcbce7540b51fe49795bf0932965f5c25158fc09c8ab829782a7f',
      'purpose': 'update',
      'type': 'ec',
      'value': '0352261ed98ccf4674f216307250171e10ad4bfe80e2f976c092dea3d653a13be8'
    },
    {
      '_sig': '304402200774032810f6fc1cbac43805b787c83ba5f8967e1305d32301651c7d3d02f12e0220043c1fa262bfc10c48d6904094f6667d4ddc638cdea89d6fd4c7c9f61d5695cc',
      'curve': 'ed25519',
      'fingerprint': 'd7678020b9a82d75c81605856d5d6cc1c8a8563cf94c45e644724635a45df134',
      'purpose': 'sign',
      'type': 'ec',
      'value': '021c315fd64987714c1c7a0396450737ad17ec6206ec3009a65e62e6d49948c0c6'
    },
    {
      '_sig': '304402200094a5dffab7885457b90038245ba09f62b506c1e3425eaa73e0f859f3c911dd02200ac8e4139f314ca2e9ee8fed9054c3a9d77aceda50a5d07b01570e5ece2dbc50',
      'curve': 'ed25519',
      'fingerprint': '2a9fcfdd47395d229bcc4aa0b9b8a5e065464d2b18db052a4f0be5f6f5cbaf60',
      'purpose': 'sign',
      'type': 'ec',
      'value': '0370a79ba2fd9b943e750103f67d458e790b15e5f9140fe6cffd782df29ed9cfe2'
    },
    {
      '_sig': '304402200bb598494e060caf1ad4711c85cc09fffe7169350327abf538a4281fb8217ce5022000afd4d9bc4df34e8edec3296bd55b812407fe5cff64dbbaa86fd9e77b73a490',
      'curve': 'ed25519',
      'fingerprint': '24a021520135f0f077cf725f87d2a95b2abcf9b5e9accf3d4eb671546d964be8',
      'purpose': 'encrypt',
      'type': 'ec',
      'value': '0276168d37e2a1d4be57038a09c41140b6271399bd4cb5bf0942ba0f8a4236756f'
    },
    {
      '_sig': '3044022016166dd4715b5e727c244e8d9af9470c7e6f122082bddb5b01f6228b21bb52e6022066cd7f09f90f517013d2fdf70eccbc4a53dceb8fae46fa79f9cfe87a062ef50d',
      'fingerprint': '19HWX1DvxHWgRVfbLWRCn36jHmgsonmTEU',
      'label': 'most triumphant key',
      'networkName': 'bitcoin',
      'purpose': 'payment',
      'type': 'bitcoin',
      'value': '034e0458925058ca2c02a9a97dddc209488762343c96786fb25ff576ce7f6ab486'
    },
    {
      '_sig': '304402201b3d649dc269e8d795f38622bf03d0e020190816023bcd3c5e3d5d033c8f4e5602202f6c4ecfbcdf4661840ffad36146d892bcad144a210320a9de44fadebb1d8cf1',
      'fingerprint': 'miGmaRV8Fcs993NsSZVUpEqU8FEN7r2b1L',
      'label': 'most excellent key',
      'networkName': 'testnet',
      'purpose': 'payment',
      'type': 'bitcoin',
      'value': '026cc579570dd554105c0bab90f4f0aa711693d6d12c4a6bfb517f13ffa8abe66d'
    }
  ],
  'summary': 'Bill\'s best friend',
  'v': '0.3',
  'websites': [
    {
      'url': 'wyldstallyns.com'
    }
  ]
},
{
  _t: 'tradle.Identity',
  'contact': [
    {
      'identifier': 'somebodyelse',
      'type': 'skype'
    }
  ],
  'city': 'San Dimas',
  'country': 'USA',
  'postalCode': '666',
  'region': 'California',
  'street': '666 Wyld Stallyns Dr',
  'firstName': 'Adam',
  'lastName': 'Scott',
  'owner':{
     id: 'tradle.Identity_b25da36eaf4b01b37fc2154cb1103eb5324a52fa',
     title: 'Jane Choi'
  },
  'photos': [
    {
      'tags': 'headshot',
      'url': 'http://www.theurbanlist.com/content/article/a_list_images/adam-scott-2008.jpg'
    }
  ],
  'pubkeys': [
    {
      '_sig': '304302200be2aeec26edbbf6d516441de0fedebacf0252f7a3d4d2993f4f8c76ec949cd8021f4eadda2cb931d233925c1a922a6de5cf41befafe0567b718efba4e3942f693',
      'curve': 'ed25519',
      'fingerprint': 'c40c3041cbbdcbce7540b51fe49795bf0932965f5c25158fc09c8ab829782a7f',
      'purpose': 'update',
      'type': 'ec',
      'value': '0352261ed98ccf4674f216307250171e10ad4bfe80e2f976c092dea3d653a13be8'
    },
    {
      '_sig': '304402200774032810f6fc1cbac43805b787c83ba5f8967e1305d32301651c7d3d02f12e0220043c1fa262bfc10c48d6904094f6667d4ddc638cdea89d6fd4c7c9f61d5695cc',
      'curve': 'ed25519',
      'fingerprint': 'd7678020b9a82d75c81605856d5d6cc1c8a8563cf94c45e644724635a45df134',
      'purpose': 'sign',
      'type': 'ec',
      'value': '021c315fd64987714c1c7a0396450737ad17ec6206ec3009a65e62e6d49948c0c6'
    },
    {
      '_sig': '304402200094a5dffab7885457b90038245ba09f62b506c1e3425eaa73e0f859f3c911dd02200ac8e4139f314ca2e9ee8fed9054c3a9d77aceda50a5d07b01570e5ece2dbc50',
      'curve': 'ed25519',
      'fingerprint': '2a9fcfdd47395d229bcc4aa0b9b8a5e065464d2b18db052a4f0be5f6f5cbaf60',
      'purpose': 'sign',
      'type': 'ec',
      'value': '0370a79ba2fd9b943e750103f67d458e790b15e5f9140fe6cffd782df29ed9cfe2'
    },
    {
      '_sig': '304402200bb598494e060caf1ad4711c85cc09fffe7169350327abf538a4281fb8217ce5022000afd4d9bc4df34e8edec3296bd55b812407fe5cff64dbbaa86fd9e77b73a490',
      'curve': 'ed25519',
      'fingerprint': '24a021520135f0f077cf725f87d2a95b2abcf9b5e9accf3d4eb671546d964be8',
      'purpose': 'encrypt',
      'type': 'ec',
      'value': '0276168d37e2a1d4be57038a09c41140b6271399bd4cb5bf0942ba0f8a4236756f'
    },
    {
      '_sig': '3044022016166dd4715b5e727c244e8d9af9470c7e6f122082bddb5b01f6228b21bb52e6022066cd7f09f90f517013d2fdf70eccbc4a53dceb8fae46fa79f9cfe87a062ef50d',
      'fingerprint': '19HWX1DvxHWgRVfbLWRCn36jHmgsonmTEU',
      'label': 'most triumphant key',
      'networkName': 'bitcoin',
      'purpose': 'payment',
      'type': 'bitcoin',
      'value': '034e0458925058ca2c02a9a97dddc209488762343c96786fb25ff576ce7f6ab486'
    },
    {
      '_sig': '304402201b3d649dc269e8d795f38622bf03d0e020190816023bcd3c5e3d5d033c8f4e5602202f6c4ecfbcdf4661840ffad36146d892bcad144a210320a9de44fadebb1d8cf1',
      'fingerprint': 'miGmaRV8Fcs993NsSZVUpEqU8FEN7r2b1L',
      'label': 'most excellent key',
      'networkName': 'testnet',
      'purpose': 'payment',
      'type': 'bitcoin',
      'value': '026cc579570dd554105c0bab90f4f0aa711693d6d12c4a6bfb517f13ffa8abe66d'
    }
  ],
  'summary': 'Bill\'s best friend',
  'v': '0.3',
  'websites': [
    {
      'url': 'wyldstallyns.com'
    }
  ]
},
{
  _t: 'tradle.Identity',
  _r: 'b25da36eaf4b01b37fc2154cb1103eb5324a12348',
  'contact': [
    {
      'identifier': 'somebodyelse',
      'type': 'skype'
    }
  ],
  'city': 'Austen',
  'country': 'USA',
  'postalCode': '09990',
  'region': 'TX',
  'street': '666 Columbia Ave',
  'firstName': 'Timo',
  'lastName': 'Heinke',
  'owner':{
     id: 'tradle.Identity_b25da36eaf4b01b37fc2154cb1103eb5324a52fa',
     title: 'Jane Choi'
  },
  organization: {
     id: 'tradle.Organization_71e4b7cd6c11ab7221537275988f113a879029ea',
     title: 'Rabobank'
  },
  'photos': [
    {
      'tags': 'headshot',
      'url': 'http://www.bitcoin2013.com/uploads/1/4/9/4/14946598/2010100_orig.jpg'
    }
  ],

  'pubkeys': [
    {
      '_sig': '304302200be2aeec26edbbf6d516441de0fedebacf0252f7a3d4d2993f4f8c76ec949cd8021f4eadda2cb931d233925c1a922a6de5cf41befafe0567b718efba4e3942f693',
      'curve': 'ed25519',
      'fingerprint': 'c40c3041cbbdcbce7540b51fe49795bf0932965f5c25158fc09c8ab829782a7f',
      'purpose': 'update',
      'type': 'ec',
      'value': '0352261ed98ccf4674f216307250171e10ad4bfe80e2f976c092dea3d653a13be8'
    },
    {
      '_sig': '304402200774032810f6fc1cbac43805b787c83ba5f8967e1305d32301651c7d3d02f12e0220043c1fa262bfc10c48d6904094f6667d4ddc638cdea89d6fd4c7c9f61d5695cc',
      'curve': 'ed25519',
      'fingerprint': 'd7678020b9a82d75c81605856d5d6cc1c8a8563cf94c45e644724635a45df134',
      'purpose': 'sign',
      'type': 'ec',
      'value': '021c315fd64987714c1c7a0396450737ad17ec6206ec3009a65e62e6d49948c0c6'
    },
    {
      '_sig': '304402200094a5dffab7885457b90038245ba09f62b506c1e3425eaa73e0f859f3c911dd02200ac8e4139f314ca2e9ee8fed9054c3a9d77aceda50a5d07b01570e5ece2dbc50',
      'curve': 'ed25519',
      'fingerprint': '2a9fcfdd47395d229bcc4aa0b9b8a5e065464d2b18db052a4f0be5f6f5cbaf60',
      'purpose': 'sign',
      'type': 'ec',
      'value': '0370a79ba2fd9b943e750103f67d458e790b15e5f9140fe6cffd782df29ed9cfe2'
    },
    {
      '_sig': '304402200bb598494e060caf1ad4711c85cc09fffe7169350327abf538a4281fb8217ce5022000afd4d9bc4df34e8edec3296bd55b812407fe5cff64dbbaa86fd9e77b73a490',
      'curve': 'ed25519',
      'fingerprint': '24a021520135f0f077cf725f87d2a95b2abcf9b5e9accf3d4eb671546d964be8',
      'purpose': 'encrypt',
      'type': 'ec',
      'value': '0276168d37e2a1d4be57038a09c41140b6271399bd4cb5bf0942ba0f8a4236756f'
    },
    {
      '_sig': '3044022016166dd4715b5e727c244e8d9af9470c7e6f122082bddb5b01f6228b21bb52e6022066cd7f09f90f517013d2fdf70eccbc4a53dceb8fae46fa79f9cfe87a062ef50d',
      'fingerprint': '19HWX1DvxHWgRVfbLWRCn36jHmgsonmTEU',
      'label': 'most triumphant key',
      'networkName': 'bitcoin',
      'purpose': 'payment',
      'type': 'bitcoin',
      'value': '034e0458925058ca2c02a9a97dddc209488762343c96786fb25ff576ce7f6ab486'
    },
    {
      '_sig': '304402201b3d649dc269e8d795f38622bf03d0e020190816023bcd3c5e3d5d033c8f4e5602202f6c4ecfbcdf4661840ffad36146d892bcad144a210320a9de44fadebb1d8cf1',
      'fingerprint': 'miGmaRV8Fcs993NsSZVUpEqU8FEN7r2b1L',
      'label': 'most excellent key',
      'networkName': 'testnet',
      'purpose': 'payment',
      'type': 'bitcoin',
      'value': '026cc579570dd554105c0bab90f4f0aa711693d6d12c4a6bfb517f13ffa8abe66d'
    }
  ],
  'summary': 'Bill\'s best friend',
  'v': '0.3',
  'websites': [
    {
      'url': 'wyldstallyns.com'
    }
  ]
},
{
  _t: 'tradle.Identity',
  'contact': [
    {
      'identifier': 'somebodyelse',
      'type': 'skype'
    }
  ],
  'city': 'San Dimas',
  'country': 'USA',
  'postalCode': '666',
  'region': 'Paris',
  'street': '123 Rue de Marseille',
  'firstName': 'Helene',
  'lastName': 'Lumiere',
  'owner':{
     id: 'tradle.Identity_b25da36eaf4b01b37fc2154cb1103eb5324a52fa',
     title: 'Jane Choi'
  },
  'photos': [
    {
      'tags': 'headshot',
      'url': 'https://scontent-lga1-1.xx.fbcdn.net/hphotos-xfa1/v/t1.0-9/10665799_10204022199610484_1148728443853769394_n.jpg?oh=55ff42033219d12c596e6caa6e637f76&oe=56244BCF'
    }
  ],
  'pubkeys': [
    {
      '_sig': '304302200be2aeec26edbbf6d516441de0fedebacf0252f7a3d4d2993f4f8c76ec949cd8021f4eadda2cb931d233925c1a922a6de5cf41befafe0567b718efba4e3942f693',
      'curve': 'ed25519',
      'fingerprint': 'c40c3041cbbdcbce7540b51fe49795bf0932965f5c25158fc09c8ab829782a7f',
      'purpose': 'update',
      'type': 'ec',
      'value': '0352261ed98ccf4674f216307250171e10ad4bfe80e2f976c092dea3d653a13be8'
    },
    {
      '_sig': '304402200774032810f6fc1cbac43805b787c83ba5f8967e1305d32301651c7d3d02f12e0220043c1fa262bfc10c48d6904094f6667d4ddc638cdea89d6fd4c7c9f61d5695cc',
      'curve': 'ed25519',
      'fingerprint': 'd7678020b9a82d75c81605856d5d6cc1c8a8563cf94c45e644724635a45df134',
      'purpose': 'sign',
      'type': 'ec',
      'value': '021c315fd64987714c1c7a0396450737ad17ec6206ec3009a65e62e6d49948c0c6'
    },
    {
      '_sig': '304402200094a5dffab7885457b90038245ba09f62b506c1e3425eaa73e0f859f3c911dd02200ac8e4139f314ca2e9ee8fed9054c3a9d77aceda50a5d07b01570e5ece2dbc50',
      'curve': 'ed25519',
      'fingerprint': '2a9fcfdd47395d229bcc4aa0b9b8a5e065464d2b18db052a4f0be5f6f5cbaf60',
      'purpose': 'sign',
      'type': 'ec',
      'value': '0370a79ba2fd9b943e750103f67d458e790b15e5f9140fe6cffd782df29ed9cfe2'
    },
    {
      '_sig': '304402200bb598494e060caf1ad4711c85cc09fffe7169350327abf538a4281fb8217ce5022000afd4d9bc4df34e8edec3296bd55b812407fe5cff64dbbaa86fd9e77b73a490',
      'curve': 'ed25519',
      'fingerprint': '24a021520135f0f077cf725f87d2a95b2abcf9b5e9accf3d4eb671546d964be8',
      'purpose': 'encrypt',
      'type': 'ec',
      'value': '0276168d37e2a1d4be57038a09c41140b6271399bd4cb5bf0942ba0f8a4236756f'
    },
    {
      '_sig': '3044022016166dd4715b5e727c244e8d9af9470c7e6f122082bddb5b01f6228b21bb52e6022066cd7f09f90f517013d2fdf70eccbc4a53dceb8fae46fa79f9cfe87a062ef50d',
      'fingerprint': '19HWX1DvxHWgRVfbLWRCn36jHmgsonmTEU',
      'label': 'most triumphant key',
      'networkName': 'bitcoin',
      'purpose': 'payment',
      'type': 'bitcoin',
      'value': '034e0458925058ca2c02a9a97dddc209488762343c96786fb25ff576ce7f6ab486'
    },
    {
      '_sig': '304402201b3d649dc269e8d795f38622bf03d0e020190816023bcd3c5e3d5d033c8f4e5602202f6c4ecfbcdf4661840ffad36146d892bcad144a210320a9de44fadebb1d8cf1',
      'fingerprint': 'miGmaRV8Fcs993NsSZVUpEqU8FEN7r2b1L',
      'label': 'most excellent key',
      'networkName': 'testnet',
      'purpose': 'payment',
      'type': 'bitcoin',
      'value': '026cc579570dd554105c0bab90f4f0aa711693d6d12c4a6bfb517f13ffa8abe66d'
    }
  ],
  'v': '0.3',
  _r: '38980944449570d2783d7c8af5db8ca9463391f3',
  'websites': [
    {
      'url': 'wyldstallyns.com'
    }
  ]
},
{
  _t: 'tradle.Identity',
  'contact': [
    {
      'identifier': 'somebodyelse',
      'type': 'skype'
    }
  ],
  'city': 'New York',
  'country': 'USA',
  'postalCode': '666',
  'region': 'NY',
  'street': '123 Wyld Stallyns Dr',
  'firstName': 'Kate',
  'lastName': 'Hao',
  'owner':{
     id: 'tradle.Identity_b25da36eaf4b01b37fc2154cb1103eb5324a52fa',
     title: 'Jane Choi'
  },
  'photos': [
    {
      'tags': 'headshot',
      'url': 'https://scontent-lga1-1.xx.fbcdn.net/hphotos-xfp1/t31.0-8/10604688_10204178311753190_6807024764791621704_o.jpg'
    }
  ],
  'pubkeys': [
    {
      '_sig': '304302200be2aeec26edbbf6d516441de0fedebacf0252f7a3d4d2993f4f8c76ec949cd8021f4eadda2cb931d233925c1a922a6de5cf41befafe0567b718efba4e3942f693',
      'curve': 'ed25519',
      'fingerprint': 'c40c3041cbbdcbce7540b51fe49795bf0932965f5c25158fc09c8ab829782a7f',
      'purpose': 'update',
      'type': 'ec',
      'value': '0352261ed98ccf4674f216307250171e10ad4bfe80e2f976c092dea3d653a13be8'
    },
    {
      '_sig': '304402200774032810f6fc1cbac43805b787c83ba5f8967e1305d32301651c7d3d02f12e0220043c1fa262bfc10c48d6904094f6667d4ddc638cdea89d6fd4c7c9f61d5695cc',
      'curve': 'ed25519',
      'fingerprint': 'd7678020b9a82d75c81605856d5d6cc1c8a8563cf94c45e644724635a45df134',
      'purpose': 'sign',
      'type': 'ec',
      'value': '021c315fd64987714c1c7a0396450737ad17ec6206ec3009a65e62e6d49948c0c6'
    },
    {
      '_sig': '304402200094a5dffab7885457b90038245ba09f62b506c1e3425eaa73e0f859f3c911dd02200ac8e4139f314ca2e9ee8fed9054c3a9d77aceda50a5d07b01570e5ece2dbc50',
      'curve': 'ed25519',
      'fingerprint': '2a9fcfdd47395d229bcc4aa0b9b8a5e065464d2b18db052a4f0be5f6f5cbaf60',
      'purpose': 'sign',
      'type': 'ec',
      'value': '0370a79ba2fd9b943e750103f67d458e790b15e5f9140fe6cffd782df29ed9cfe2'
    },
    {
      '_sig': '304402200bb598494e060caf1ad4711c85cc09fffe7169350327abf538a4281fb8217ce5022000afd4d9bc4df34e8edec3296bd55b812407fe5cff64dbbaa86fd9e77b73a490',
      'curve': 'ed25519',
      'fingerprint': '24a021520135f0f077cf725f87d2a95b2abcf9b5e9accf3d4eb671546d964be8',
      'purpose': 'encrypt',
      'type': 'ec',
      'value': '0276168d37e2a1d4be57038a09c41140b6271399bd4cb5bf0942ba0f8a4236756f'
    },
    {
      '_sig': '3044022016166dd4715b5e727c244e8d9af9470c7e6f122082bddb5b01f6228b21bb52e6022066cd7f09f90f517013d2fdf70eccbc4a53dceb8fae46fa79f9cfe87a062ef50d',
      'fingerprint': '19HWX1DvxHWgRVfbLWRCn36jHmgsonmTEU',
      'label': 'most triumphant key',
      'networkName': 'bitcoin',
      'purpose': 'payment',
      'type': 'bitcoin',
      'value': '034e0458925058ca2c02a9a97dddc209488762343c96786fb25ff576ce7f6ab486'
    },
    {
      '_sig': '304402201b3d649dc269e8d795f38622bf03d0e020190816023bcd3c5e3d5d033c8f4e5602202f6c4ecfbcdf4661840ffad36146d892bcad144a210320a9de44fadebb1d8cf1',
      'fingerprint': 'miGmaRV8Fcs993NsSZVUpEqU8FEN7r2b1L',
      'label': 'most excellent key',
      'networkName': 'testnet',
      'purpose': 'payment',
      'type': 'bitcoin',
      'value': '026cc579570dd554105c0bab90f4f0aa711693d6d12c4a6bfb517f13ffa8abe66d'
    }
  ],
  'summary': 'Bill\'s best friend',
  'v': '0.3',
  'websites': [
    {
      'url': 'wyldstallyns.com'
    }
  ]
},
{
  _t: 'tradle.Identity',
  'contact': [
    {
      'identifier': 'somebodyelse',
      'type': 'skype'
    }
  ],
  'city': 'San Dimas',
  'country': 'USA',
  'postalCode': '666',
  'region': 'California',
  'street': '666 Wyld Stallyns Dr',
  'firstName': 'Jake',
  'lastName': 'Peralta',
  'owner':{
     id: 'tradle.Identity_b25da36eaf4b01b37fc2154cb1103eb5324a52fa',
     title: 'Jane Choi'
  },
  'photos': [
    {
      'tags': 'headshot',
      'url': 'https://scontent-lga1-1.xx.fbcdn.net/hphotos-xta1/t31.0-8/10373153_10100282480857898_4039399677094768799_o.jpg'
    }
  ],
  'pubkeys': [
    {
      '_sig': '304302200be2aeec26edbbf6d516441de0fedebacf0252f7a3d4d2993f4f8c76ec949cd8021f4eadda2cb931d233925c1a922a6de5cf41befafe0567b718efba4e3942f693',
      'curve': 'ed25519',
      'fingerprint': 'c40c3041cbbdcbce7540b51fe49795bf0932965f5c25158fc09c8ab829782a7f',
      'purpose': 'update',
      'type': 'ec',
      'value': '0352261ed98ccf4674f216307250171e10ad4bfe80e2f976c092dea3d653a13be8'
    },
    {
      '_sig': '304402200774032810f6fc1cbac43805b787c83ba5f8967e1305d32301651c7d3d02f12e0220043c1fa262bfc10c48d6904094f6667d4ddc638cdea89d6fd4c7c9f61d5695cc',
      'curve': 'ed25519',
      'fingerprint': 'd7678020b9a82d75c81605856d5d6cc1c8a8563cf94c45e644724635a45df134',
      'purpose': 'sign',
      'type': 'ec',
      'value': '021c315fd64987714c1c7a0396450737ad17ec6206ec3009a65e62e6d49948c0c6'
    },
    {
      '_sig': '304402200094a5dffab7885457b90038245ba09f62b506c1e3425eaa73e0f859f3c911dd02200ac8e4139f314ca2e9ee8fed9054c3a9d77aceda50a5d07b01570e5ece2dbc50',
      'curve': 'ed25519',
      'fingerprint': '2a9fcfdd47395d229bcc4aa0b9b8a5e065464d2b18db052a4f0be5f6f5cbaf60',
      'purpose': 'sign',
      'type': 'ec',
      'value': '0370a79ba2fd9b943e750103f67d458e790b15e5f9140fe6cffd782df29ed9cfe2'
    },
    {
      '_sig': '304402200bb598494e060caf1ad4711c85cc09fffe7169350327abf538a4281fb8217ce5022000afd4d9bc4df34e8edec3296bd55b812407fe5cff64dbbaa86fd9e77b73a490',
      'curve': 'ed25519',
      'fingerprint': '24a021520135f0f077cf725f87d2a95b2abcf9b5e9accf3d4eb671546d964be8',
      'purpose': 'encrypt',
      'type': 'ec',
      'value': '0276168d37e2a1d4be57038a09c41140b6271399bd4cb5bf0942ba0f8a4236756f'
    },
    {
      '_sig': '3044022016166dd4715b5e727c244e8d9af9470c7e6f122082bddb5b01f6228b21bb52e6022066cd7f09f90f517013d2fdf70eccbc4a53dceb8fae46fa79f9cfe87a062ef50d',
      'fingerprint': '19HWX1DvxHWgRVfbLWRCn36jHmgsonmTEU',
      'label': 'most triumphant key',
      'networkName': 'bitcoin',
      'purpose': 'payment',
      'type': 'bitcoin',
      'value': '034e0458925058ca2c02a9a97dddc209488762343c96786fb25ff576ce7f6ab486'
    },
    {
      '_sig': '304402201b3d649dc269e8d795f38622bf03d0e020190816023bcd3c5e3d5d033c8f4e5602202f6c4ecfbcdf4661840ffad36146d892bcad144a210320a9de44fadebb1d8cf1',
      'fingerprint': 'miGmaRV8Fcs993NsSZVUpEqU8FEN7r2b1L',
      'label': 'most excellent key',
      'networkName': 'testnet',
      'purpose': 'payment',
      'type': 'bitcoin',
      'value': '026cc579570dd554105c0bab90f4f0aa711693d6d12c4a6bfb517f13ffa8abe66d'
    }
  ],
  'summary': 'Bill\'s best friend',
  'v': '0.3',
  'websites': [
    {
      'url': 'wyldstallyns.com'
    }
  ]
},
{
  _t: 'tradle.Identity',
  'contact': [
    {
      'identifier': 'somebodyelse',
      'type': 'skype'
    }
  ],
  'city': 'New York',
  'country': 'USA',
  'postalCode': '10001',
  'region': 'NY',
  'street': '666 Wyld Stallyns Dr',
  'firstName': 'Gene',
  'lastName': 'Vayngrib',
  'owner':{
     id: 'tradle.Identity_b25da36eaf4b01b37fc2154cb1103eb5324a52fa',
     title: 'Jane Choi'
  },
  'photos': [
    {
      'tags': 'headshot',
      'url': 'https://scontent-lga1-1.xx.fbcdn.net/hphotos-xfa1/t31.0-8/10714435_10204194198870358_6364485006481495908_o.jpg'
    }
  ],
  'pubkeys': [
    {
      '_sig': '304302200be2aeec26edbbf6d516441de0fedebacf0252f7a3d4d2993f4f8c76ec949cd8021f4eadda2cb931d233925c1a922a6de5cf41befafe0567b718efba4e3942f693',
      'curve': 'ed25519',
      'fingerprint': 'c40c3041cbbdcbce7540b51fe49795bf0932965f5c25158fc09c8ab829782a7f',
      'purpose': 'update',
      'type': 'ec',
      'value': '0352261ed98ccf4674f216307250171e10ad4bfe80e2f976c092dea3d653a13be8'
    },
    {
      '_sig': '304402200774032810f6fc1cbac43805b787c83ba5f8967e1305d32301651c7d3d02f12e0220043c1fa262bfc10c48d6904094f6667d4ddc638cdea89d6fd4c7c9f61d5695cc',
      'curve': 'ed25519',
      'fingerprint': 'd7678020b9a82d75c81605856d5d6cc1c8a8563cf94c45e644724635a45df134',
      'purpose': 'sign',
      'type': 'ec',
      'value': '021c315fd64987714c1c7a0396450737ad17ec6206ec3009a65e62e6d49948c0c6'
    },
    {
      '_sig': '304402200094a5dffab7885457b90038245ba09f62b506c1e3425eaa73e0f859f3c911dd02200ac8e4139f314ca2e9ee8fed9054c3a9d77aceda50a5d07b01570e5ece2dbc50',
      'curve': 'ed25519',
      'fingerprint': '2a9fcfdd47395d229bcc4aa0b9b8a5e065464d2b18db052a4f0be5f6f5cbaf60',
      'purpose': 'sign',
      'type': 'ec',
      'value': '0370a79ba2fd9b943e750103f67d458e790b15e5f9140fe6cffd782df29ed9cfe2'
    },
    {
      '_sig': '304402200bb598494e060caf1ad4711c85cc09fffe7169350327abf538a4281fb8217ce5022000afd4d9bc4df34e8edec3296bd55b812407fe5cff64dbbaa86fd9e77b73a490',
      'curve': 'ed25519',
      'fingerprint': '24a021520135f0f077cf725f87d2a95b2abcf9b5e9accf3d4eb671546d964be8',
      'purpose': 'encrypt',
      'type': 'ec',
      'value': '0276168d37e2a1d4be57038a09c41140b6271399bd4cb5bf0942ba0f8a4236756f'
    },
    {
      '_sig': '3044022016166dd4715b5e727c244e8d9af9470c7e6f122082bddb5b01f6228b21bb52e6022066cd7f09f90f517013d2fdf70eccbc4a53dceb8fae46fa79f9cfe87a062ef50d',
      'fingerprint': '19HWX1DvxHWgRVfbLWRCn36jHmgsonmTEU',
      'label': 'most triumphant key',
      'networkName': 'bitcoin',
      'purpose': 'payment',
      'type': 'bitcoin',
      'value': '034e0458925058ca2c02a9a97dddc209488762343c96786fb25ff576ce7f6ab486'
    },
    {
      '_sig': '304402201b3d649dc269e8d795f38622bf03d0e020190816023bcd3c5e3d5d033c8f4e5602202f6c4ecfbcdf4661840ffad36146d892bcad144a210320a9de44fadebb1d8cf1',
      'fingerprint': 'miGmaRV8Fcs993NsSZVUpEqU8FEN7r2b1L',
      'label': 'most excellent key',
      'networkName': 'testnet',
      'purpose': 'payment',
      'type': 'bitcoin',
      'value': '026cc579570dd554105c0bab90f4f0aa711693d6d12c4a6bfb517f13ffa8abe66d'
    }
  ],
  'summary': 'Bill\'s best friend',
  'v': '0.3',
  'websites': [
    {
      'url': 'wyldstallyns.com'
    }
  ]
},
{
  _t: 'tradle.Identity',
  'contact': [
    {
      'identifier': 'somebodyelse',
      'type': 'skype'
    }
  ],
  'city': 'New York',
  'country': 'USA',
  'postalCode': '10001',
  'region': 'NY',
  'street': '666 Wyld Stallyns Dr',
  'firstName': 'Tony',
  'owner':{
     id: 'tradle.Identity_b25da36eaf4b01b37fc2154cb1103eb5324a52fa',
     title: 'Jane Choi'
  },
  'photos': [
    {
      'tags': 'headshot',
      'url': 'http://thebookboy.co.uk/wp-content/uploads/2013/04/tony2.jpg'
    }
  ],
  'v': '0.3',
  'websites': [
    {
      'url': 'wyldstallyns.com'
    }
  ]
},
*/

// {
//   _t: 'tradle.Organization',
//   _r: '0b462e6124d39fda3af523b49b07affb67129102',
//   'name': 'Morgan Stanley',
//   'photos': [
//     {
//       'url':  'http://www.gabelliconnect.com/wp-content/uploads/2012/10/308112_thumb.jpg'
//     }
//   ]
// },

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




// {
//   _t: 'tradle.Organization',
//   _r: '0191ef415aa2ec76fb8ec8760b55112cadf573bc',
//   'name': 'JP Morgan',
//   'contacts': [
//     {
//       'id': 'tradle.Identity_31eb0b894cad3601adc76713d55a11c88e48b4a2',
//       'title': 'Kate Blair'
//     }
//   ],
//   'photos': [
//     {
//       'url':  'http://hypeorlando.s3.amazonaws.com/sites/162/2014/10/JP-Morgan-Chase-Logo-600x350.jpg'
//     }
//   ]
// },
// {
//   _t: 'tradle.Organization',
//   _r: '0191ef415aa2ec76fb8ec8760b55112cadf573bc',
//   'name': 'ABN AMRO',
//   'contacts': [
//     {
//       'id': 'tradle.Identity_31eb0b894cad3601adc76713d55a11c88e48b4a2',
//       'title': 'Kate Blair'
//     }
//   ],
//   'photos': [
//     {
//       'url':  'http://www.tobloom.nl/_datapics/klanten/groep132.jpg'
//     }
//   ]
// },
// {
//   _t: 'tradle.Organization',
//   _r: '0191ef415aa2ec76fb8ec8760b55112cadf573bc',
//   'name': 'HSBC',
//   'photos': [
//     {
//       'url':  'http://www.gunesulasim.com/web/uploads/referans/kucuk/hsbc_logo_square.gif'
//     }
//   ]
// },
{
  _t: 'tradle.Organization',
  'name': 'Rabobank',
  _r: '71e4b7cd6c11ab7221537275988f113a879029ea',
  'photos': [
    {
      'url':  'http://vectorlogofree.com/wp-content/uploads/2012/06/rabobank-logo-vector-01.png'
    }
  ]
},
{
  _t: 'tradle.Organization',
  'name': 'My Order',
  _r: '71e4b7cd6c11ab7221537275988f113a879029mo',
  'photos': [
    {
      'url':  'http://qiqqer.com/wp-content/uploads/2014/09/myorder-logo.jpg'
    }
  ]
},

{
  _t: 'tradle.Organization',
  'name': 'Obvion',
  _r: '71e4b7cd6c11ab7221537275988f113a879029ob',
  'photos': [
    {
      'url':  'https://pbs.twimg.com/profile_images/486406149017579521/vnJStaMl.jpeg'
    }
  ]
},

{
  _t: 'tradle.Organization',
  'name': 'Achmea',
  _r: '71e4b7cd6c11ab7221537275988f113a879029ah',
  'photos': [
    {
      'url':  'https://pbs.twimg.com/profile_images/438648661157765120/iGehefKE.png'
    }
  ]
},

{
  _t: 'tradle.Organization',
  'name': 'DLL',
  _r: '71e4b7cd6c11ab7221537275988f113a87902dll',
  'photos': [
    {
      url: 'http://www.iqmedia.nl/assets/uploads/DLL_infographic-360x270.jpg'
      // 'url':  'https://media.licdn.com/mpr/mpr/shrink_200_200/AAEAAQAAAAAAAAZFAAAAJDc2ZjY0Y2E5LTFiNjYtNDk3MS04YjVhLTcxOWU3OTM1MTU0Mw.png'
    }
  ]
},


{
  _t: 'tradle.Organization',
  'name': 'Amstel en Vecht',
  _r: '71e4b7cd6c11ab7221537275988f113a879029am',
  'photos': [
    {
      'url':  'https://media.licdn.com/mpr/mpr/shrink_200_200/p/2/000/00d/1ad/3dfb60a.jpg'
    }
  ]
},

{
  _t: 'tradle.Organization',
  _r: '96e460ca282d62e41d4b59c85b212d102d7a5a6e',
  'name': 'Lloyds',
  'photos': [
    {
      'url':  'http://www.bankpoint.co.uk/assets/images/companies/lloyds.jpg'
    }
  ]
},

];

var welcome =  {
  "msg": "Welcome {firstName}! It is a pleasure to have you here! Agent will be with you shortly. Meanwhile could you please tell how can we be of help to you today?"
}

var myId;
var data = {
  getModels: function() {
    return models;
  },
  getResources: function() {
    return identities;
  },
  setMyId: function() {
    this.myId = myId;
  },
  getMyId: function() {
    return myId;
  }
}
module.exports = data;

// {
//   _t: 'tradle.Offer',
//     dealRef: 12345,
//     title: 'Amazing deal for BENTO & BUBBLES',
//     shortTitle: 'Amazing deal',
//     conditions: 'Available in all Chino\'s restaurants',
//     description: 'clearly describe the product/service. Emphasize high value low price contrast. State quality/quantity of the product/service (and why the customer needs it). When in doubt, use "You pay x instead of XX"',
//     summary: 'piuxv oiupoi poshusofgiup upi uopiuroup pi upoiuo',
//     dealPrice: {
//       value: 100,
//       currency: 'USD'
//     },
//     dealValue: {
//       value: 120,
//       currency: 'USD'
//     }
//   //   submittedBy:
//   //     type: 'object',
//   //     ref: 'tradle.Identity',
//   //     readOnly: true
//   //   },
//   //   photos: [{
//   //     url: 'http://www.chinolatino.eu/assets/parkplaza_chino_latino/content/images/bandb.jpg'
//   //   }],
//   //   featured: {
//   //     type: 'date'
//   //   },
//   //   expired: {
//   //     type: 'date'
//   //   },
//   //   redeemBy: {
//   //     description: 'must redeem by this date'
//   //   },
//   //   dealAmount: {
//   //     type: 'object',
//   //     ref: 'tradle.Money',
//   //     description: 'only for "Buy Limited Discount" coupons; how much more customer needs to spend including certificate to get a deal'
//   //   },
//   //   dealValue: {
//   //     type: 'object',
//   //     ref: 'tradle.Money',
//   //     description: 'price before discount for "Standard" coupons or price of the certificate for "Buy Limited Discount" coupons'
//   //   },
//   //   dealPrice: {
//   //     type: 'object',
//   //     ref: 'tradle.Money',
//   //   },
//   //   dealDiscount: {
//   //     type: 'object',
//   //     ref: 'tradle.Money',
//   //     readOnly: true
//   //   },
//   //   discount: {
//   //     type: 'number',
//   //     suffix: '%',
//   //     minimum: 1,
//   //     maximum: 99
//   //   },
//   //   dealStatus: {
//   //     type: 'string',
//   //     readOnly: true,
//   //     oneOf: [
//   //       'Deal is over',
//   //       'Deal is going',
//   //       'Not featured yet'
//   //     ]
//   //   },
//   //   availableLocations: {
//   //     type: 'array',
//   //     ref: 'tradle.RedemptionLocation'
//   //   },
//   //   vendor: {
//   //     type: 'object',
//   //     ref: 'tradle.Vendor'
//   //   },
//   //   canceled: {
//   //     type: 'boolean'
//   //   },
//   //   canceledBy: {
//   //     type: 'object',
//   //     ref: 'tradle.Identity',
//   //     readOnly: true
//   //   },
//   //   dateSubmitted: {
//   //     type: 'date',
//   //     readOnly: true
//   //   },
//   //   required: ['title', 'dealPrice', 'vendor', 'expired'],
//   //   viewCols: ['shortTitle', 'dateSubmitted', 'dealPrice', 'discount', 'couponBuysCount', 'vendor', 'dealStatus']
//   // }
// },
// {
//   _t: 'tradle.Community',
//   _r: 'tradle12397d8f7s989843589798s9dg7f987h987',
//   title: 'Tradle',
//   description: 'p2p network with peer discovery over bittorrent DHT, OTR over rUDP + NAT traversal for peer comms, and optional externalization of messages to blockchain + DHT',
// },
// {
//   _t: 'tradle.Community',
//   _r: 'datt2937598r98d7h98fg7h8979fd9dg80d9f0fgh',
//   title: 'DATT',
//   description: 'Decentralize all things',
// },
// {
//   _t: 'tradle.Post',
//   _r: 'tradle129494tt9ehdgo346c6vu67bvdofuoiwere',
//   relatedTo: {
//     id: 'tradle.Community_tradle12397d8f7s989843589798s9dg7f987h987',
//     title: 'Tradle'
//   },
//   url: 'http://github.com/tradle/tim',
//   title: 'Tradle\'s Trust in Motion (TiM) on github'
// },
// {
//   _t: 'tradle.Post',
//   _r: 'datt0129494tt9ehdgo346c6vu67bvdofuoiwere',
//   relatedTo: {
//     id: 'tradle.Community_datt2937598r98d7h98fg7h8979fd9dg80d9f0fgh',
//     title: 'DATT'
//   },
//   url: 'https://github.com/dattnetwork',
//   title: 'DATT on github'
// },
// {
//   _t: 'tradle.PostComment',
//   _r: 'tradle98798dfg98568579fgh8fg7h98459dhkjk',
//   relatedTo: {
//     id: 'tradle.Community_datt2937598r98d7h98fg7h8979fd9dg80d9f0fgh',
//     title: 'DATT'
//   },
//   message: 'comment',
//   post: 'tradle.Post_datt0129494tt9ehdgo346c6vu67bvdofuoiwere'
// },
// {
//   _t: 'tradle.PostComment',
//   _r: 'tradle98798dfg98568579frtygh8fg7h98459dhkjk',
//   relatedTo: {
//     id: 'tradle.Community_datt2937598r98d7h98fg7h8979fd9dg80d9f0fgh',
//     title: 'DATT'
//   },
//   message: 'comment2',
//   post: 'tradle.Post_datt0129494tt9ehdgo346c6vu67bvdofuoiwere'
// },
// {
//   _t: 'tradle.PostComment',
//   _r: 'tradle98798dfg9856857ert9fgh8fg7h98459dhkjk',
//   relatedTo: {
//     id: 'tradle.Community_datt2937598r98d7h98fg7h8979fd9dg80d9f0fgh',
//     title: 'DATT'
//   },
//   message: 'comment3',
//   post: 'tradle.Post_datt0129494tt9ehdgo346c6vu67bvdofuoiwere'
// },

