
## Troubleshooting

### Fastlane

#### troubleshooting on ios:

- make sure Code Signing Identity in Build Settings is set to Tradle Inc Distribution for Staging & Release, iOS Developer for Debug
- don't use !use_frameworks in Podfile
- switch to manual signing before building for appstore


### Xcode

issue: app built for device doesn't run on simulator
solution: from Xcode, run Release to install on a simulator. Then find the Tradle.app file in ~/Library/Developer/Xcode/DerivedData/Tradle-xxxx/Build/Products/Release-iphonesimulator/Tradle.app . You can drag it onto the simulator of your choice on another machine.
