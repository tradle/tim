#!/usr/bin/env node

// loosely based on this comment:
//   https://github.com/Microsoft/AppCenter-SDK-React-Native/issues/210#issuecomment-371567486
// and screenshots from here:
//   https://medium.com/@royprashenjeet25/solution-of-appcenter-codepush-multi-deployment-issue-ios-which-i-have-faced-c149813f84dd
// and fiddling around with xcode instead of living

const path = require('path')
const writeSync = require('write-file-atomic').sync
const xcode = require('xcode')
const _ = require('lodash')

// main
// +      "CONFIGURATION_BUILD_DIR": "\"$(BUILD_DIR)/$(CONFIGURATION_HACK)$(EFFECTIVE_PLATFORM_NAME)\",
// +      "CONFIGURATION_HACK": "Release",
// +      "CONFIGURATION_TEMP_DIR": "\"$(PROJECT_TEMP_DIR)/$(CONFIGURATION_HACK)$(EFFECTIVE_PLATFORM_NAME)\"",
// +      "PODS_CONFIGURATION_BUILD_DIR": "\"${PODS_BUILD_DIR}/$(CONFIGURATION_HACK)$(EFFECTIVE_PLATFORM_NAME)\"",

// others
// +      "CONFIGURATION_HACK": "Release",
// +      "CONFIGURATION_TEMP_DIR": "\"$(PROJECT_TEMP_DIR)/$(CONFIGURATION_HACK)$(EFFECTIVE_PLATFORM_NAME)\"",
// +      "PODS_CONFIGURATION_BUILD_DIR": "\"${PODS_BUILD_DIR}/$(CONFIGURATION_HACK)$(EFFECTIVE_PLATFORM_NAME)\"",


const common = {
  CONFIGURATION_HACK: "Release",
  CONFIGURATION_TEMP_DIR: "\"$(PROJECT_TEMP_DIR)/$(CONFIGURATION_HACK)$(EFFECTIVE_PLATFORM_NAME)\"",
  PODS_CONFIGURATION_BUILD_DIR: "\"${PODS_BUILD_DIR}/$(CONFIGURATION_HACK)$(EFFECTIVE_PLATFORM_NAME)\"",
  CONFIGURATION_BUILD_DIR: "\"$(BUILD_DIR)/$(CONFIGURATION_HACK)$(EFFECTIVE_PLATFORM_NAME)\"",
}

const main = {
  ...common,
  // CONFIGURATION_BUILD_DIR: "\"$(BUILD_DIR)/$(CONFIGURATION_HACK)$(EFFECTIVE_PLATFORM_NAME)\"",
}

const isMain = ({ baseConfigurationReference_comment='', buildSettings }) => {
  return baseConfigurationReference_comment.startsWith('Pods-') &&
    buildSettings.PRODUCT_BUNDLE_IDENTIFIER &&
    buildSettings.PODS_ROOT
}

const getProps = config => isMain(config) ? main : common
const validate = configs => {
  const oneMain = Object.keys(configs).filter(id => isMain(configs[id])).length === 1
  if (!oneMain) {
    throw new Error('expected only one main project...i guess i suck at detecting the main one?')
  }
}

const fixProject = projPath => {
  const proj = xcode.project(projPath)
  proj.parseSync()

  const configs = proj.getBuildConfigByName('Staging')
  validate(configs)

  let fixed
  for (let id in configs) {
    fixed = fixConfig(configs[id]) || fixed
  }

  if (fixed) {
    writeSync(projPath, proj.writeSync())
  }
}

const fixConfig = config => {
  const { buildSettings } = config
  const fixed = getProps(config)
  if (!_.isMatch(buildSettings, fixed)) {
    console.warn(`fixed Pods project`)
    _.extend(buildSettings, fixed)
    return true
  }
}


fixProject(path.resolve(__dirname, '../iOS/Pods/Pods.xcodeproj/project.pbxproj'))
