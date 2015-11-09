'use strict'

var voc = [{
  'id': 'tradle.Identity',
  'type': 'tradle.Model',
  'title': 'Identity',
  sort: 'lastMessageTime',
  plural: 'Identities',
  'properties': {
    _t: {
      'type': 'string',
      'readOnly': true
    },
    securityCode: {
      type: 'string',
    },
    'contactInfo': {
      'type': 'array',
      'items': {
        'type': 'object',
        'properties': {
          'contactMethod': {
            'type': 'string',
            'displayAs': ['type', ' : ', 'identifier'],
            'readOnly': true,
            'skipLabel': true
          },
          'identifier': {
            'type': 'string',
            'description': 'Phone number, IM name, skype id, etc.'
          },
          'type': {
            'type': 'string',
            'description': 'Like "phone", "IM", "skype", "email", etc.'
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
      'type': 'object',
      ref: 'tradle.Country'
    },
    'postalCode': {
      'type': 'string'
    },
    'region': {
      'type': 'string'
    },
    'street': {
      'type': 'string'
    },
    'formattedAddress': {
      transient: true,
      'type': 'string',
      'displayAs': ['street', ',', 'city', ',', 'region', 'postalCode'],
      'title': 'Address',
      'readOnly': true
    },
    'firstName': {
      'type': 'string'
    },
    'lastName': {
      'type': 'string',
      'description':  'Choose a fake name or a real name. It all depends on how you want people to know you. Choose a different Identity for work and social.',
    },
    'formatted': {
      transient: true,
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
    'verifiedByMe': {
      type: 'array',
      allowRoles: 'me',
      icon: 'ios-checkmark-empty',
      items: {
        readOnly: true,
        ref: 'tradle.Verification',
        backlink: 'from'
      }
    },
    myProducts: {
      type: 'array',
      allowRoles: 'me',
      items: {
        readOnly: true,
        ref: 'tradle.FinancialProduct',
        backlink: 'from'
      }
    },
    myVerifications: {
      type: 'array',
      allowRoles: 'me',
      icon: 'ios-checkmark-empty',
      items: {
        readOnly: true,
        ref: 'tradle.Verification',
        backlink: 'to'
      }
    },
    myRequests: {
      type: 'array',
      allowRoles: 'me',
      // icon: 'ios-checkmark-empty',
      items: {
        readOnly: true,
        ref: 'tradle.Message',
        where: 'document !== null',
        backlink: 'from'
      }
    },
    'photos': {
      'type': 'array',
      'items': {
        'type': 'object',
        'properties': {
          'tags': {
            'type': 'string',
            'title': 'Tags via comma'
          },
          'url': {
            'type': 'string',
            readOnly: true
          }
        }
      },
      'required': ['url']
    },
    'pubkeys': {
      'type': 'array',
      'readOnly': true,
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
    lastMessage: {
       type: 'string',
       style: {color: '#999999', fontSize: 14},
       transient: true
    },
    lastMessageTime: {
       type: 'date',
       transient: true
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
    // '_t',
    // 'contact',
    // 'photos',
    // 'pubkeys',
    'firstName',
    // 'securityCode'
    //'lastName',
    // 'city',
    // 'v',
    // 'websites'
  ],
  groups: {
    name: ['firstName', 'middleName', 'lastName', 'formatted'],
    location: ['city', 'country', 'street', 'region', 'postalCode', 'formattedAddress'],
  },
  'gridCols': [
    'formatted',
    'lastMessage',
    'lastMessageTime',
    'organization'
  ],
  'viewCols': [
    'formattedAddress',
    'organization',
    'myVerifications',
    'contactInfo',
    'websites',
    'pubkeys',
    'photos'
  ],
  'editCols': [
    'securityCode',
    'firstName',
    'lastName',
    'street',
    'city',
    'region',
    'postalCode',
    'country',
    'pubkeys',
    'organization'
  ]
},
{
   id: 'tradle.MyIdentities',
   type: 'tradle.Model',
   title: 'My Identities',
   properties: {
     '_t': {
       type: 'string',
       readOnly: true
     },
     currentIdentity: {
       type: 'object',
       ref: 'tradle.Identity',
       readOnly: true
     },
     allIdentities: {
       type: 'array',
       items: {
         type: 'object',
         ref: 'tradle.Identity',
       }
     }
   },
   required: ['id']
},
{
  id: 'tradle.AdditionalInfo',
  type: 'tradle.Model',
  title: 'Additional Information',
  interfaces: ['tradle.Message'],
  properties: {
    '_t': {
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
       'readOnly': true,
       // 'displayName': true,
     },
     'time': {
       'type': 'date',
       'readOnly': true,
       'displayName': true
     },
     document: {
       ref: 'tradle.Message',
       readOnly: true,
       type: 'object'
    },
    confirmed: {
      type: 'boolean',
      readOnly: true
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
  'id': 'tradle.Message',
  'type': 'tradle.Model',
  'title': 'Message',
  'isInterface': true,
  'properties': {
    '_t': {
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
       'readOnly': true,
       'displayName': true
     },
    'photos': {
      'type': 'array',
      'items': {
        'type': 'object',
        'properties': {
          'tags': {
            'type': 'string',
            'skipLabel': true
          },
          'url': {
            'type': 'string',
            'readOnly': true
          }
        }
      },
      'required': ['title', 'url']
    },
    relatedTo: {
      type: 'object',
      ref: 'tradle.Message',
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
  'type': 'tradle.Model',
  'title': 'Simple Message',
  'autoCreate': true,
  'interfaces': ['tradle.Message'],
  'properties': {
    '_t': {
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
       'readOnly': true
     },
     'photos': {
      'type': 'array',
      'items': {
        'type': 'object',
        'properties': {
          'tags': {
            'type': 'string',
            'skipLabel': true
          },
          'url': {
            'type': 'string',
            'readOnly': true
          },
          width: {
            type: 'number',
            readOnly: true
          },
          height: {
            type: 'number',
            readOnly: true
          }
        }
      },
      'required': ['title', 'url']
     },
     'time': {
       'type': 'date',
       'readOnly': true,
     },
     welcome: {
       type: 'boolean',
       readOnly: true
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
  'id': 'tradle.SkillVerification',
  'type': 'tradle.Model',
  'title': 'Skill Verification',
  'interfaces': ['tradle.Message'],
  'style': {'backgroundColor': '#FAF9E1'},
  'properties': {
    '_t': {
      'type': 'string',
      'readOnly': true
     },
     'message': {
      'type': 'string',
      'title': 'Description',
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
     },
    'photos': {
      'type': 'array',
      'items': {
        'type': 'object',
        'properties': {
          'tags': {
            'type': 'string',
            'skipLabel': true
          },
          'url': {
            'type': 'string',
            'readOnly': true
          },
          width: {
            type: 'number',
            readOnly: true
          },
          height: {
            type: 'number',
            readOnly: true
          }
        }
      },
      'required': ['title', 'url']
    },
    'verifications': {
      'type': 'array',
      'readOnly': true,
      'items': {
        'backlink': 'document',
        'ref': 'tradle.Verification'
      },
    },
    additionalInfo: {
      type: 'array',
      items: {
        ref: 'tradle.AdditionalInfo',
        backlink: 'document'
      }
    }
  },
  'required': [
    'to', 'message', 'from'
  ],
  'gridCols': [
    'message', 'time'
  ],
  'viewCols': [
    'message', 'time', 'photos', 'verifications'
  ],
},
{
  'id': 'tradle.SalaryVerification',
  'type': 'tradle.Model',
  'title': 'Salary Verification',
  'interfaces': ['tradle.Message'],
  'style': {'backgroundColor': '#E1FAF9'},
  'properties': {
    '_t': {
      'type': 'string',
      'readOnly': true
     },
     'message': {
      'type': 'string',
      'title': 'Description',
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
     },
    'photos': {
      'type': 'array',
      'items': {
        'type': 'object',
        'properties': {
          'tags': {
            'type': 'string',
            'skipLabel': true
          },
          'url': {
            'type': 'string',
            'readOnly': true
          },
          width: {
            type: 'number',
            readOnly: true
          },
          height: {
            type: 'number',
            readOnly: true
          }
        }
      },
      'required': ['title', 'url']
    },
    'verifications': {
      'type': 'array',
      'readOnly': true,
      'items': {
        'backlink': 'document',
        'ref': 'tradle.Verification'
      },
      'required': ['contact']
    },
    additionalInfo: {
      type: 'array',
      items: {
        ref: 'tradle.AdditionalInfo',
        backlink: 'document'
      }
    }
  },
  'required': [
    'to', 'message', 'from'
  ],
  'gridCols': [
    'message', 'time'
  ],
  'viewCols': [
    'message', 'time', 'photos', 'verifications'
  ],
},
{
  'id': 'tradle.UtilityBillVerification',
  'type': 'tradle.Model',
  'title': 'Utility Bill Verification',
  'interfaces': ['tradle.Message'],
  'style': {'backgroundColor': '#EBE1FA'},
  'properties': {
    '_t': {
      'type': 'string',
      'readOnly': true
     },
     billDate: {
       type: 'date',
       displayName: true
     },
     issuedBy: {
       type: 'string'
     },
    'firstName': {
      'type': 'string'
    },
    'lastName': {
      'type': 'string',
    },
    'city': {
      'type': 'string'
    },
    'country': {
      'type': 'object',
      ref: 'tradle.Country'
    },
    'postalCode': {
      'type': 'string'
    },
    'region': {
      'type': 'string'
    },
    'street': {
      'type': 'string'
    },
    'formattedAddress': {
      transient: true,
      'type': 'string',
      'displayAs': ['street', ',', 'city', ',', 'region', 'postalCode'],
      'title': 'Address',
      'readOnly': true
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
     },
    'photos': {
      'type': 'array',
      'items': {
        'type': 'object',
        'properties': {
          'tags': {
            'type': 'string',
            'skipLabel': true
          },
          'url': {
            'type': 'string',
            'readOnly': true
          },
          width: {
            type: 'number',
            readOnly: true
          },
          height: {
            type: 'number',
            readOnly: true
          }
        }
      },
      'required': ['title', 'url']
    },
    'verifications': {
      'type': 'array',
      'readOnly': true,
      'items': {
        'backlink': 'document',
        'ref': 'tradle.Verification'
      },
    }
  },
  'required': [
    'to', 'from', 'photos', 'billDate', 'issuedBy', 'firstName', 'lastName', 'city', 'street', 'postalCode', 'region'
  ],
  'gridCols': [
    'from', 'formattedAddress', 'billDate', 'time'
  ],
  'viewCols': [
    'from', 'formattedAddress', 'billDate', 'time'
  ],
},
{
  'id': 'tradle.PassportVerification',
  'type': 'tradle.Model',
  'title': 'Passport Verification',
  'interfaces': ['tradle.Message'],
  'style': {'backgroundColor': '#EBE1FA'},
  'properties': {
    '_t': {
      'type': 'string',
      'readOnly': true
     },
     // 'message': {
     //  'type': 'string',
     //  'displayName': true,
     //  readOnly: true,
     // },
     codeOfIssuing: {
       type: 'string'
     },
     passportNumber: {
      'type': 'number',
      'maxLength': 9,
      'minLength': 9,
      'displayName': true,
     },
     surname: {
      'type': 'string',
      // 'displayName': true,
     },
     givenName: {
      'type': 'string',
      // 'displayName': true,
     },
     nationality: {
      'type': 'string',
     },
     dateOfBirth: {
       type: 'date'
     },
     sex: {
       type: 'string',
       oneOf: [
        'Male',
        'Female'
       ]
     },
     placeOfBirth: {
       type: 'string',
     },
     dateOfIssue: {
      type: 'date',
     },
     authority: {
       type: 'string',
       displayName: true
     },
     dateOfExpiry: {
       type: 'date',
       displayName: true
     },
     'from': {
      'type': 'object',
      'readOnly': true,
      'ref': 'tradle.Identity',
      displayName: true
     },
     'to': {
       'type': 'object',
       'ref': 'tradle.Identity',
       'readOnly': true
     },
     'time': {
       'type': 'date',
       'readOnly': true,
     },
    'photos': {
      'type': 'array',
      'items': {
        'type': 'object',
        'properties': {
          'tags': {
            'type': 'string',
            'skipLabel': true
          },
          'url': {
            'type': 'string',
            'readOnly': true
          },
          width: {
            type: 'number',
            readOnly: true
          },
          height: {
            type: 'number',
            readOnly: true
          }
        }
      },
      'required': ['title', 'url']
    },
    'verifications': {
      'type': 'array',
      'readOnly': true,
      'items': {
        'backlink': 'document',
        'ref': 'tradle.Verification'
      },
    },
     'blockchainUrl': {
       'type': 'string',
       'readOnly': true,
     },
     'transactionHash': {
       'readOnly': true,
       'type': 'string'
     },
     additionalInfo: {
       type: 'array',
       items: {
         ref: 'tradle.AdditionalInfo',
         backlink: 'document'
       }
     }
  },
  'required': [
    'to', 'from', 'photos', 'codeOfIssuing', 'passportNumber', 'surname', 'givenName', 'nationality', 'dateOfBirth', 'sex', 'placeOfBirth', 'dateOfIssue', 'authority', 'dateOfExpiry'
  ],
  'gridCols': [
    'from', 'passportNumber', 'dateOfExpiry', 'time'
  ],
  'viewCols': [
    'codeOfIssuing', 'passportNumber', 'surname', 'givenName', 'nationality', 'dateOfBirth', 'sex', 'placeOfBirth', 'dateOfIssue', 'authority', 'dateOfExpiry'
  ],
},
{
  'id': 'tradle.LicenseVerification',
  'type': 'tradle.Model',
  'title': 'License Verification',
  'interfaces': ['tradle.Message'],
  'style': {'backgroundColor': '#EBE1FA'},
  'properties': {
    '_t': {
      'type': 'string',
      'readOnly': true
     },
     // 'message': {
     //  'type': 'string',
     //  'displayName': true,
     //  readOnly: true,
     // },
     licenseNumber: {
      'type': 'number',
      maxLength: 8,
      'displayName': true,
     },
     surname: {
      'type': 'string',
      // 'displayName': true,
     },
     givenName: {
      'type': 'string',
      // 'displayName': true,
     },
     dateOfBirth: {
       type: 'date'
     },
     dateOfIssue: {
      type: 'date',
     },
     dateOfExpiry: {
       type: 'date',
       displayName: true
     },
     issuingAuthority: {
       type: 'string'
     },
     holderAddress: {
       type: 'string'
     },
     entitlementCategories: {
       type: 'string'
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
       'readOnly': true
     },
     'time': {
       'type': 'date',
       'readOnly': true,
     },
    'photos': {
      'type': 'array',
      'title': 'Document Snapshots',
      'items': {
        'type': 'object',
        'properties': {
          'tags': {
            'type': 'string',
            'skipLabel': true
          },
          'url': {
            'type': 'string',
            'readOnly': true
          },
          width: {
            type: 'number',
            readOnly: true
          },
          height: {
            type: 'number',
            readOnly: true
          }
        }
      },
      'required': ['title', 'url']
    },
    'verifications': {
      'type': 'array',
      'readOnly': true,
      'items': {
        'backlink': 'document',
        'ref': 'tradle.Verification'
      },
    },
     'blockchainUrl': {
       'type': 'string',
       'readOnly': true,
     },
     'transactionHash': {
       'readOnly': true,
       'type': 'string'
     },
     additionalInfo: {
       type: 'array',
       items: {
         ref: 'tradle.AdditionalInfo',
         backlink: 'document'
       }
     }
  },
  'required': [
    'to', 'from', 'photos', 'licenseNumber', 'surname', 'givenName', 'dateOfBirth', 'dateOfIssue', 'dateOfExpiry', 'issuingAuthority', 'holderAddress', 'entitlementCategories'
  ],
  'gridCols': [
    'from', 'licenseNumber', 'dateOfExpiry', 'time'
  ],
  'viewCols': [
    'photos', 'licenseNumber', 'surname', 'givenName', 'dateOfBirth', 'dateOfIssue', 'dateOfExpiry', 'issuingAuthority', 'holderAddress', 'entitlementCategories', 'verifications', 'additionalInfo'
  ],
},

{
  'id': 'tradle.Verification',
  'type': 'tradle.Model',
  'title': 'Verification',
  'interfaces': ['tradle.Message'],
  'icon': 'ios-checkmark-empty',
  'style': {'backgroundColor': '#E7E6F5'},
  'autoCreate': true,
  'properties': {
    '_t': {
      'type': 'string',
      'readOnly': true
     },
     'document': {
      'type': 'object',
      'readOnly': true,
      'ref': 'tradle.Message',
      'title': 'Verifying document',
     },
     'message': {
      'type': 'object',
      'title': 'Description',
      'displayName': true,
     },
     'to': {
      'type': 'object',
      'title': 'Owner',
      'ref': 'tradle.Identity',
      'displayName': true,
      'readOnly': true,
     },
     'from': {
       'type': 'object',
       'title': 'Verifier',
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
       type: 'date',
       skipLabel: true,
       readOnly: true
     },
     organization: {
      type: 'object',
      ref: 'tradle.Organization'
     }
  },
  'required': [
    'message', 'to', 'from', 'time'
  ],
  'viewCols': [
    'message', 'time', 'organization'
  ],
  'gridCols': [
    'message', 'time', 'from', 'document', 'organization'
  ],
},
{
  id: 'tradle.SecurityCode',
  type: 'tradle.Model',
  title: 'Security Code',
  properties: {
    _t: {
      type: 'string',
      readOnly: true
    },
    code: {
      type: 'string',
      readOnly: true
    },
    organization: {
      type: 'object',
      ref: 'tradle.Organization'
    }
  }
},
{
  id: 'tradle.Organization',
  type: 'tradle.Model',
  title: 'Organization',
  sort: 'lastMessageTime',
  properties: {
    '_t': {
      type: 'string',
      readOnly: true
    },
    'name': {
      'type': 'string',
      displayName: true
    },
    email: {
      type: 'string'
    },
    'city': {
      'type': 'string'
    },
    'country': {
      'type': 'object',
      ref: 'tradle.Country'
    },
    'postalCode': {
      'type': 'string'
    },
    'region': {
      'type': 'string'
    },
    'street': {
      'type': 'string'
    },
    'formattedAddress': {
      transient: true,
      'type': 'string',
      'displayAs': ['street', ',', 'city', ',', 'region', 'postalCode'],
      'title': 'Address',
      'readOnly': true
    },
    'contacts': {
     'type': 'array',
     'items': {
       'type': 'object',
       'ref': 'tradle.Identity',
       backlink: 'organization'
      }
    },
    lastMessage: {
       type: 'string',
       style: {color: '#999999', fontSize: 14},
       transient: true
    },
    lastMessageTime: {
       type: 'date',
       transient: true
    },
    photos: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          tags: {
            type: 'string',
            title: 'Tags via comma'
          },
          url: {
            type: 'string',
            readOnly: true
          },
          width: {
            type: 'number',
            readOnly: true
          },
          height: {
            type: 'number',
            readOnly: true
          }
        }
      },
      required: ['url']
    },

    verifications: {
      type: 'array',
      readOnly: true,
      items: {
        type: 'object',
        ref: 'tradle.Verification',
        backlink: 'organization'
      }
    },
    securityCodes: {
      type: 'array',
      readOnly: true,
      items: {
        type: 'object',
        ref: 'tradle.SecurityCode',
        backlink: 'organization'
      }
    },
    verificationsCount: {
      type: 'number',
      readOnly: true,
      skipLabel: true
    },
    verificationRequests: {
      type: 'array',
      readOnly: true,
      items: {
        type: 'object',
        ref: 'tradle.Message',
        backlink: 'organization'
      }
    },
    products: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          modelName: {
           type: 'tradle.Model'
          }
        }
      }
    }

    // offers: {
    //   type: 'array',
    //   items: {
    //     type: 'object',
    //     ref: 'tradle.Offer',
    //     backlink: 'organization'
    //   }
    // },
    // offersCount: {
    //   type: 'number',
    //   readOnly: true,
    //   skipLabel: true
    // }
  },

  required: ['name'],
  viewCols: ['name', 'photos', 'verifications'],
  gridCols: [
    'name',
    'lastMessage',
    'lastMessageTime',
  ],
  editCols: [
    'name',
    'street',
    'city',
    'region',
    'country',
  ]
},
// {
//   id: 'tradle.FinancialProductsInOrganization',
//   type: 'tradle.Model',
//   properties: {
//     '_t': {
//       'type': 'string',
//       'readOnly': true
//     },
//     product: {
//       type: 'object',
//       ref: 'tradle.FinancialProduct'
//     },
//     organization: {
//       type: 'object',
//       ref: 'tradle.Organization'
//     }
//   },
//   required: ['product', 'organization']
// },
{
  id: 'tradle.NewMessageModel',
  type: 'tradle.Model',
  title: 'New message model',
  properties: {
    '_t': {
      'type': 'string',
      'readOnly': true
     },
     'url': {
      'type': 'string',
      'displayName': true
     }
  },
},
{
  id: 'tradle.Money',
  type: 'tradle.Model',
  inlined: true,
  properties: {
    '_t': {
      'type': 'string',
      'readOnly': true
    },
    value: {
      type: 'number'
    },
    currency: {
      type: 'object',
      ref: 'tradle.Currency'
    }
  },
  required: ['value', 'currency']
},
{
  id: 'tradle.Currency',
  type: 'tradle.Model',
  subClassOf: 'tradle.Enum',
  properties: {
    '_t': {
      'type': 'string',
      'readOnly': true
    },
    currency: {
      type: 'string'
    },
    symbol: {
      type: 'string'
    }
  },
  required: ['currency']
},
{
  id: 'tradle.CurrentAccount',
  type: 'tradle.Model',
  title: 'Current Account',
  interfaces: ['tradle.Message'],
  subClassOf: 'tradle.FinancialProduct',
  forms: ['tradle.AboutYou', 'tradle.YourMoney', 'tradle.UtilityBillVerification'],
  properties: {
    '_t': {
      'type': 'string',
      'readOnly': true
    },
    productType: {
      type: 'string',
      readOnly: true,
      displayName: true
    },
    from: {
      type: 'object',
      readOnly: true,
      ref: 'tradle.Identity'
    },
    to: {
      type: 'object',
      readOnly: true,
      ref: 'tradle.Identity'
    },
    accountWith: {
      type: 'object',
      readOnly: true,
      displayName: true,
      ref: 'tradle.Organization'
    },
    residentialStatus: {
      type: 'object',
      ref: 'tradle.ResidentialStatus'
    },
    maritalStatus: {
      type: 'object',
      ref: 'tradle.MaritalStatus'
    },
    dependants: {
      type: 'number',
      description: 'How many people who live with you depend on you financially?'
    },
    nationality: {
      type: 'object',
      ref: 'tradle.Nationality'
    },
    inUKFrom: {
      type: 'date',
      description: 'When did you arrive in the UK?',
      title: 'In UK from'
    },
    countryOfBirth: {
      type: 'object',
      ref: 'tradle.Country'
    },
    taxResidency: {
      type: 'object',
      description: 'Country/countries in which you have tax residency (or been resident of for the past 2 years):',
      ref: 'tradle.Country'
    },
    fundAccount: {
      type: 'object',
      description: 'How will you fund your account?',
      ref: 'tradle.HowToFund'
    },
    purposeOfTheAccount: {
      type: 'object',
      ref: 'tradle.PurposeOfTheAccount'
    },
    phones: {
      type: 'array',
      items: {
        type: 'string',
        properties: {
          phoneType: {
            type: 'string',
            ref: 'tradle.PhoneTypes'
          },
          number: {
            type: 'string'
          }
        }
      },
      required: ['phoneType', 'number']
    },
    emailAddress: {
      type: 'string',
    },
    employer: {
      type: 'object',
      ref: 'tradle.Organization'
    },
    howLongHaveYouWorkedHere: {
      type: 'number',
      units: 'years'
    },
    monthlyIncome: {
      type: 'object',
      ref: 'tradle.Money'
    },
  }
},
{
  id: 'tradle.Mortgage',
  title: 'Mortgage',
  interfaces: ['tradle.Message'],
  type: 'tradle.Model',
  forms: ['tradle.AboutYou', 'tradle.YourMoney', 'tradle.MortgageLoanDetail'],
  subClassOf: 'tradle.FinancialProduct',
  properties: {
    '_t': {
      'type': 'string',
      'readOnly': true
    },
    from: {
      type: 'object',
      readOnly: true,
      ref: 'tradle.Identity'
    },
    to: {
      type: 'object',
      readOnly: true,
      ref: 'tradle.Identity'
    },
  },
},
{
  id: 'tradle.JumboMortgage',
  title: 'Jumbo Mortgage',
  interfaces: ['tradle.Message'],
  type: 'tradle.Model',
  forms: ['tradle.AboutYou', 'tradle.YourMoney', 'tradle.MortgageLoanDetail'],
  subClassOf: 'tradle.FinancialProduct',
  properties: {
    '_t': {
      'type': 'string',
      'readOnly': true
    },
    from: {
      type: 'object',
      readOnly: true,
      ref: 'tradle.Identity'
    },
    to: {
      type: 'object',
      readOnly: true,
      ref: 'tradle.Identity'
    },
  },
},
{
  id: 'tradle.Refinancing',
  title: 'Refinancing',
  interfaces: ['tradle.Message'],
  type: 'tradle.Model',
  forms: ['tradle.AboutYou', 'tradle.YourMoney', 'tradle.MortgageLoanDetail'],
  subClassOf: 'tradle.FinancialProduct',
  properties: {
    '_t': {
      'type': 'string',
      'readOnly': true
    },
    from: {
      type: 'object',
      readOnly: true,
      ref: 'tradle.Identity'
    },
    to: {
      type: 'object',
      readOnly: true,
      ref: 'tradle.Identity'
    },
  },
},
{
  id: 'tradle.HomeImprovement',
  title: 'Home Improvement',
  interfaces: ['tradle.Message'],
  type: 'tradle.Model',
  forms: ['tradle.AboutYou', 'tradle.YourMoney', 'tradle.MortgageLoanDetail'],
  subClassOf: 'tradle.FinancialProduct',
  properties: {
    '_t': {
      'type': 'string',
      'readOnly': true
    },
    from: {
      type: 'object',
      readOnly: true,
      ref: 'tradle.Identity'
    },
    to: {
      type: 'object',
      readOnly: true,
      ref: 'tradle.Identity'
    },
  },
},


{
  id: 'tradle.HealthInsurance',
  title: 'Health Insurance',
  interfaces: ['tradle.Message'],
  type: 'tradle.Model',
  forms: ['tradle.AboutYou', 'tradle.YourMoney'],
  subClassOf: 'tradle.FinancialProduct',
  properties: {
    '_t': {
      'type': 'string',
      'readOnly': true
    },
    from: {
      type: 'object',
      readOnly: true,
      ref: 'tradle.Identity'
    },
    to: {
      type: 'object',
      readOnly: true,
      ref: 'tradle.Identity'
    },
  },
},
{
  id: 'tradle.LifeInsurance',
  title: 'Life Insurance',
  interfaces: ['tradle.Message'],
  type: 'tradle.Model',
  forms: ['tradle.AboutYou', 'tradle.YourMoney'],
  subClassOf: 'tradle.FinancialProduct',
  properties: {
    '_t': {
      'type': 'string',
      'readOnly': true
    },
    from: {
      type: 'object',
      readOnly: true,
      ref: 'tradle.Identity'
    },
    to: {
      type: 'object',
      readOnly: true,
      ref: 'tradle.Identity'
    },
  },
},

{
  id: 'tradle.TermInsurance',
  title: 'Term Insurance',
  interfaces: ['tradle.Message'],
  type: 'tradle.Model',
  forms: ['tradle.AboutYou', 'tradle.YourMoney'],
  subClassOf: 'tradle.FinancialProduct',
  properties: {
    '_t': {
      'type': 'string',
      'readOnly': true
    },
    from: {
      type: 'object',
      readOnly: true,
      ref: 'tradle.Identity'
    },
    to: {
      type: 'object',
      readOnly: true,
      ref: 'tradle.Identity'
    },
  },
},
{
  id: 'tradle.Pension',
  title: 'Pension',
  interfaces: ['tradle.Message'],
  type: 'tradle.Model',
  forms: ['tradle.AboutYou', 'tradle.YourMoney'],
  subClassOf: 'tradle.FinancialProduct',
  properties: {
    '_t': {
      'type': 'string',
      'readOnly': true
    },
    from: {
      type: 'object',
      readOnly: true,
      ref: 'tradle.Identity'
    },
    to: {
      type: 'object',
      readOnly: true,
      ref: 'tradle.Identity'
    },
  },
},
{
  id: 'tradle.IncomeProtectionInsurance',
  title: 'Income Protection Insurance',
  interfaces: ['tradle.Message'],
  type: 'tradle.Model',
  forms: ['tradle.AboutYou', 'tradle.YourMoney'],
  subClassOf: 'tradle.FinancialProduct',
  properties: {
    '_t': {
      'type': 'string',
      'readOnly': true
    },
    from: {
      type: 'object',
      readOnly: true,
      ref: 'tradle.Identity'
    },
    to: {
      type: 'object',
      readOnly: true,
      ref: 'tradle.Identity'
    },
  },
},

{
  id: 'tradle.BusinessAccount',
  title: 'Business Account',
  interfaces: ['tradle.Message'],
  type: 'tradle.Model',
  forms: ['tradle.BusinessInformation', 'tradle.SalesData'],
  subClassOf: 'tradle.FinancialProduct',
  properties: {
    '_t': {
      'type': 'string',
      'readOnly': true
    },
    from: {
      type: 'object',
      readOnly: true,
      ref: 'tradle.Identity'
    },
    to: {
      type: 'object',
      readOnly: true,
      ref: 'tradle.Identity'
    },
  },
},

{
  "id": "tradle.BusinessInformation",
  "title": "Business Information",
  "interfaces": [
    "tradle.Message"
  ],
  "subClassOf": "tradle.Form",
  "type": "tradle.Model",
  "properties": {
    "_t": {
      "type": "string",
      "readOnly": true
    },
    from: {
      type: 'object',
      readOnly: true,
      ref: 'tradle.Identity'
    },
    to: {
      type: 'object',
      readOnly: true,
      ref: 'tradle.Identity'
    },
    "companyName": {
      "type": "string"
    },
    "DBAName": {
      "type": "string",
      "title": "DBA Name"
    },
    "registrationNumber": {
      "type": "string"
    },
    "registrationDate": {
      "type": "date"
    },
    "taxIdNumber": {
      "type": "string",
      "title": "Tax ID Number"
    },
    "officialAddress": {
      "type": "string"
    },
    "actualAddress": {
      "type": "string"
    },
    "companyPhone": {
      "type": "string"
    },
    "companyFax": {
      "type": "string"
    },
    "companyEmail": {
      "type": "string"
    },
    "numberOfEmployees": {
      "type": "number"
    },
    "photos": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "tags": {
            "type": "string",
            "skipLabel": true
          },
          "url": {
            "type": "string",
            "readOnly": true
          },
          width: {
            type: 'number',
            readOnly: true
          },
          height: {
            type: 'number',
            readOnly: true
          }
        }
      },
      "required": [
        "title",
        "url"
      ]
    }
  },
  "viewCols": [
    "companyName",
    "registrationNumber",
    "officialAddress",
    "companyEmail"
  ],
  "required": [
    "companyName",
    "registrationNumber",
    "registrationDate",
    "taxIdNumber",
    "officialAddress",
    "actualAddress",
    "companyPhone",
    "companyFax",
    "companyEmail",
    "numberOfEmployees",
    "photos"
  ]
},
{
  "id": "tradle.SalesData",
  "title": "Sales Data for last year",
  "interfaces": [
    "tradle.Message"
  ],
  "subClassOf": "tradle.Form",
  "type": "tradle.Model",
  "properties": {
    "_t": {
      "type": "string",
      "readOnly": true
    },
    from: {
      type: 'object',
      readOnly: true,
      ref: 'tradle.Identity'
    },
    to: {
      type: 'object',
      readOnly: true,
      ref: 'tradle.Identity'
    },
    "averageMonthlySales": {
      "type": "object",
      "ref": "tradle.Money",
      units: "[min - max]",
      "description": "Average monthly sales"
    },
    "averageTxsPerMonth": {
      "type": "number",
      units: "[min - max]",
      "description": "Average number of transactions per month"
    },
    "averageTxAmount": {
      "type": "object",
      "ref": "tradle.Money",
      units: "[min - max]",
      "description": "Average amount of a single transaction"
    },
    "numberOfChargebacks": {
      "type": "number"
    },
    "volumeOfChargebacks": {
      "type": "object",
      "ref": "tradle.Money",
      "title": "Total amount of chargebacks"
    },
    "settlementCurrency": {
      "type": "string"
    }
  },
  "viewCols": [
    "averageMonthlySales",
    "averageTxsPerMonth",
  ],
  "required": [
    "averageMonthlySales",
    "averageTxsPerMonth",
    "averageTxAmount",
    "numberOfChargebacks",
    "volumeOfChargebacks",
    "settlementCurrency"
  ]
},
{
  id: 'tradle.AboutYou',
  title: 'About You',
  interfaces: ['tradle.Message'],
  subClassOf: 'tradle.Form',
  type: 'tradle.Model',
  properties: {
    '_t': {
      'type': 'string',
      'readOnly': true
    },
    from: {
      type: 'object',
      readOnly: true,
      ref: 'tradle.Identity'
    },
    to: {
      type: 'object',
      readOnly: true,
      ref: 'tradle.Identity'
    },
    residentialStatus: {
      type: 'object',
      ref: 'tradle.ResidentialStatus'
    },
    maritalStatus: {
      type: 'object',
      ref: 'tradle.MaritalStatus'
    },
    dependants: {
      type: 'number',
      description: 'How many people who live with you depend on you financially?'
    },
    nationality: {
      type: 'object',
      ref: 'tradle.Nationality'
    },
    // inUKFrom: {
    //   type: 'date',
    //   // description: 'When did you arrive in the UK?',
    //   title: 'In UK from'
    // },
    countryOfBirth: {
      type: 'object',
      ref: 'tradle.Country'
    },
    taxResidency: {
      type: 'object',
      description: 'Country/countries in which you have tax residency (or been resident of for the past 2 years):',
      ref: 'tradle.Country'
    },
    fundAccount: {
      type: 'object',
      description: 'How will you fund your account?',
      ref: 'tradle.HowToFund'
    },
    purposeOfTheAccount: {
      type: 'object',
      ref: 'tradle.PurposeOfTheAccount'
    },
    phones: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          phoneType: {
            type: 'object',
            ref: 'tradle.PhoneTypes'
          },
          number: {
            type: 'string'
          }
        }
      },
      required: ['phoneType', 'number']
    },
    emailAddress: {
      type: 'string',
    },
    'photos': {
      'type': 'array',
      'title': 'Photo ID snapshots',
      'items': {
        'type': 'object',
        'properties': {
          'tags': {
            'type': 'string',
            'skipLabel': true
          },
          'url': {
            'type': 'string',
            'readOnly': true
          },
          width: {
            type: 'number',
            readOnly: true
          },
          height: {
            type: 'number',
            readOnly: true
          }
        }
      },
      'required': ['title', 'url']
    },
  },
  viewCols: ['residentialStatus', 'maritalStatus', 'countryOfBirth', 'taxResidency', 'fundAccount', 'purposeOfTheAccount', 'phones', 'emailAddress', 'photos']
},
{
  id: 'tradle.YourMoney',
  title: 'Your Money',
  interfaces: ['tradle.Message'],
  type: 'tradle.Model',
  subClassOf: 'tradle.Form',
  properties: {
    '_t': {
      'type': 'string',
      'readOnly': true
    },
    employer: {
      type: 'object',
      ref: 'tradle.Organization'
    },
    howLongHaveYouWorkedHere: {
      type: 'number',
      units: 'years'
    },
    monthlyIncome: {
      type: 'object',
      ref: 'tradle.Money'
    },
    from: {
      type: 'object',
      readOnly: true,
      ref: 'tradle.Identity'
    },
    to: {
      type: 'object',
      readOnly: true,
      ref: 'tradle.Identity'
    },
  },
  viewCols: ['employer', 'monthlyIncome', 'howLongHaveYouWorkedHere']
},

{
  id: 'tradle.Savings',
  title: 'Savings',
  type: 'tradle.Model',
  properties: {
    '_t': {
      'type': 'string',
      'readOnly': true
    },
  },
},
{
  id: 'tradle.PurposeOfTheAccount',
  title: 'Purpose Of The Account',
  subClassOf: 'tradle.Enum',
  type: 'tradle.Model',
  properties: {
    '_t': {
      'type': 'string',
      'readOnly': true
    },
    purpose: {
      displayName: true,
      type: 'string'
    }
  },
  required: ['purpose']
},
{
  id: 'tradle.ResidentialStatus',
  title: 'Residential Status',
  type: 'tradle.Model',
  subClassOf: 'tradle.Enum',
  sort: 'status',
  properties: {
    '_t': {
      'type': 'string',
      'readOnly': true
    },
    status: {
      displayName: true,
      type: 'string'
    }
  },
  required: ['status']
},
{
  id: 'tradle.MaritalStatus',
  title: 'Marital Status',
  type: 'tradle.Model',
  subClassOf: 'tradle.Enum',
  properties: {
    '_t': {
      'type': 'string',
      'readOnly': true
    },
    status: {
      displayName: true,
      type: 'string'
    }
  },
  required: ['status']
},
{
  id: 'tradle.Nationality',
  title: 'Nationality',
  subClassOf: 'tradle.Enum',
  type: 'tradle.Model',
  properties: {
    '_t': {
      'type': 'string',
      'readOnly': true
    },
    nationality: {
      displayName: true,
      type: 'string'
    }
  },
  required: ['nationality']
},
{
  id: 'tradle.HowToFund',
  title: 'How To Fund',
  subClassOf: 'tradle.Enum',
  type: 'tradle.Model',
  properties: {
    '_t': {
      'type': 'string',
      'readOnly': true
    },
    howToFund: {
      displayName: true,
      type: 'string'
    }
  },
  required: ['howToFund']
},
{
  id: 'tradle.Enum',
  title: 'Enum',
  type: 'tradle.Model',
  properties: {
    '_t': {
      'type': 'string',
      'readOnly': true
    },
  }
},
{
  id: 'tradle.Country',
  subClassOf: 'tradle.Enum',
  title: 'Country',
  type: 'tradle.Model',
  properties: {
    '_t': {
      'type': 'string',
      'readOnly': true
    },
    country: {
      displayName: true,
      type: 'string'
    }
  },
  required: ['country']
},
{
  id: 'tradle.PhoneTypes',
  title: 'Phone Types',
  subClassOf: 'tradle.Enum',
  type: 'tradle.Model',
  properties: {
    '_t': {
      'type': 'string',
      'readOnly': true
    },
    phoneType: {
      displayName: true,
      type: 'string'
    }
  },
  required: ['phoneType']
},
{
  id: 'tradle.ISAs',
  title: 'ISAs',
  type: 'tradle.Model',
  properties: {
    '_t': {
      'type': 'string',
      'readOnly': true
    },
  },
},
{
  id: 'tradle.CreditCards',
  type: 'tradle.Model',
  title: 'Credit Cards',
  properties: {
    '_t': {
      'type': 'string',
      'readOnly': true
    },
  },
},
{
  id: 'tradle.FinancialProduct',
  type: 'tradle.Model',
  // interfaces: ['tradle.Message'],
  title: 'Financial Product',
  properties: {
    '_t': {
      'type': 'string',
      'readOnly': true
    },
    from: {
      type: 'object',
      readOnly: true,
      ref: 'tradle.Identity'
    },
    accountWith: {
      type: 'object',
      readOnly: true,
      ref: 'tradle.Organization'
    },
  },
},
{
  id: 'tradle.Loan',
  title: 'Loan',
  type: 'tradle.Model',
  interfaces: ['tradle.Message'],
  subClassOf: 'tradle.FinancialProduct',
  properties: {
    '_t': {
      'type': 'string',
      'readOnly': true
    },
    from: {
      type: 'object',
      readOnly: true,
      ref: 'tradle.Identity'
    },
    accountWith: {
      type: 'object',
      readOnly: true,
      ref: 'tradle.Organization'
    },
  },
},
{
  id: 'tradle.MortgageLoanDetail',
  title: 'Mortgage Loan Details',
  interfaces: ['tradle.Message'],
  type: 'tradle.Model',
  subClassOf: 'tradle.Form',
  properties: {
    '_t': {
      'type': 'string',
      'readOnly': true
    },
    purposeOfMortgageLoan: {
      type: 'object',
      ref: 'tradle.PurposeOfMortgageLoan'
    },
    totalAmountRequired: {
      type: 'object',
      ref: 'tradle.Money'
    },
    totalValueOfProperty: {
      type: 'object',
      ref: 'tradle.Money'
    },
    propertyStreetAddress: {
      'type': 'string'
    },
    'region': {
      'type': 'string'
    },
    'city': {
      'type': 'string'
    },
    'postalCode': {
      'type': 'string'
    },
    'country': {
      'type': 'object',
       ref: 'tradle.Country'
    },
    formattedAddress: {
      transient: true,
      'type': 'string',
      'displayAs': ['propertyStreetAddress', ',', 'city', ',', 'region', 'postalCode', ',  ', 'country'],
      'title': 'Property Address',
      'readOnly': true
    },

    propertyType: {
      type: 'object',
      ref: 'tradle.PropertyType'
    },
    sizeOfProperty: {
      type: 'string'
    },
    from: {
      type: 'object',
      readOnly: true,
      ref: 'tradle.Identity'
    },
    to: {
      type: 'object',
      readOnly: true,
      ref: 'tradle.Identity'
    },
  },
  viewCols: [
    'formattedAddress',
    'purposeOfMortgageLoan',
    'totalAmountRequired',
    'totalValueOfProperty',
    'propertyType',
    'sizeOfProperty',
  ]
},
{
  id: 'tradle.PropertyType',
  title: 'Property Type',
  type: 'tradle.Model',
  properties: {
    '_t': {
      'type': 'string',
      'readOnly': true
    },
    propertyType: {
      displayName: true,
      type: 'string'
    }
  },
  required: ['propertyType']
},
{
  id: 'tradle.PurposeOfMortgageLoan',
  title: 'Purpose of mortgage loan',
  type: 'tradle.Model',
  properties: {
    '_t': {
      'type': 'string',
      'readOnly': true
    },
    purpose: {
      displayName: true,
      type: 'string'
    }
  },
  required: ['purpose']
},


{
  id: 'tradle.HomeInsurance',
  title: 'Home Insurance',
  type: 'tradle.Model',
  subClassOf: 'tradle.FinancialProduct',
  interfaces: ['tradle.Message'],
  forms: ['tradle.AboutYou', 'tradle.PropertyInformation'],
  properties: {
    '_t': {
      'type': 'string',
      'readOnly': true
    },
    from: {
      type: 'object',
      readOnly: true,
      ref: 'tradle.Identity'
    },
    to: {
      type: 'object',
      readOnly: true,
      ref: 'tradle.Identity'
    },
    'verifications': {
      'type': 'array',
      'readOnly': true,
      'items': {
        'backlink': 'document',
        'ref': 'tradle.Verification'
      },
    },
    referencedBy: {
      type: 'object',
      readOnly: true,
      ref: 'tradle.SimpleMessage'
    }
  },
},
{
  id: 'tradle.AutoInsurance',
  title: 'Auto Insurance',
  type: 'tradle.Model',
  subClassOf: 'tradle.FinancialProduct',
  interfaces: ['tradle.Message'],
  forms: ['tradle.H1', 'tradle.H2'],
  properties: {
    '_t': {
      'type': 'string',
      'readOnly': true
    },
    from: {
      type: 'object',
      readOnly: true,
      ref: 'tradle.Identity'
    },
    to: {
      type: 'object',
      readOnly: true,
      ref: 'tradle.Identity'
    },
    'verifications': {
      'type': 'array',
      'readOnly': true,
      'items': {
        'backlink': 'document',
        'ref': 'tradle.Verification'
      },
    },
    referencedBy: {
      type: 'object',
      readOnly: true,
      ref: 'tradle.SimpleMessage'
    }
  },
},
{
  id: 'tradle.Form',
  title: 'Form',
  type: 'tradle.Model',
  properties: {
    '_t': {
      'type': 'string',
      'readOnly': true
    },
  }
},
{
  id: 'tradle.H1',
  title: 'H1',
  type: 'tradle.Model',
  interfaces: ['tradle.Message'],
  subClassOf: 'tradle.Form',
  properties: {
    '_t': {
      'type': 'string',
      'readOnly': true
    },
    from: {
      type: 'object',
      readOnly: true,
      ref: 'tradle.Identity'
    },
    to: {
      type: 'object',
      readOnly: true,
      ref: 'tradle.Identity'
    },
    residentialStatus: {
      type: 'object',
      ref: 'tradle.ResidentialStatus'
    },
    'verifications': {
      'type': 'array',
      'readOnly': true,
      'items': {
        'backlink': 'document',
        'ref': 'tradle.Verification'
      },
    },
  },
  viewCols: ['residentialStatus']

},
{
  id: 'tradle.H2',
  title: 'H2',
  type: 'tradle.Model',
  interfaces: ['tradle.Message'],
  subClassOf: 'tradle.Form',
  properties: {
    '_t': {
      'type': 'string',
      'readOnly': true
    },
    from: {
      type: 'object',
      readOnly: true,
      ref: 'tradle.Identity'
    },
    to: {
      type: 'object',
      readOnly: true,
      ref: 'tradle.Identity'
    },
    countryOfBirth: {
      type: 'object',
      ref: 'tradle.Country'
    },
    taxResidency: {
      type: 'object',
      description: 'Country/countries in which you have tax residency (or been resident of for the past 2 years):',
      ref: 'tradle.Country'
    },
    fundAccount: {
      type: 'object',
      description: 'How will you fund your account?',
      ref: 'tradle.HowToFund'
    },
    'verifications': {
      'type': 'array',
      'readOnly': true,
      'items': {
        'backlink': 'document',
        'ref': 'tradle.Verification'
      },
    },
  },
  viewCols: ['countryOfBirth', 'fundAccount']

},
{
  id: 'tradle.MotorInsurance',
  title: 'Motor Insurance',
  type: 'tradle.Model',
  interfaces: ['tradle.Message'],
  subClassOf: 'tradle.FinancialProduct',
  properties: {
    '_t': {
      'type': 'string',
      'readOnly': true
    },
    from: {
      type: 'object',
      readOnly: true,
      ref: 'tradle.Identity'
    },
    accountWith: {
      type: 'object',
      readOnly: true,
      ref: 'tradle.Organization'
    },
  },
},
{
  id: 'tradle.Investments',
  title: 'Investments',
  interfaces: ['tradle.Message'],
  type: 'tradle.Model',
  subClassOf: 'tradle.FinancialProduct',
  properties: {
    '_t': {
      'type': 'string',
      'readOnly': true
    },
    from: {
      type: 'object',
      readOnly: true,
      ref: 'tradle.Identity'
    },
    accountWith: {
      type: 'object',
      readOnly: true,
      ref: 'tradle.Organization'
    },
  },
},
{
  id: 'tradle.LifeInsurance',
  interfaces: ['tradle.Message'],
  title: 'Life Insurance',
  type: 'tradle.Model',
  subClassOf: 'tradle.FinancialProduct',
  properties: {
    '_t': {
      'type': 'string',
      'readOnly': true
    },
    from: {
      type: 'object',
      readOnly: true,
      ref: 'tradle.Identity'
    },
    accountWith: {
      type: 'object',
      readOnly: true,
      ref: 'tradle.Organization'
    },
  },
},

// {
//   id: 'tradle.PresentationOfTheCompany',
//   title: 'PresentationOfTheCompany',
//   interfaces: ['tradle.Message'],
//   subClassOf: 'tradle.FinancialProduct',
//   type: 'tradle.Model',
//   forms: ['tradle.CustomerIdentification', 'tradle.BusinessInformation'],
//   properties: {
//     '_t': {
//       'type': 'string',
//       'readOnly': true
//     },
//     from: {
//       type: 'object',
//       readOnly: true,
//       ref: 'tradle.Identity'
//     },
//     to: {
//       type: 'object',
//       readOnly: true,
//       ref: 'tradle.Identity'
//     },

//   }
// },

{
  id: 'tradle.CustomerIdentification',
  title: 'Customer identification',
  interfaces: ['tradle.Message'],
  type: 'tradle.Model',
  properties: {
    '_t': {
      'type': 'string',
      'readOnly': true
    },
    from: {
      type: 'object',
      readOnly: true,
      ref: 'tradle.Identity'
    },
    to: {
      type: 'object',
      readOnly: true,
      ref: 'tradle.Identity'
    },
    contactsIntroducingCompany: {
      type: 'array',
      items: {
        'type': 'object',
        'properties': {
          'contact': {
            'type': 'object',
            'ref': 'tradle.Identity',
            'skipLabel': true
          },
          'email': {
            'type': 'string',
          },
          'phone': {
            'type': 'string',
          }
        }
      },
    },
    introducedParentCompany: {
      type: 'object',
      ref: 'tradle.Organization',
      title: 'Introduced Parent Company (legally registered name of entity) '
    },
    accountName: {
      type: 'string',
      title: 'Account name',
    },
    officeAddress: {
      type: 'string'
    },
    countryOfOrigin: {
      type: 'object',
      ref: 'tradle.Country'
    },
    contactPerson: {
      type: 'object',
      ref: 'tradle.Identity'
    },
    isYouCompanyListed: {
      type: 'object',
      ref: 'tradle.Organizations'
    },
    stockExchange: {
      type: 'object',
      ref: 'tradle.StockExchange',
      description: 'Stock exchange at which your company is listed'
    }
// Telephone number      
// E-mail      

  }
},

// {
//   id: 'tradle.BusinessInformation',
//   title: 'Business Information',
//   interfaces: ['tradle.Message'],
//   type: 'tradle.Model',
//   properties: {
//     '_t': {
//       'type': 'string',
//       'readOnly': true
//     },
//     from: {
//       type: 'object',
//       readOnly: true,
//       ref: 'tradle.Identity'
//     },
//     to: {
//       type: 'object',
//       readOnly: true,
//       ref: 'tradle.Identity'
//     },
//     businessSector: {
//       type: 'object',
//       ref: 'tradle.BusinessSector',
//       description: 'Business sector & Business of the company'
//     },
//     sourceOfFunds: {
//       type: 'object',
//       ref: 'tradle.SourceOfFunds',
//       description: 'Source of Funds and information about the company’s equity capital'
//     },
//     mainReason: {
//       type: 'object',
//       description: 'Main (fiscal) reason for using Rabobank'
//     },
//     consolidatedGlobalVolumeOfSales: {
//       type: 'number',
//       title: 'Consolidated global volume of sales'
//     },



// Consolidated global volume of sales

// (p.a.)

// Global  number of employees      

// Expected volume of sales/turnover

// over the Rabobank account(s) or

// expected volume of sales of the Dutch

// operations

// In which countries does your company

// have entities, suppliers or customers?

// Does your company have subsidiaries

// in any of the countries designated by

// 1 Only relevant if it is required that the account holds a different name than the Legal entity opening the account.

// 2 www.fatf-gafi.org

// the FATF as high-risk or non-

// cooperative jurisdictions?2
  // }
//}

];

