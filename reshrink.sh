if [ -f npm-shrinkwrap.json ]
  then
    rm npm-shrinkwrap.json
fi

npm dedupe
npm prune

cd node_modules/node-libs-browser && npm i crypto-browserify && cd ../../

npm shrinkwrap
./web.sh
