
## Troubleshooting

### Fastlane

#### troubleshooting on ios:

- make sure Code Signing Identity in Build Settings is set to Tradle Inc Distribution for Staging & Release, iOS Developer for Debug
- don't use !use_frameworks in Podfile
- switch to manual signing before building for appstore


### Xcode

issue: app built for device doesn't run on simulator
solution: from Xcode, run Release to install on a simulator. Then find the Tradle.app file in ~/Library/Developer/Xcode/DerivedData/Tradle-xxxx/Build/Products/Release-iphonesimulator/Tradle.app . You can drag it onto the simulator of your choice on another machine.

## Releases

### Codepush

#### iOS

All steps take place in iOS dir:

Scenario:
- You have 1.1.8 in the App Store
- You have 1.1.8, 1.1.9 in TestFlight
- 1.1.9 may have different native code

1. codepush to Staging for 1.1.9 (Staging deployments live in TestFlight): 
fastlane codepush

this pushes to the Staging deployment (the one created with `fastlane beta`)

load 1.1.9 from TestFlight, receive the code push, check that you have the right git hash in the Home Page footer. Test functionality.

2. if you haven't already, check out a v1.1.8-ios branch from the last v1.1.8.x-ios tag, say v1.1.8.12-ios

git checkout -b v1.1.8 v1.1.8.12
git merge master
# resolve any conflicts

# fix Info.plist CFBundleVersion and CFBundleShortVersionString to specify 1.1.8, 1.1.8.12
git add Tradle/Info.plist
git amend

3. check that this version works

4. codepush to Staging for v1.1.8
fastlane codepush

load 1.1.8.x from TestFlight, receive the code push, check that you have the right git hash in the Home Page footer. Test functionality.

5. promote to prod

fastlane codepush_promote_to_release

6. go back to master

git checkout master

## Updating the App's environment variables file

The app takes various API keys from an environment-*.json file (currently environment-cloud.json). This file is downloaded during postinstall, provided you have access.

If you've updated some environment variables, you can push an updated file to S3 with `npm run pushenv`

To check the diff with the file in S3 run `npm run diffenv`