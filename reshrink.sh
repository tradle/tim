if [ -f npm-shrinkwrap.json ]
  then
    rm npm-shrinkwrap.json
fi

sed -i '' 's/\"node-libs-browser\": \"\^0.6.0\"/"node-libs-browser": "^1.0.0"/' node_modules/webpack/package.json

npm dedupe
npm prune
npm shrinkwrap
npm run nodeify
