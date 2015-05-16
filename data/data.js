'use strict'

// var myId = 'b25da36eaf4b01b37fc2154cb1103eb5324a52fa'; // Jane Choi
var myId = '31eb0b894cad3601adc76713d55a11c88e48b4a2'; // Kate Blair
// var myId = '38980944449570d2783d7c8af5db8ca9463391f3'; // Sofie
var identities = [
{
  '_type':'tradle.Identity',
  'firstName':'Kate',
  'lastName':'Blair',
  'formatted': 'Kate Blair',
  'street':'200 Columbus Ave',
  'city':'New York',
  'region':'NY',
  'country':'USA',
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
      'type': 'headshot',
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
  'rootHash' : '31eb0b894cad3601adc76713d55a11c88e48b4a2'
},
{
  '_type': 'tradle.Identity',
  'contact': [
    {
      'identifier': 'somebodyelse',
      'type': 'skype'
    }
  ],
  'city': 'San Dimas',
  'country': 'USA',
  'formattedAddress': '666 Wyld Stallyns Dr, San Dimas, California',
  'postalCode': '666',
  'region': 'California',
  'street': '666 Wyld Stallyns Dr',
  'firstName': 'Ted',
  'formatted': 'Ted Theodore Logan',
  'lastName': 'Logan',
  'middleName': 'Theodore',
  'photos': [
    {
      'type': 'headshot',
      'url': 'http://scrapetv.com/News/News%20Pages/Entertainment/images-9/keanu-reeves-bill-and-ted.jpg'
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
  '_type': 'tradle.Identity',
  'contact': [
    {
      'identifier': 'somebodyelse',
      'type': 'skype'
    }
  ],
  'city': 'San Dimas',
  'country': 'USA',
  'formattedAddress': '666 Wyld Stallyns Dr, San Dimas, California',
  'postalCode': '666',
  'region': 'California',
  'street': '666 Wyld Stallyns Dr',
  'firstName': 'Jane',
  'formatted': 'Jane Choi',
  'lastName': 'Choi',
  'rootHash': 'b25da36eaf4b01b37fc2154cb1103eb5324a52fa',
  'photos': [
    {
      'type': 'headshot',
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
  '_type': 'tradle.Identity',
  'contact': [
    {
      'identifier': 'somebodyelse',
      'type': 'skype'
    }
  ],
  'city': 'San Dimas',
  'country': 'USA',
  'formattedAddress': '666 Wyld Stallyns Dr, San Dimas, California',
  'postalCode': '666',
  'region': 'California',
  'street': '666 Wyld Stallyns Dr',
  'firstName': 'Adam',
  'formatted': 'Adam Scott',
  'lastName': 'Scott',
  'photos': [
    {
      'type': 'headshot',
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
  '_type': 'tradle.Identity',
  'contact': [
    {
      'identifier': 'somebodyelse',
      'type': 'skype'
    }
  ],
  'city': 'San Dimas',
  'country': 'USA',
  'formattedAddress': '666 Wyld Stallyns Dr, San Dimas, California',
  'postalCode': '666',
  'region': 'California',
  'street': '666 Wyld Stallyns Dr',
  'firstName': 'Timo',
  'formatted': 'Timo Hanke',
  'lastName': 'Heinke',
  'photos': [
    {
      'type': 'headshot',
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
  '_type': 'tradle.Identity',
  'contact': [
    {
      'identifier': 'somebodyelse',
      'type': 'skype'
    }
  ],
  'city': 'San Dimas',
  'country': 'USA',
  'formattedAddress': '666 Wyld Stallyns Dr, San Dimas, California',
  'postalCode': '666',
  'region': 'California',
  'street': '666 Wyld Stallyns Dr',
  'firstName': 'Sophia',
  'formatted': 'Sophia Loren',
  'lastName': 'Loren',
  'photos': [
    {
      'type': 'headshot',
      'url': 'https://s-media-cache-ak0.pinimg.com/236x/da/40/8c/da408ced982d40d63e022733cf831ad9.jpg'
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
  'rootHash': '38980944449570d2783d7c8af5db8ca9463391f3',
  'websites': [
    {
      'url': 'wyldstallyns.com'
    }
  ]
},
{
  '_type': 'tradle.Identity',
  'contact': [
    {
      'identifier': 'somebodyelse',
      'type': 'skype'
    }
  ],
  'city': 'San Dimas',
  'country': 'USA',
  'formattedAddress': '666 Wyld Stallyns Dr, San Dimas, California',
  'postalCode': '666',
  'region': 'California',
  'street': '666 Wyld Stallyns Dr',
  'firstName': 'Jane',
  'lastName': 'Wayman',
  'formatted': 'Jane Wayman',
  'photos': [
    {
      'type': 'headshot',
      'url': 'http://b-i.forbesimg.com/maryclairekendall/files/2014/01/300px-Eiganotomo-janewyman-dec19531.jpg'
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
  '_type': 'tradle.Identity',
  'contact': [
    {
      'identifier': 'somebodyelse',
      'type': 'skype'
    }
  ],
  'city': 'San Dimas',
  'country': 'USA',
  'formattedAddress': '666 Wyld Stallyns Dr, San Dimas, California',
  'postalCode': '666',
  'region': 'California',
  'street': '666 Wyld Stallyns Dr',
  'firstName': 'Jake',
  'formatted': 'Jake Peralta',
  'lastName': 'Peralta',
  'photos': [
    {
      'type': 'headshot',
      'url': 'http://ia.media-imdb.com/images/M/MV5BMTM1ODAwMDc2NF5BMl5BanBnXkFtZTcwMjUzNzg3MQ@@._V1_SX640_SY720_.jpg'
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
  '_type': 'tradle.Identity',
  'contact': [
    {
      'identifier': 'somebodyelse',
      'type': 'skype'
    }
  ],
  'city': 'San Dimas',
  'country': 'USA',
  'formattedAddress': '666 Wyld Stallyns Dr, San Dimas, California',
  'postalCode': '666',
  'region': 'California',
  'street': '666 Wyld Stallyns Dr',
  'firstName': 'Ken',
  'formatted': 'Ken Wilber',
  'lastName': 'Wilber',
  'photos': [
    {
      'type': 'headshot',
      'url': 'http://consciousthinkers.billyojai.com/wp-content/uploads/2013/08/Ken-Wilber.jpg'
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
  '_type': 'tradle.Organization',
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
  '_type': 'tradle.Organization',
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

}

];

var models = [{
  'id': 'tradle.Identity',
  'type': 'object',
  'title': 'Identity',
  'properties': {
    '_type': {
      'type': 'string',
      'readOnly': true
    },
    'contact': {
      'type': 'array',
      'items': {
        'type': 'object',
        'properties': {
          'contactMethod': {
            'type': 'string',
            // 'displayAs': '<View style='{{paddingLeft:20}}'><Text>{type + ' : ' + identifier'}</Text></View>',
            'displayAs': ['type', ' : ', 'identifier'],
            'readOnly': true,
            'skipLabel': true
          },
          'identifier': {
            'type': 'string'
          },
          'type': {
            'type': 'string'
          }
        }
      },
      'viewCols': ['contactMethod'],
      'required': ['identifier', 'type']
    },
    'city': {
      'type': 'string'
    },
    'country': {
      'type': 'string'
    },
    'postalCode': {
      'type': 'integer'
    },
    'region': {
      'type': 'string'
    },
    'street': {
      'type': 'string'
    },
    'formattedAddress': {
      'type': 'string',
      'displayAs': ['street', ',', 'city', ',', 'region', 'postalCode'],
      'title': 'Address',
      'readOnly': true
    },
    'firstName': {
      'type': 'string'
    },
    'lastName': {
      'type': 'string'
    },
    'formatted': {
      'type': 'string',
      'displayAs': ['firstName', 'lastName'],
      'readOnly': true,
      'displayName': true
    },
    'middleName': {
      'type': 'string'
    },
    'organization': {
      'type': 'object',
      'ref': 'tradle.Organization'
    },
    'photos': {
      'type': 'array',
      'items': {
        'type': 'object',
        'properties': {
          'type': {
            'type': 'string'
          },
          'url': {
            'type': 'string'
          }
        }
      },
      'required': ['url']
    },
    'pubkeys': {
      'type': 'array',
      'items':  {
        'type': 'object',
        'properties': {
          '_sig': {
            'type': 'string'
          },
          'curve': {
            'type': 'string'
          },
          'fingerprint': {
            'type': 'string'
          },
          'label': {
            'type': 'string'
          },
          'networkName': {
            'type': 'string'
          },
          'purpose': {
            'type': 'string'
          },
          'type': {
            'type': 'string'
          },
          'value': {
            'type': 'string'
          }
        },
        'required': ['_sig', 'fingerprint', 'value']
      }
    },
    'summary': {
      'type': 'string'
    },
    'v': {
      'type': 'string',
      'readOnly': true
    },
    'websites': {
      'type': 'array',
      'items': {
        'type': 'object',
        'properties': {
          'url': {
            'type': 'string'
          }
        }
      },
      'required': ['url']
    }
  },
  'required': [
    '_type',
    'contact',
    'photos',
    'pubkeys',
    'firstName',
    'lastName',
    'city',
    'v',
    'websites'
  ],
  'gridCols': [
    'formatted',
    'formattedAddress'
  ],
  'viewCols': [
    'formattedAddress',
    'organization',
    'contact',
    'websites',
    'pubkeys'
  ],
  'editCols': [
    'firstName', 
    'lastName',
    'street', 
    'city', 
    'region', 
    'country',
    'pubkeys',
    'organization'
  ]
},
{
  'id': 'tradle.Organization',
  'type': 'object',
  'title': 'Organization',
  'properties': {
    '_type': {
      'type': 'string',
      'readOnly': true
     },
     'name': {
       'type': 'string',
       'displayName': true,
       'skipLabel': true
     },
     'contacts': {
      'type': 'array',
      'items': {
        'type': 'object',
        'ref': 'tradle.Identity',
       } 
     },
     'photos': {
      'type': 'array',
      'items': {
        'type': 'object',
        'properties': {
          'type': {
            'type': 'string'
          },
          'url': {
            'type': 'string'
          }
        }
      },
      'required': ['url']
     },
    'city': {
      'type': 'string'
    },
    'country': {
      'type': 'string'
    },
    'postalCode': {
      'type': 'integer'
    },
    'region': {
      'type': 'string'
    },
    'street': {
      'type': 'string'
    },
    'formattedAddress': {
      'type': 'string',
      'displayAs': ['street', ',', 'city', ',', 'region', 'postalCode'],
      'title': 'Address'
    }     
  },  
  'required': ['name'],
  'viewCols': [
    'name',
    'street', 
    'city', 
    'region', 
    'country',
  ],
  'editCols': [
    'name', 
    'street', 
    'city', 
    'region', 
    'country',
  ]
},
{
  'id': 'tradle.Message',
  'type': 'object',
  'title': 'Message',
  'isInterface': true,
  'properties': {
    '_type': {
      'type': 'string',
      'readOnly': true
     },
     'message': {
      'type': 'string',
      'displayName': true,
     },
     'from': {
       'type': 'object',
       'readOnly': true,
       'ref': 'tradle.Identity',
     },
     'to': {
       'type': 'object',
       'ref': 'tradle.Identity',
       'displayName': true,
     },
     'time': {
       'type': 'date',
       'readOnly': true
     },
    'photos': {
      'type': 'array',
      'items': {
        'type': 'object',
        'properties': {
          'url': {
            'type': 'string',
            'skipLabel': true
          }
        }
      },
      'required': ['url']
    }
  },  
  'required': [
    'to', 'from', 'message'
  ],
  'viewCols': [
    'message'
  ],
},
{
  'id': 'tradle.SimpleMessage',
  'type': 'object',
  'title': 'Simple Message',
  'autoCreate': true,
  'interfaces': ['tradle.Message'],
  'properties': {
    '_type': {
      'type': 'string',
      'readOnly': true
     },
     'message': {
      'type': 'string',
      'displayName': true,
     },
     'from': {
      'type': 'object',
      'readOnly': true,
      'ref': 'tradle.Identity',
      'cloneOf': 'tradle.Message.from',
     },
     'to': {
       'type': 'object',
       'ref': 'tradle.Identity',
       'cloneOf': 'tradle.Message.to',
       'displayName': true,
       'readOnly': true
     },
     'time': {
       'type': 'date',
       'readOnly': true,
       'cloneOf': 'tradle.Message.time'
     }
  },  
  'required': [
    'to', 'message', 'from'
  ],
  'viewCols': [
    'message', 'time'
  ],
},

{
  'id': 'tradle.VerificationRequest',
  'type': 'object',
  'title': 'Verification Request',
  'interfaces': ['tradle.Message'],
  'style': {'backgroundColor': '#F4F5E6'},
  'properties': {
    '_type': {
      'type': 'string',
      'readOnly': true
     },
     'message': {
      'type': 'string',
      'displayName': true,
     },
     'from': {
      'type': 'object',
      'readOnly': true,
      'ref': 'tradle.Identity',
      'cloneOf': 'tradle.Message.from',
     },
     'to': {
       'type': 'object',
       'ref': 'tradle.Identity',
       'cloneOf': 'tradle.Message.to',
       'displayName': true,
       'readOnly': true
     },
     'blockchainUrl': {
       'type': 'string',      
       'readOnly': true
     },
     'transactionHash': {
       'readOnly': true,
       'type': 'string'
     },
     'time': {
       'type': 'date',
       'readOnly': true,
       'cloneOf': 'tradle.Message.time'
     },
    'photos': {
      'type': 'array',
      'cloneOf': 'photos',
      'items': {
        'type': 'object',
        'properties': {
          'url': {
            'type': 'string',
            'skipLabel': true
          }
        }
      },
      'required': ['url']
    }
  },  
  'required': [
    'to', 'message', 'from'
  ],
  'gridCols': [
    'message', 'time'
  ],
  'viewCols': [
    'message', 'from', 'to', 'time'
  ],
},
{
  'id': 'tradle.SkillVerification',
  'type': 'object',
  'title': 'Skill Verification',
  'interfaces': ['tradle.Message'],
  'style': {'backgroundColor': '#FAF9E1'},
  'properties': {
    '_type': {
      'type': 'string',
      'readOnly': true
     },
     'message': {
      'type': 'string',
      'displayName': true,
     },
     'from': {
      'type': 'object',
      'readOnly': true,
      'ref': 'tradle.Identity',
      'cloneOf': 'tradle.Message.from',
     },
     'to': {
       'type': 'object',
       'ref': 'tradle.Identity',
       'cloneOf': 'tradle.Message.to',
       'displayName': true,
       'readOnly': true
     },
     'blockchainUrl': {
       'type': 'string',      
       'readOnly': true
     },
     'transactionHash': {
       'readOnly': true,
       'type': 'string'
     },
     'time': {
       'type': 'date',
       'readOnly': true,
       'cloneOf': 'tradle.Message.time'
     },
    'photos': {
      'type': 'array',
      'cloneOf': 'photos',
      'items': {
        'type': 'object',
        'properties': {
          'url': {
            'type': 'string'
          }
        }
      },
      'required': ['url']
    }
  },  
  'required': [
    'to', 'message', 'from'
  ],
  'gridCols': [
    'message', 'time'
  ],
  'viewCols': [
    'message', 'from', 'to', 'time'
  ],
},
{
  'id': 'tradle.SalaryVerification',
  'type': 'object',
  'title': 'Salary Verification',
  'interfaces': ['tradle.Message'],
  'style': {'backgroundColor': '#E1FAF9'},
  'properties': {
    '_type': {
      'type': 'string',
      'readOnly': true
     },
     'message': {
      'type': 'string',
      'displayName': true,
     },
     'from': {
      'type': 'object',
      'readOnly': true,
      'ref': 'tradle.Identity',
      'cloneOf': 'tradle.Message.from',
     },
     'to': {
       'type': 'object',
       'ref': 'tradle.Identity',
       'cloneOf': 'tradle.Message.to',
       'displayName': true,
       'readOnly': true
     },
     'blockchainUrl': {
       'type': 'string',      
       'readOnly': true,
     },
     'transactionHash': {
       'readOnly': true,
       'type': 'string'
     },
     'time': {
       'type': 'date',
       'readOnly': true,
       'cloneOf': 'tradle.Message.time'
     },
    'photos': {
      'type': 'array',
      'cloneOf': 'photos',
      'items': {
        'type': 'object',
        'properties': {
          'url': {
            'type': 'string'
          }
        }
      },
      'required': ['url']
    }
  },  
  'required': [
    'to', 'message', 'from'
  ],
  'gridCols': [
    'message', 'time'
  ],
  'viewCols': [
    'message', 'from', 'to', 'time'
  ],
},
{
  'id': 'tradle.DocumentVerification',
  'type': 'object',
  'title': 'Doc Verification',
  'interfaces': ['tradle.Message'],
  'style': {'backgroundColor': '#EBE1FA'},
  'properties': {
    '_type': {
      'type': 'string',
      'readOnly': true
     },
     'message': {
      'type': 'string',
      'displayName': true,
     },
     'from': {
      'type': 'object',
      'readOnly': true,
      'ref': 'tradle.Identity',
      'cloneOf': 'tradle.Message.from',
     },
     'to': {
       'type': 'object',
       'ref': 'tradle.Identity',
       'cloneOf': 'tradle.Message.to',
       'displayName': true,
       'readOnly': true
     },
     'blockchainUrl': {
       'type': 'string',      
       'readOnly': true,
     },
     'transactionHash': {
       'readOnly': true,
       'type': 'string'
     },
     'time': {
       'type': 'date',
       'readOnly': true,
       'cloneOf': 'tradle.Message.time'
     },
    'photos': {
      'type': 'array',
      'cloneOf': 'photos',
      'items': {
        'type': 'object',
        'properties': {
          'url': {
            'type': 'string'
          }
        }
      },
      'required': ['url']
    }
  },  
  'required': [
    'to', 'message', 'from', 'photos'
  ],
  'gridCols': [
    'message', 'time'
  ],
  'viewCols': [
    'message', 'from', 'to', 'time', 'photos', 'blockchainUrl'
  ],
},
{
  'id': 'tradle.AddressVerification',
  'type': 'object',
  'title': 'Verify Address',
  'interfaces': ['tradle.Message'],
  'style': {'backgroundColor': '#FAEDE1'},
  'properties': {
    '_type': {
      'type': 'string',
      'readOnly': true
     },
     'message': {
      'type': 'string',
      'displayName': true,
     },
     'blockchainUrl': {
       'type': 'string',      
       'readOnly': true
     },
     'transactionHash': {
       'readOnly': true,
       'type': 'string'
     },
     'time': {
       'type': 'date',
       'readOnly': true,
       'cloneOf': 'tradle.Message.time'
     },
    'street': {
      'type': 'string'
    },
    'city': {
      'type': 'string'
    },
    'region': {
      'type': 'string'
    },
    'postalCode': {
      'type': 'integer'
    },
    'country': {
      'type': 'string'
    },
    'formattedAddress': {
      'type': 'string',
      'displayAs': ['street', ',', 'city', ',', 'region', 'postalCode'],
      'title': 'Address',
      'readOnly': true
    },
     'from': {
      'type': 'object',
      'readOnly': true,
      'ref': 'tradle.Identity',
      'cloneOf': 'tradle.Message.from',
     },
     'to': {
       'type': 'object',
       'ref': 'tradle.Identity',
       'cloneOf': 'tradle.Message.to',
       'displayName': true,
       'readOnly': true
     },
    'photos': {
      'type': 'array',
      'cloneOf': 'photos',
      'items': {
        'type': 'object',
        'properties': {
          'url': {
            'type': 'string'
          }
        }
      },
      'required': ['url']
    }
  },  
  'required': [
    'to', 'from', 'message', 'street', 'city', 'region', 'postalCode'
  ],
  'gridCols': [
    'message', 'formattedAddress', 'time'
  ],
  'viewCols': [
    'message', 'formattedAddress', 'from', 'to', 'blockchainUrl', 'time'
  ],
},
{
  'id': 'tradle.Verification',
  'type': 'object',
  'title': 'Verification',
  'interfaces': ['tradle.Message'],
  'style': {'backgroundColor': '#E7E6F5'},
  'autoCreate': true,
  'properties': {
    '_type': {
      'type': 'string',
      'readOnly': true
     },
     'message': {
      'type': 'string',
      'displayName': true,
     },
     'verifier': {
      'type': 'object',
      'cloneOf': 'tradle.Message.to',
      'ref': 'tradle.Identity',
      'readOnly': true,
     },
     'owner': {
       'type': 'object',
       'cloneOf': 'tradle.Message.from',
       'readOnly': true,
       'ref': 'tradle.Identity',
       'displayName': true
     },
     'blockchainUrl': {
       'type': 'string',      
       'readOnly': true
     },
     'transactionHash': {
       'type': 'string',
       'readOnly': true
     },
     'time': {
       'type': 'date',
       'cloneOf': 'tradle.Message.time'
     }
  },  
  'required': [
    'message', 'verifier', 'owner', 'time'
  ],
  'viewCols': [
    'message', 'time'
  ],
},
];

var conf = {
  getModels: function() {
    return models;
  },
  getResources: function() {
    return identities;
  },
  getMyId: function() {
    return myId;
  }
}
module.exports = conf;