var models = {
  getModels: function() {
    return voc;
  }
}
module.exports = models;

// {
//   'id': 'tradle.Community',
//   'type': 'tradle.Model',
//   'title': 'Community',
//   'plural': 'Communities',
//   icon: 'person-stalker',
//   'properties': {
//     '_t': {
//       'type': 'string',
//       'readOnly': true
//      },
//      'title': {
//       'type': 'string',
//       'displayName': true,
//      },
//      'description': {
//       'type': 'string',
//       'title': 'Description',
//       maxLength: 2000
//      },
//      'owner': {
//       'type': 'object',
//       'readOnly': true,
//       'ref': 'tradle.Identity',
//      },
//      // 'to': {
//      //   'type': 'object',
//      //   'ref': 'tradle.Identity',
//      //   'displayName': true,
//      //   'readOnly': true
//      // },
//      'blockchainUrl': {
//        'type': 'string',
//        'readOnly': true
//      },
//      'transactionHash': {
//        'readOnly': true,
//        'type': 'string'
//      },
//      'time': {
//        'type': 'date',
//        'readOnly': true,
//      },
//     'posts': {
//       type: 'array',
//       items: {
//         ref: 'tradle.Post',
//         backlink: 'relatedTo'
//       },
//     },
//     'photos': {
//       'type': 'array',
//       'items': {
//         'type': 'object',
//         'properties': {
//           'tags': {
//             'type': 'string',
//             'skipLabel': true
//           },
//           'url': {
//             'type': 'string',
//             'readOnly': true
//           }
//         }
//       },
//       'required': ['url']
//     },
//   },
//   'required': [
//     'title', 'description'
//   ],
//   'gridCols': [
//     'title', 'description', 'owner', 'posts'
//   ],
//   'viewCols': [
//     'title', 'description', 'owner', 'photos'
//   ],
// },

