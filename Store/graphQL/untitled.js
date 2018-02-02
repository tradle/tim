// connecting in samplebot/index.ts
// see towards the end

// if (handleMessages && plugins['complyadvantage']) {
//   productsAPI.plugins.use(createComplyAdvantagePlugin({
//     apiKey: plugins['complyadvantage'].apiKey
//   }))
// }


const BASE_URL = 'https://api.complyadvantage.com/'

class ComplyAdvantageAPI {
  constaructor({ bot, apiKey }) {
    this.bot = bot
    this.apiKey = apiKey
  },
  async _fetch(resource, application) {
    let body = {
      search_term: {
        last_name: resource.name
      },
      fuzziness: 1,
      filters: {
        types: resource.types || ['sanction']
      }
    }
    if (resource.year)
      body.filters.birth_year = resource.year

    body = JSON.stringify(body)

    // api_key = "okO0tAtGFHtxLnTqtCclH4h5VQzXpTIO"
    let url = `https://api.complyadvantage.com/searches?api_key=${api_key}`
    let json
    try {
      let res = await fetch(url, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body
                            })
      json = await res.json()
    } catch (err) {
      console.log('success', err)
    }
    let rawData = json  &&  json.content.data
    let hits = rawData  && rawData.hits.filter((hit) => hit.entity_type === 'company')
    if (hits  &&  hits.length)
      await createSunctionsCheck({application, rawData})
    else
      await createVerification(resource, rawData)
  },

  async createSunctionsCheck({ application, rawData }) {
    let resource = {
      [TYPE]: 'tradle.complyadvantage.SanctionsCheck',
      status: rawData ? 'Failure' : 'Success',
    }
    if (rawData)
      resource.rawData = rawData

    const check = await this.bot.save(resource)

    if (!application.checks) application.checks = []

    application.checks.push(buildResource.stub(check))
  },

  async createVerification({ applicant, form, report }) {
    const method = {
      [TYPE]: 'tradle.APIBasedVerificationMethod',
      api: {
        [TYPE]: 'tradle.API',
        name: 'complyadvantage'
      },
      reference: [
         { queryId: 'report:' + report.id }
      ],
      aspect: 'sunctions check',
      rawData: report
    }
    let verification = buildResource({
                           models,
                           model: VERIFICATION
                         })
                         .set({
                           document: form,
                           method
                           // documentOwner: applicant
                         })
                         .toJSON()
    const verificationR = await this.bot.save(verification)
  }
}
module.exports = function complyAdvantageAdapter(bot, name) {
  return {
    eligibilityCheck: function({ apiKey, req }) {
      const complyAdvantage = new ComplyAdvantageAPI({ bot, apiKey })
      const { user, application } = req
      let forms = application.forms
      let fiter = forms.forEach((f) => {

      })
      if (payload[TYPE] === 'tradle.CustomerEntity') {
        const result = await complyAdvantage.checkSanctions({
          company...
        })

        if (!result.success) return

        const verification = complyAdvantage.createVerification({

        })
      }
    }
  }
}
// async createVerification = ({ applicant, form, report }) => {
//  const aspect = report.name === 'facial_similarity' ? 'facial similarity' : 'authenticity'
//  const method = {
//  [TYPE]: 'tradle.APIBasedVerificationMethod',
//  api: {
//  [TYPE]: 'tradle.API',
//  name: 'onfido'
//  },
//  reference: [{ queryId: 'report:' + report.id }],
//  aspect,
//  rawData: report
//  }

//  const score = report && report.properties && report.properties.score
//  if (typeof score === 'number') {
//  method.confidence = score
//  }

//  return buildResource({
//  models,
//  model: VERIFICATION
//  })
//  .set({
//  document: form,
//  method
//  // documentOwner: applicant
//  })
//  .toJSON()
// }


// tradle.complyadvantage.SanctionsCheck

// curl -XPOST https://api.complyadvantage.com/searches?api_key=okO0tAtGFHtxLnTqtCclH4h5VQzXpTIO -d '{
//   "search_term": {"last_name": "Khanani"},
//   "fuzziness": 1,
//   "filters": {
//     "types": ["sanction"],
//     "birth_year": 1970
//   }
// }'

// how to config to do [sanctions] for company and person
// should be probably on lens since no

// Verification
