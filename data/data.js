'use strict'

// var myId = 'b25da36eaf4b01b37fc2154cb1103eb5324a52fa'; // Jane Choi
 // var myId = '31eb0b894cad3601adc76713d55a11c88e48b4a2'; // Kate Blair
// var myId = '38980944449570d2783d7c8af5db8ca9463391f3'; // Sophia

var identities = [
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
  'lastName': 'Wilber',
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
  _t: 'tradle.Organization',
  'name': 'Morgan Stanley',
  'contacts': [
    {
      'id': 'tradle.Identity_b25da36eaf4b01b37fc2154cb1103eb5324a52fa',
      'title': 'Jane Choi'
    }
  ],
  'photos': [
    {
      'url':  'http://www.gabelliconnect.com/wp-content/uploads/2012/10/308112_thumb.jpg'
    }
  ]
},
{
  _t: 'tradle.Organization',
  'name': 'JP Morgan',
  'contacts': [
    {
      'id': 'tradle.Identity_31eb0b894cad3601adc76713d55a11c88e48b4a2',
      'title': 'Jane Blair'
    }
  ],
  'photos': [
    {
      'url':  'http://hypeorlando.s3.amazonaws.com/sites/162/2014/10/JP-Morgan-Chase-Logo-600x350.jpg'
    }
  ]

},
{
  _t: 'tradle.Vendor',
  'name': 'Cool Vendor'
},
{
  _t: 'tradle.Coupon',
    dealRef: 12345,
    title: 'Amazing deal for BENTO & BUBBLES',
    shortTitle: 'Amazing deal',
    conditions: 'Available in all Chino\'s restaurants',
    description: 'clearly describe the product/service. Emphasize high value low price contrast. State quality/quantity of the product/service (and why the customer needs it). When in doubt, use "You pay x instead of XX"',
    summary: 'piuxv oiupoi poshusofgiup upi uopiuroup pi upoiuo',
    dealPrice: {
      value: 100,
      currency: 'USD'
    },
    dealValue: {
      value: 120,
      currency: 'USD'
    }
  //   submittedBy: 
  //     type: 'object',
  //     ref: 'tradle.Identity',
  //     readOnly: true
  //   },
  //   photos: [{
  //     url: 'http://www.chinolatino.eu/assets/parkplaza_chino_latino/content/images/bandb.jpg'
  //   }],
  //   featured: {
  //     type: 'date'
  //   },
  //   expired: {
  //     type: 'date'
  //   },
  //   redeemBy: {
  //     description: 'must redeem by this date'
  //   },
  //   dealAmount: {
  //     type: 'object',
  //     ref: 'tradle.Money',
  //     description: 'only for "Buy Limited Discount" coupons; how much more customer needs to spend including certificate to get a deal'
  //   },
  //   dealValue: {
  //     type: 'object',
  //     ref: 'tradle.Money',
  //     description: 'price before discount for "Standard" coupons or price of the certificate for "Buy Limited Discount" coupons'
  //   },
  //   dealPrice: {
  //     type: 'object',
  //     ref: 'tradle.Money',
  //   },    
  //   dealDiscount: {
  //     type: 'object',
  //     ref: 'tradle.Money',
  //     readOnly: true
  //   },
  //   discount: {
  //     type: 'number',
  //     suffix: '%',
  //     minimum: 1,
  //     maximum: 99
  //   },
  //   dealStatus: {
  //     type: 'string',
  //     readOnly: true,
  //     oneOf: [
  //       'Deal is over', 
  //       'Deal is going', 
  //       'Not featured yet'
  //     ]
  //   },
  //   availableLocations: {
  //     type: 'array',
  //     ref: 'tradle.RedemptionLocation'
  //   },
  //   vendor: {
  //     type: 'object',
  //     ref: 'tradle.Vendor'
  //   },
  //   canceled: {
  //     type: 'boolean'
  //   },
  //   canceledBy: {
  //     type: 'object',
  //     ref: 'tradle.Identity',
  //     readOnly: true
  //   },
  //   dateSubmitted: {
  //     type: 'date',
  //     readOnly: true
  //   },
  //   required: ['title', 'dealPrice', 'vendor', 'expired'],
  //   viewCols: ['shortTitle', 'dateSubmitted', 'dealPrice', 'discount', 'couponBuysCount', 'vendor', 'dealStatus']
  // }
},


];

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