// {
//   'id': 'tradle.Post',
//   'type': 'tradle.Model',
//   'title': 'Post',
//   'icon': 'social-buffer-outline',
//   'properties': {
//     '_t': {
//       'type': 'string',
//       'readOnly': true
//      },
//      'relatedTo': {
//       'type': 'object',
//       'readOnly': true,
//       'ref': 'tradle.Community',
//      },
//      'title': {
//       'type': 'string',
//       'displayName': true,
//      },
//      // 'description': {
//      //  'type': 'string',
//      //  'title': 'Description',
//      //  maxLength: 2000
//      // },
//      url: {
//        type: 'string'
//      },
//      'from': {
//       'type': 'object',
//       'readOnly': true,
//       'ref': 'tradle.Identity',
//      },
//      'blockchainUrl': {
//        'type': 'string',
//        'readOnly': true
//      },
//      'transactionHash': {
//        'type': 'string',
//        'readOnly': true
//      },
//      'time': {
//        type: 'date',
//        readOnly: true
//      },
//      comments: {
//       'type': 'array',
//       items: {
//         ref: 'tradle.PostComment',
//         backlink: 'post'
//       }
//      },
//     'photos': {
//       'type': 'array',
//       'items': {
//         'type': 'object',
//         'properties': {
//           'tags': {
//             'type': 'string',
//             'skipLabel': true
//           },
//           'url': {
//             'type': 'string',
//             'readOnly': true
//           }
//         }
//       },
//       'required': ['url']
//     },
//   },
//   'required': [
//     'relatedTo', 'title', 'url'
//   ],
//   'viewCols': [
//     'title', 'url', 'from', 'time'
//   ],
//   'gridCols': [
//     'title', 'url', 'from', 'time', 'comments'
//   ]
// },
// {
//   'id': 'tradle.PostComment',
//   'type': 'tradle.Model',
//   'title': 'Comment',
//   'icon': 'chatboxes',
//   'properties': {
//     '_t': {
//       'type': 'string',
//       'readOnly': true
//      },
//      'message': {
//       'type': 'string',
//       'displayName': true,
//       maxLength: 2000
//      },
//      'from': {
//        'type': 'object',
//        'readOnly': true,
//        'ref': 'tradle.Identity',
//      },
//      'post': {
//        'type': 'object',
//        'ref': 'tradle.Post',
//        readOnly: true
//        // 'displayName': true,
//      },
//      'time': {
//        'type': 'date',
//        'readOnly': true,
//        'displayName': true
//      },
//     'photos': {
//       'type': 'array',
//       'items': {
//         'type': 'object',
//         'properties': {
//           'tags': {
//             'type': 'string',
//             'skipLabel': true
//           },
//           'url': {
//             'type': 'string',
//             'readOnly': true
//           }
//         }
//       },
//       'required': ['title', 'url']
//     },
//     relatedTo: {
//       type: 'object',
//       ref: 'tradle.Community',
//       readOnly: true
//     }
//   },
//   'required': [
//     'message', 'post', 'relatedTo'
//   ],
//   'viewCols': [
//     'message', 'post', 'time', 'from'
//   ],
//   'gridCols': [
//     'message', 'time', 'from'
//   ],
// },


