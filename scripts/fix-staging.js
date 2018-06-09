#!/usr/bin/env node

// loosely based on this comment:
//   https://github.com/Microsoft/AppCenter-SDK-React-Native/issues/210#issuecomment-371567486
// and screenshots from here:
//   https://medium.com/@royprashenjeet25/solution-of-appcenter-codepush-multi-deployment-issue-ios-which-i-have-faced-c149813f84dd

const path = require('path')
const writeSync = require('write-file-atomic').sync
const xcode = require('xcode')
const _ = require('lodash')
const STAGING_PODS_CONFIGURATION_BUILD_DIR = '"${PODS_BUILD_DIR}/Release$(EFFECTIVE_PLATFORM_NAME)"'
const STAGING_CONFIGURATION_TEMP_DIR = '"$(PROJECT_TEMP_DIR)/Release$(EFFECTIVE_PLATFORM_NAME)"'
const STAGING_CONFIGURATION_BUILD_DIR = '"$(BUILD_DIR)/Release$(EFFECTIVE_PLATFORM_NAME)"'
const main = {
  CONFIGURATION_TEMP_DIR: STAGING_CONFIGURATION_TEMP_DIR,
  CONFIGURATION_BUILD_DIR: STAGING_CONFIGURATION_BUILD_DIR,
  PODS_CONFIGURATION_BUILD_DIR: STAGING_PODS_CONFIGURATION_BUILD_DIR
}

const sub = {
  PODS_CONFIGURATION_BUILD_DIR: STAGING_PODS_CONFIGURATION_BUILD_DIR
}

const isMain = config => !config.buildSettings.INFOPLIST_FILE
const getProps = config => isMain(config) ? main : sub

const fixProject = projPath => {
  const proj = xcode.project(projPath)
  proj.parseSync()

  const configs = proj.getBuildConfigByName('Staging')

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
