
#!/bin/bash

# cd node_modules/react-web && npm i fbjs@0.6.1 && rm -rf node_modules/react cd $OLDPWD
# npm i --save react@15.2.0 react-addons-perf@15.2.0 react-dom@15.2.0
cp node_modules/tcomb-form-native/lib/templates/bootstrap/datepicker.ios.js node_modules/tcomb-form-native/lib/templates/bootstrap/datepicker.web.js
cp node_modules/tcomb-form-native/lib/templates/bootstrap/select.ios.js node_modules/tcomb-form-native/lib/templates/bootstrap/select.web.js
cp node_modules/react-native-local-auth/LocalAuth.android.js node_modules/react-native-local-auth/LocalAuth.web.js
cp node_modules/react-native-carousel/CarouselPager.android.js node_modules/react-native-carousel/CarouselPager.web.js
sed -i '' "s/ReactLocalization;/ReactLocalization \|\| \{ language: 'en_US' \};/g" node_modules/react-native-localization/LocalizedStrings.js
sed -i '' "s/RNDeviceInfo;/RNDeviceInfo \|\| \{};/g" node_modules/react-native-device-info/deviceinfo.js
cd node_modules/node-libs-browser && \
  npm i --save buffer@3.6 && \
  cd $OLDPWD

rm -rf node_modules/node-libs-browser/node_modules/crypto-browserify
rm -rf node_modules/node-libs-browser/node_modules/create-ecdh
rm -rf node_modules/node-libs-browser/node_modules/browserify-sign
# node apres.js