// {
//   id: 'tradle.Offer',
//   title: 'Offer',
//   type: 'object',
//   sort: 'dateSubmitted',
//   properties: {
//     '_t': {
//       type: 'string',
//       readOnly: true
//     },
//     dealRef: {
//       type: 'number',
//       readOnly: true
//     },              //* deal reference
//     title: {
//       type: 'string',
//       skipLabel: true,
//       description: 'title is displayed on the offer'
//     },
//     shortTitle: {
//       type: 'string',
//       skipLabel: true,
//       displayName: true
//     },
//     conditions: {
//       maxLength: 2000,
//       type: 'string',
//       description: 'What is this offer for? Limits for personal use and gifts. Phone # for questions and booking. Operating hours. Any special conditions for offer use. Other discounts/bonuses provided by the organization. Omit dates already specified on offer.'
//     },
//     description: {
//       type: 'string',
//       maxLength: 2000,
//       description: 'clearly describe the product/service. Emphasize high value low price contrast. State quality/quantity of the product/service (and why the customer needs it). When in doubt, use "You pay x instead of XX"'
//     },
//     summary: {
//       type: 'string',
//       description: 'Short description of the deal. IMPORTANT for aggregators - must include discount and amount saved.'
//     },
//     submittedBy: {
//       type: 'object',
//       ref: 'tradle.Identity',
//       readOnly: true
//     },
//     photos: {
//       type: 'array',
//       items: {
//         type: 'object',
//         properties: {
//           tags: {
//             type: 'string',
//             title: 'Tags via comma'
//           },
//           url: {
//             type: 'string',
//             readOnly: true
//           }
//         }
//       },
//       required: ['url']
//     },
//     featured: {
//       type: 'date'
//     },
//     expires: {
//       type: 'date'
//     },
//     redeemBy: {
//       description: 'must redeem by this date'
//     },
//     dealValue: {
//       type: 'object',
//       ref: 'tradle.Money',
//       description: '$ price before discount'
//     },
//     dealPrice: {
//       type: 'object',
//       ref: 'tradle.Money',
//       description: '$ price after discount'
//     },
//     dealDiscount: {
//       type: 'object',
//       ref: 'tradle.Money',
//       readOnly: true,
//       formula: 'dealValue - dealPrice',
//       description: '$ discount'
//     },
//     allPurchases: {
//       type: 'array',
//       readOnly: true,
//       items: {
//         type: 'object',
//         ref: 'tradle.OfferBuy'
//       }
//     },
//     offerBuysCount: {
//       type: 'number',
//       readOnly: true
//     },
//     discount: {
//       type: 'number',
//       suffix: '%',
//       minimum: 1,
//       maximum: 99,
//       readOnly: true,
//       description: '% discount',
//       formula: '((dealValue - dealPrice)/dealValue) * 100',
//     },
//     dealStatus: {
//       type: 'string',
//       readOnly: true,
//       oneOf: [
//         'Deal is over',
//         'Deal is going',
//         'Not featured yet'
//       ]
//     },
//     availableLocations: {
//       type: 'array',
//       readOnly: true,
//       ref: 'tradle.RedemptionLocation'
//     },
//     organization: {
//       type: 'object',
//       ref: 'tradle.Organization'
//     },
//     canceled: {
//       type: 'boolean',
//       skipOnCreate: true
//     },
//     canceledBy: {
//       type: 'object',
//       ref: 'tradle.Identity',
//       readOnly: true
//     },
//     dateCanceled: {
//       type: 'date',
//       readOnly: true
//     },
//     dateSubmitted: {
//       type: 'date',
//       readOnly: true
//     },
//   },
//   required: ['title', 'photos', 'shortTitle', 'description', 'dealValue', 'dealPrice', 'organization', 'expires'],
//   gridCols: ['shortTitle', 'photos', 'dealPrice', 'discount', 'organization', 'expires', 'dealStatus'],
//   viewCols: ['title', 'photos', 'organization', 'dealPrice', 'dealValue', 'dealDiscount', 'description', 'conditions', 'discount', 'featured', 'expires', 'offerBuysCount', 'dealStatus'],
// },
// {
//   id: 'tradle.OfferBuy',
//   type: 'object',
//   title: 'Offer Buy',
//   properties: {
//     '_t': {
//       type: 'string',
//       readOnly: true
//     },
//     purchaseNumber: {
//       type: 'number',
//       readOnly: 'true'
//     },
//     transactionId: {
//       type: 'string',
//       readOnly: true
//     },
//     customer: {
//       type: 'object',
//       ref: 'tradle.Identity',
//       readOnly: true
//     },
//     offer: {
//       type: 'object',
//       ref: 'tradle.Offer',
//       readOnly: true
//     },
//     organization: {
//       type: 'object',
//       readOnly: true,
//       ref: 'tradle.Organization'
//     },
//     title: {
//       type: 'string',
//       description: 'title is displayed on the offer'
//     },
//     shortTitle: {
//       type: 'string',
//     },
//     purchaseTime: {
//       type: 'date',
//       readOnly: true
//     },
//     email: {
//       type: 'string'
//     },
//     dealValue: {
//       type: 'object',
//       ref: 'tradle.Money',
//       description: 'price before discount'
//     },
//     dealPrice: {
//       type: 'object',
//       ref: 'tradle.Money',
//     },
//     dealDiscount: {
//       type: 'object',
//       ref: 'tradle.Money',
//       readOnly: true
//     },
//     redeemed: {
//       type: 'boolean'
//     },
//     location: {
//       type: 'object',
//       ref: 'tradle.RedemptionLocation'
//     },
//     photos: {
//       type: 'array',
//       readOnly: true,
//       items: {
//         type: 'object',
//         properties: {
//           tags: {
//             type: 'string',
//             title: 'Tags via comma'
//           },
//           url: {
//             type: 'string',
//             readOnly: true
//           }
//         }
//       },
//       required: ['url']
//     },
//   },
//   required: ['purchaseNumber', 'customer', 'offer'],
// },
// {
//   id: 'tradle.RedemptionLocation',
//   type: 'object',
//   properties: {
//     '_t': {
//       type: 'string',
//       readOnly: true
//     },
//     offer: {
//       type: 'object',
//       ref: 'tradle.Offer',
//       readOnly: true
//     },
//     address: {
//       readOnly: true,
//       formula: 'organization.address'
//     },
//     organization: {
//       type: 'object',
//       readOnly: true,
//       ref: 'tradle.Organization'
//     },
//     photos: {
//       type: 'array',
//       formula: 'organization.photos'
//     }
//   },
//   required: ['offer', 'organization']
// },


