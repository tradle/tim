if [ -f npm-shrinkwrap.json ]
  then
    rm npm-shrinkwrap.json
fi

cd node_modules/webpack && npm i --save node-libs-browser@latest && cd $OLDPWD

npm dedupe
npm prune
npm shrinkwrap
./web.sh
