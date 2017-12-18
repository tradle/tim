if [ -f npm-shrinkwrap.json ]
  then
    rm npm-shrinkwrap.json
fi

npm dedupe
npm prune

# hack until react-native supports multiple versions of same dep
if [ -d "node_modules/react-native-vector-icons/node_modules/yargs/node_modules/yargs-parser" ]; then
  cd "node_modules/react-native-vector-icons/node_modules/yargs/node_modules/yargs-parser" && npm install camelcase && cd $OLDPWD
fi
# end hack

npm shrinkwrap --dev
npm run nodeify