// {
//   'id': 'tradle.Organization',
//   'type': 'tradle.Model',
//   'title': 'Organization',
//   'properties': {
//     '_t': {
//       'type': 'string',
//       'readOnly': true
//      },
//      'name': {
//        'type': 'string',
//        'displayName': true,
//        'skipLabel': true
//      },
//      'contacts': {
//       'type': 'array',
//       'items': {
//         'type': 'object',
//         'ref': 'tradle.Identity',
//        }
//      },
//      'photos': {
//       'type': 'array',
//       'items': {
//         'type': 'object',
//         'properties': {
//           'tags': {
//             'type': 'string'
//           },
//           'url': {
//             'type': 'string',
//             'skipLabel': true
//           }
//         }
//       },
//       'required': ['url']
//      },
//     'city': {
//       'type': 'string'
//     },
//     'country': {
//       'type': 'string'
//     },
//     'postalCode': {
//       'type': 'number'
//     },
//     'region': {
//       'type': 'string'
//     },
//     'street': {
//       'type': 'string'
//     },
//     'formattedAddress': {
//       'type': 'string',
//       'displayAs': ['street', ',', 'city', ',', 'region', 'postalCode'],
//       'title': 'Address'
//     }
//   },
//   'required': ['name'],
//   'viewCols': [
//     'name',
//     'street',
//     'city',
//     'region',
//     'country',
//   ],
//   'editCols': [
//     'name',
//     'street',
//     'city',
//     'region',
//     'country',
//   ]
// },

