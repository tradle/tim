
#!/bin/bash

node scripts/rm-rn-peerdeps.js

# cd node_modules/react-web && npm i fbjs@0.6.1 && rm -rf node_modules/react cd $OLDPWD
# npm i --save react@15.2.0 react-addons-perf@15.2.0 react-dom@15.2.0
cp node_modules/tcomb-form-native/lib/templates/bootstrap/datepicker.ios.js node_modules/tcomb-form-native/lib/templates/bootstrap/datepicker.web.js
cp node_modules/tcomb-form-native/lib/templates/bootstrap/select.ios.js node_modules/tcomb-form-native/lib/templates/bootstrap/select.web.js
# cp node_modules/react-native-local-auth/LocalAuth.android.js node_modules/react-native-local-auth/LocalAuth.web.js
# cp node_modules/react-native-carousel/CarouselPager.android.js node_modules/react-native-carousel/CarouselPager.web.js
sed -i.bak "s/ReactLocalization;/ReactLocalization \|\| \{ language: 'en_US' \};/g" node_modules/react-native-localization/LocalizedStrings.js
sed -i.bak "s/RNDeviceInfo;/RNDeviceInfo \|\| \{};/g" node_modules/react-native-device-info/deviceinfo.js
sed -i.bak "s/this\.opts/opts/g" node_modules/map-stream/index.js
sed -i.bak "s/self\.opts/opts/g" node_modules/map-stream/index.js

# sed -i '' "s/e\.nativeEvent\.contentOffset\.y/this.refs.listView.scrollProperties.offset/g" node_modules/react-native-gifted-messenger/GiftedMessenger.js
# cd node_modules/node-libs-browser && \
#   npm i --save buffer@3.6 && \
#   cd $OLDPWD

rm -rf node_modules/webpack/node_modules/node-libs-browser
# rm -rf node_modules/node-libs-browser/node_modules/crypto-browserify
rm -rf node_modules/webpack/node_modules/crypto-browserify
rm -rf node_modules/node-libs-browser/node_modules/create-ecdh
# rm -rf node_modules/react-native-ecc/node_modules/buffer
# rm -rf node_modules/node-libs-browser/node_modules/browserify-sign
# rm -rf node_modules/webpack/node_modules/uglify-js
# rm -rf node_modules/html-minifier/node_modules/uglify-js

rm -f node_modules/react-dropzone/.babelrc

./hooks/update_version.sh
