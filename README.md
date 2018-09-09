
*tim = Trust in Motion*

Welcome to the main repo for the Tradle app! On mobile we use React Native (RN), and on web React Native Web (RNW). The web app currently lives on the `web` branch.

# Development

## Prerequisites

- node 8.10
- npm 3.10
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
cd fastlane
bundle install # install fastlane and other gems
cd ../../

# Android
cd android/fastlane
bundle install
cd ../../
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
fastlane codepush 
# actually build and push
fastlane codepush dry_run:false 
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

Build + deploy a staging release to Crashlytics (Fabric):

```sh
fastlane beta
```

Deploy a release to the Google Play Store alpha/beta track:

```sh
fastlane release_alpha
fastlane release_beta
```

Deploy a production release:

```sh
fastlane release_prod
```

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
