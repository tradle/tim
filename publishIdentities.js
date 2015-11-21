#!/usr/bin/env node

var repub = require('./utils/repub')
var constants = require('@tradle/constants')
var identities = require('./data/myIdentity.json')
  .map(function (i) {
    return {
      keys: i.privkeys,
      identity: toIdentity(i)
    }
  })


function toIdentity (json) {
  json.name = {
    firstName: json.firstName,
    formatted: json.firstName
  }

  if (!json.v) json.v = '0.3'

  var privkeys = json.privkeys
  
  delete json.firstName
  delete json.privkeys
  delete json[constants.ROOT_HASH]
  delete json[constants.CUR_HASH]
  delete json.time
  
  return json
}
