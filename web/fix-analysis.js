#!/usr/bin/env node

const split = require('split')
var started = false

process.stdin.pipe(split())
  .on('data', function (data) {
    if (!started) {
      if (data === '{') started = true
    }

    if (started) process.stdout.write(data)
  })
