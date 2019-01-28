# Tradle App

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Development](#development)
  - [Prerequisites](#prerequisites)
    - [iOS](#ios)
  - [Install](#install)
    - [Mobile](#mobile)
    - [Web](#web)
  - [Run in Dev Mode](#run-in-dev-mode)
    - [Mobile](#mobile-1)
      - [Web](#web-1)
  - [Release](#release)
    - [Prerequisites](#prerequisites-1)
    - [Mobile](#mobile-2)
      - [Version and tag](#version-and-tag)
      - [Code Push](#code-push)
      - [App Store](#app-store)
        - [iOS](#ios-1)
        - [Android](#android)
- [Troubleshooting](#troubleshooting)
  - [Troubleshooting iOS builds](#troubleshooting-ios-builds)
  - [Troubleshooting android builds](#troubleshooting-android-builds)


<!-- END doctoc generated TOC please keep comment here to allow auto update -->

*tim = Trust in Motion*

Welcome to the main repo for the Tradle app! On mobile we use React Native (RN), and on web React Native Web (RNW). The web app currently lives on the `web` branch.

# Development

## Prerequisites

- node 8.10
- npm 3.10 (if you have a newer one, downgrade it: npm install -g npm@3.10
- [React Native Debugger](https://github.com/jhen0409/react-native-debugger)

### iOS

Install the latest Xcode command line tools:

```sh
xcode-select --install
```

## Install

We recommend you have two separate development environments for mobile and web so you switch off quickly without going through a length `npm install` in between.

### Mobile

```sh
git clone https://github.com/tradle/tim tradle-app
cd tradle-app
npm install
# iOS
# install more dependencies via CocoaPods
cd iOS
pod install
bundle install # install fastlane and other gems
cd fastlane
fastlane install_plugins
cd ../../

# Android
cd android
bundle install
cd fastlane
fastlane install_plugins
cd ../
```

### Web

```sh
git clone https://github.com/tradle/tim tradle-app-web
cd tradle-app
git checkout -b web origin/web
npm install
```

## Run in Dev Mode

### Mobile

1. Start the RN packager

```sh
npm start
```

2. Deploy the app to a simulator / device

```sh
react-native run-ios # to deploy to device, open Xcode, and Run with your device selected
react-native run-android
```

3. Open the React Native Debugger if you want to debug JS

#### Web

1. Start Webpack

```sh
npm start
```

2. Open `http://localhost:3001` in the browser

## Release

### Prerequisites

- [jq](https://stedolan.github.io/jq/download/): a great command line JSON parser (On OS X, you can `brew install jq`)
- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/installing.html)
- ask someone at Tradle for access to release credentials

```sh
npm run loadsecrets
```

### Mobile

There are several release lifecycles, broadly: 
- publishing to the app store. This is required any time there's a change to any native component (Obj-C / Java).
- pushing a new JS bundle via [React Native Code Push](https://github.com/Microsoft/react-native-code-push) 

The Apple App Store takes a while to approve releases, and even the Google Play Store can take an hour to publish your latest release. And after publishing, you still need to get your users to install the latest version.

Code Push to the rescue! Code Push allows to release new javascript bundles to already running apps so they can update themselves. Reminder: React Native apps consist of native code (Obj-C / Java) and a javascript bundle. Code Push can only push a new javascript bundle and assets such as images. If native code has changed, you MUST publish through the app store.

To build and publish releases for iOS and Android, we use [fastlane](https://github.com/fastlane/fastlane).

To see what fastlane actions are available, `cd` to the `iOS/` or `android/` dirs and run `fastlane`

Potential improvements:
- https://blog.bam.tech/developper-news/deploy-your-react-native-app-to-the-app-store-with-the-push-of-a-button

#### Version and tag

Create a tagged commit for a given type of version release. Keep in mind that build numbers mean different things in iOS and Android.

- Android: build number inexorably increases. Maybe the build number ice caps are melting? Someone should check.
- iOS: build number currently resets to 0 after one of major/minor/patch is incremented. However, maybe we should change this to be more like Android.

```sh
# in iOS/ or android/
fastlane inc_build
fastlane inc_patch
fastlane inc_minor
fastlane inc_major
```

#### Code Push

```sh
# in iOS/ or android/
# dry run
fastlane codepush dry_run:true 
# actually build and push
fastlane codepush 
# promote from Staging to Release
fastlane codepush_promote_to_release
```

#### App Store

So you changed something on the native side? Or maybe you want to spare users the extra refresh? Let's do it.

*Note: the approaches for iOS and Android a little different. It would be good to unify them*

##### iOS

Start by pushing a build to TestFlight and Crashlytics:

```sh
fastlane beta
```

Then publish to the App Store

```sh
fastlane release
```

##### Android

Deploy a release to the Google Play Store internal track (private to Tradle devs and individually added users).

```sh
fastlane release_staging
```

Deploy a release to the Google Play Store closed alpha or open beta tracks:

```sh
fastlane release_alpha
fastlane release_beta
```

Deploy a production release:

```sh
fastlane release_prod
```

### Web

#### Build

To understand what to build, you should know where the web build will live.

Web builds currently live in several places:
- staging (appdev.tradle.io): 
- production (app.tradle.io): same as staging, but hopefully more thoroughly tested
- packaged in docker images 
  - `tradle/web-app:cloud` same as the staging/production build
  - `tradle/web-app:localstack` same as staging/production build, with the exception that it has different default chat channels. This image isn't really used often.

To run a development server, simply run `npm start` and open `localhost:3001`

To make a production build: `npm run build:prod`

To make a production build image: `npm run build:prod:image`

#### Deploy

**WARNING**: before you deploy, you must create a build. Otherwise you might deploy an empty bundle.

##### Sanity check

Once you've created a build, you can give it a short test run. Run `npm run prod` and open `localhost:3000` (3000=prod, 3001=dev).

##### Staging

Run `git describe --abbrev=0 --tags` and make sure that the tag has format `x.x.x.x-web`

If it does not create tag manually.

To deploy the latest build to staging (appdev.tradle.io), run `npm run deploy:dev`

It will ask you several questions, to which you can say `y` (but only after reading them)

It may take a few minutes for staging to be updated. You can check the git hash on the home page to see if it updated or not.

To rollback the staging build to the previous staging build you need to run `npm run rollback:dev`

##### Production

To promote the build from staging to production (appdev.tradle.io -> app.tradle.io), run `npm run deploy:promote`

It will ask you several questions, and may take a few minutes to be updated. Check the git hash on the home page.

To rollback the production build to the previous production build you need to run `npm run rollback:prod`

# Troubleshooting

This is a complex app. Sometimes things go wrong. Have a good cry, then read on.

Many errors are documented widely in the various React Native communities. Some are specific to our setup.

Because this module relies on functionality that in Node.js is handled by core libraries, we rely on a number of shims to approach compatibility with Node.js. If you're used webpack/browserify to bundle a Node.js app, you might be familiar with this concept. To install these shims and monkeypatch substitution mappings (`browser` and `react-native` fields) through `package.json` files in the dependency tree, we've developed [rn-nodeify](https://github.com/tradle/rn-nodeify). Yes, the monkeypatching is unfortunate, but at the moment there doesn't seem to be a more stable solution to this problem. This is done in the `postinstall` scripts.

With that in mind, whenever you do anything that changes the dependency tree (e.g. `npm install` / `npm uninstall`) if you experience some problem with the packager, it is often a case of running `npm run postinstall`, and then restarting the packager.

Memorize these commands, you'll need them:

```sh
watchman watch-del-all
npm start -- --reset-cache # start packager with clean cache
```

## Web

### OSX

If `npm install` gives you errors that look like:

```sh
/Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS11.4.sdk/usr/include/sys/cdefs.h:763:2: error: Unsupported architecture
```

Fix the relevant env variables ([source](https://github.com/facebook/react-native/issues/6831#issuecomment-206074897)):

```sh
SDKROOT=/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX.sdk/
SDK_DIR=/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX.sdk/
```
## Troubleshooting iOS builds

## iOS builds

- if you're building Staging and see an error during archive that mentions Pods, try running: `./scripts/fix-staging.js` and then trying again

## Troubleshooting Android builds

## Android builds

- if you're building Staging or Release and see an error 
```
[!] Google Api Error: apkUpgradeVersionConflict: APK specifies a version code that has already been used.
```
That means you have left over APK files.

run command
```
rm -rf android/app/build
```
and run `fastlane release`  or  `fastlane release_staging` again.

## Android dev

**Symptom**: red screen of death: 'Unable to load script from assets main.jsbundle...' or 'Could not connect to development server'  
**Causes**: your Android device is not connected, or can't reach your React Native packager's local http server  
**Fix**: Check your device is connected: `adb devices`. Once you see it there, run `adb reverse tcp:8081 tcp:8081` and then refresh on your device  

**Symptom**: red screen of death: Unexpected character '*'  
**Cause**: iOS and Android (in dev mode) need different .babelrc settings  
**Fix**: in .babelrc, the "development" block, find `generators: false`, and set to `true`. Then restart your packager with `--reset-cache`. Please don't commit .babelrc with this change  

**Symptom**: **adb devices** command returns empty list when the device is USB connected.
**Fix**: Make sure your device is not connected as a media device. On your Android phone got Settings -> Developer options -> Networking -> Select USB Configuration
