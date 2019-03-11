#!/bin/bash

echo 'fixing bluebird'
find . -path "*/bluebird/js/*.js" -exec sed -i '' s/process.versions.node.split/process.version.node.split/ {} +