if [ -f npm-shrinkwrap.json ]
  then
    rm npm-shrinkwrap.json
fi

npm dedupe
npm prune

# hack until react-native supports multiple versions of same dep
cd "node_modules/@tradle/utils/node_modules/create-torrent/node_modules/block-stream2"
npm install --production
cd $OLDPWD
cd "node_modules/react-native-vector-icons/node_modules/yargs/node_modules/yargs-parser"
npm install camelcase
cd $OLDPWD
# end hack

npm shrinkwrap
rn-nodeify --hack