//{
//   'id': 'tradle.VerificationRequest',
//   'type': 'tradle.Model',
//   'title': 'Verification Request',
//   'interfaces': ['tradle.Message'],
//   'style': {'backgroundColor': '#F4F5E6'},
//   'properties': {
//     '_t': {
//       'type': 'string',
//       'readOnly': true
//      },
//      'message': {
//       'type': 'string',
//       'title': 'Description',
//       'displayName': true,
//      },
//      'from': {
//       'type': 'object',
//       'readOnly': true,
//       'ref': 'tradle.Identity',
//      },
//      'to': {
//        'type': 'object',
//        'ref': 'tradle.Identity',
//        'displayName': true,
//        'readOnly': true
//      },
//      'blockchainUrl': {
//        'type': 'string',
//        'readOnly': true
//      },
//      'transactionHash': {
//        'readOnly': true,
//        'type': 'string'
//      },
//      'time': {
//        'type': 'date',
//        'readOnly': true,
//      },
//     'photos': {
//       'type': 'array',
//       'items': {
//         'type': 'object',
//         'properties': {
//           'tags': {
//             'type': 'string',
//             'skipLabel': true
//           },
//           'url': {
//             'type': 'string',
//             'readOnly': true
//           }
//         }
//       },
//       'required': ['title', 'url']
//     },
//     'verifications': {
//       'type': 'array',
//       'readOnly': true,
//       'items': {
//         ref: 'tradle.Verification',
//         backlink: 'document'
//       },
//     }
//   },
//   'required': [
//     'to', 'message', 'from'
//   ],
//   'gridCols': [
//     'message', 'time'
//   ],
//   'viewCols': [
//     'message', 'time', 'photos', 'verifications'
//   ],
// },

