#! /usr/bin/env node

var fs = require('fs')
var proc = require('child_process')

var scrollViewPath = './node_modules/react-native/Libraries/Components/ScrollView/ScrollView.js'
var scrollView = fs.readFileSync(scrollViewPath, {encoding:'utf8'})
var hacked = scrollView
  .replace('RCTScrollViewConsts.KeyboardDismissMode.None', '\'none\'')
  .replace('RCTScrollViewConsts.KeyboardDismissMode.Interactive', '\'interactive\'')
  .replace('RCTScrollViewConsts.KeyboardDismissMode.OnDrag', '\'on-drag\'')

if (hacked !== scrollView) {
  fs.writeFileSync(scrollViewPath, hacked)
}

proc.execSync('npm dedupe && npm install --save levelup@0.18', { stdio: 'inherit' })