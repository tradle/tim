if [ -f npm-shrinkwrap.json ]
  then
    rm npm-shrinkwrap.json
fi

npm dedupe && npm prune && npm shrinkwrap && rn-nodeify --hack