// {
//   'id': 'tradle.AddressVerification',
//   'type': 'tradle.Model',
//   'title': 'Verify Address',
//   'interfaces': ['tradle.Message'],
//   'style': {'backgroundColor': '#FAEDE1'},
//   'properties': {
//     '_t': {
//       'type': 'string',
//       'readOnly': true
//      },
//      'message': {
//       'type': 'string',
//       'displayName': true,
//       'title': 'Description',
//      },
//      'blockchainUrl': {
//        'type': 'string',
//        'readOnly': true
//      },
//      'transactionHash': {
//        'readOnly': true,
//        'type': 'string'
//      },
//      'time': {
//        'type': 'date',
//        'readOnly': true,
//      },
//     'street': {
//       'type': 'string'
//     },
//     'city': {
//       'type': 'string'
//     },
//     'region': {
//       'type': 'string'
//     },
//     'postalCode': {
//       'type': 'number'
//     },
//     'country': {
//       'type': 'string'
//     },
//     'formattedAddress': {
//       'type': 'string',
//       'displayAs': ['street', ',', 'city', ',', 'region', 'postalCode'],
//       'title': 'Address',
//       'skipLabel': true,
//       'readOnly': true
//     },
//      'from': {
//       'type': 'object',
//       'readOnly': true,
//       'ref': 'tradle.Identity',
//      },
//      'to': {
//        'type': 'object',
//        'ref': 'tradle.Identity',
//        'displayName': true,
//        'readOnly': true
//      },
//     'photos': {
//       'type': 'array',
//       'items': {
//         'type': 'object',
//         'properties': {
//           'tags': {
//             'type': 'string',
//             'skipLabel': true
//           },
//           'url': {
//             'type': 'string',
//             'readOnly': true
//           }
//         }
//       },
//       'required': ['title', 'url']
//     },
//     'verifications': {
//       'type': 'array',
//       'readOnly': true,
//       'items': {
//         'backlink': 'document',
//         'ref': 'tradle.VerificationOfAddress'
//       },
//     }
//   },
//   'required': [
//     'to', 'from', 'message', 'street', 'city', 'region', 'postalCode'
//   ],
//   'gridCols': [
//     'message', 'formattedAddress', 'time'
//   ],
//   'viewCols': [
//     'message', 'formattedAddress', 'blockchainUrl', 'time', 'verifications'
//   ],
// },
//
// {
//   'id': 'tradle.VerificationOfAddress',
//   'type': 'tradle.Model',
//   'title': 'Verification',
//   'subClassOf': 'tradle.Verification',
//   'interfaces': ['tradle.Message'],
//   'style': {'backgroundColor': '#E7E6F5'},
//   'autoCreate': true,
//   'properties': {
//     '_t': {
//       'type': 'string',
//       'readOnly': true
//      },
//      'document': {
//       'type': 'object',
//       'readOnly': true,
//       'ref': 'tradle.AddressVerification',
//       'title': 'Verifying document',
//      },
//      'message': {
//       'type': 'object',
//       'title': 'Description',
//       'displayName': true,
//      },
//      'ver1': {
//         type: 'string'
//      },
//      'ver2': {
//         type: 'string'
//      },
//      'ver3': {
//         type: 'string'
//      },
//      'ver4': {
//         type: 'boolean'
//      },
//      'to': {
//       'type': 'object',
//       'title': 'Owner',
//       'ref': 'tradle.Identity',
//       'displayName': true,
//       'readOnly': true,
//      },
//      'from': {
//        'title': 'Verifier',
//        'type': 'object',
//        'readOnly': true,
//        'ref': 'tradle.Identity',
//        'displayName': true
//      },
//      'blockchainUrl': {
//        'type': 'string',
//        'readOnly': true
//      },
//      'transactionHash': {
//        'type': 'string',
//        'readOnly': true
//      },
//      'time': {
//        'type': 'date',
//        skipLabel: true,
//        'readOnly': true,
//      },
//       organization: {
//         type: 'object',
//         readOnly: true,
//         ref: 'tradle.Organization'
//       },
//   },
//   'required': [
//     'ver1', 'ver2', 'ver3', 'to', 'from', 'time'
//   ],
//   'viewCols': [
//     'ver1', 'ver2', 'ver3', 'to', 'from', 'time', 'organization'
//   ],
//   'gridCols': [
//     'ver1', 'ver2', 'ver3', 'time', 'organization'
//   ],
// },
// {
//   id: 'tradle.NewMessageModel',
//   type: 'object',
//   title: 'New message model',
//   properties: {
//     '_t': {
//       'type': 'string',
//       'readOnly': true
//      },
//      'url': {
//       'type': 'string',
//       'displayName': true
//      }
//   },
//   required: ['url']
// },
// {
//   id: 'tradle.CurrentAccounts',
//   type: 'tradle.Model',
//   title: 'Current Accounts',
//   subClassOf: 'tradle.FinancialProduct',
//   properties: {
//     '_t': {
//       'type': 'string',
//       'readOnly': true
//     },
//     forms: {
//       type: 'string',
//       readOnly: true,
//       items: ['tradle.AboutYou', 'tradle.YourMoney']
//     },
//     aboutYou: {
//       type: 'object',
//       ref: 'tradle.AboutYou'
//     },
//     yourMoney: {
//       type: 'object',
//       ref: 'tradle.YourMoney'
//     },
//     lastForm: {
//       type: 'object',
//       readOnly: true,
//       ref: 'tradle.Model'
//     },
//   },
// },
// {
//   id: 'tradle.AboutYou',
//   title: 'About You',
//   type: 'tradle.Model',
//   properties: {
//     '_t': {
//       'type': 'string',
//       'readOnly': true
//     },
//     product: {
//       type: 'object',
//       ref: 'tradle.FinancialProduct'
//     },
//     residentialStatus: {
//       type: 'string',
//       oneOf: [
//         {'1': 'Home owner (with mortgage)'},
//         {'2': 'Home owner (without mortgage)'},
//         {'3': 'Tenant (private)'},
//         {'4': 'Tenant (counsel)'},
//         {'5': 'Living with parents'}
//       ]
//     },
//     maritalStatus: {
//       type: 'string',
//       oneOf: [
//         {'1': 'Single'},
//         {'2': 'Married / civil partnership'},
//         {'3': 'Widowed'},
//         {'4': 'Divorced/Dissolved civil partnership'},
//         {'5': 'Separated'}
//       ]
//     },
//     dependants: {
//       type: 'number',
//       description: 'How many people who live with you depend on you financially?'
//     },
//     nationality: {
//       type: 'string',
//       oneOf: [
//         {'1': 'British'},
//         {'2': 'American'},
//         {'3': 'French'},
//         {'4': 'Russian'},
//         {'5': 'Dutch'}
//       ]
//     },
//     inUKFrom: {
//       type: 'date',
//       description: 'When did you arrive in the UK?'
//     },
//     countryOfBirth: {
//       type: 'string',
//       oneOf: [
//         {'1': 'UK'},
//         {'2': 'US'},
//         {'3': 'France'},
//         {'4': 'Russia'},
//         {'5': 'Netherlands'}
//       ]
//     },
//     taxResidency: {
//       type: 'string',
//       description: 'Country/countries in which you have tax residency (or been resident of for the past 2 years):',
//       oneOf: [
//         {'1': 'UK'},
//         {'2': 'US'},
//         {'3': 'France'},
//         {'4': 'Russia'},
//         {'5': 'Netherlands'}
//       ]
//     },
//     fundAccount: {
//       type: 'string',
//       description: 'How will you fund your account?',
//       oneOf: [
//         {'1': 'Cash'},
//         {'2': 'Check'},
//         {'3': 'Direct to Bank'}
//       ]
//     },
//     purposeOfTheAccount: {
//       type: 'string',
//       oneOf: [
//         {'1': 'Benefit Payments'},
//         {'2': 'Bills / Expenses'},
//         {'3': 'Capital Raising ( Scottish Widows Bank )'},
//         {'4': 'Inheritance'},
//         {'5': 'Probate / Executor / Trustee'},
//         {'6': 'Salary / Pension / Other Regular Income'},
//         {'7': 'Savings'},
//         {'8': 'Spending money'},
//         {'9': 'Student'}
//       ]
//     },
//     phones: {
//       type: 'array',
//       items: {
//         type: 'string',
//         properties: {
//           phoneType: {
//             type: 'string',
//             oneOf: [
//               {'1': 'Home'},
//               {'2': 'Mobile'},
//               {'3': 'Work'},
//             ]
//           },
//           number: {
//             type: 'number'
//           }
//         }
//       },
//       required: ['url']
//     },
//     emailAddress: {
//       type: 'string',
//     }
//   }
// },
// {
//   id: 'tradle.YourMoney',
//   title: 'Your Money',
//   type: 'tradle.Model',
//   properties: {
//     '_t': {
//       'type': 'string',
//       'readOnly': true
//     },
//     employer: {
//       type: 'object',
//       ref: 'tradle.Organization'
//     },
//     monthlyIncome: {
//       type: 'object',
//       ref: 'tradle.Money'
//     },
//     whenHired: {
//       type: 'date'
//     },
//   }
// },
