
#!/bin/bash

cd node_modules/react-web && npm i fbjs@0.6.1 react && cd $OLDPWD
npm i --save react@15.2.0 react-addons-perf@15.2.0 react-dom@15.2.0
cp node_modules/tcomb-form-native/lib/templates/bootstrap/datepicker.ios.js node_modules/tcomb-form-native/lib/templates/bootstrap/datepicker.web.js
cd node_modules/webpack/node_modules/node-libs-browser && \
  npm i --save crypto-browserify@3.11 && \
  npm i --save buffer@3.6 && \
  cd $OLDPWD

node apres.js
