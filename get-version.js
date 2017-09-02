#!/usr/bin/env node

const { getVersion } = require('./build-utils')
process.stdout.write(getVersion({ platform: process.argv[2] }))
