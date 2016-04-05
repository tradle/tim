#!/bin/bash
find ./node_modules -path "*node_modules/react" -type d -prune -exec sh -c 'if [ {} != "./node_modules/react" ]; then rm -rf {};fi' \;
find ./node_modules -name "fbjs" -type d -prune -exec sh -c 'if [ {} != "./node_modules/fbjs" ]; then rm -rf {};fi' \;
