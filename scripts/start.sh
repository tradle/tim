#!/bin/bash

set -x
set -euo pipefail

RESET_CACHE=${RESET_CACHE-""}

# doesn't work yet, see issues:
#   https://github.com/facebook/react-native/issues/8723
#   https://github.com/facebook/react-native/issues/13733
#   https://github.com/facebook/metro/pull/183
#
#   BABEL_ENV gets overwritten in metro/
#   search for OLD_BABEL_ENV
#
# export BABEL_ENV="development_$PLATFORM"

REACT_DEBUGGER='rndebugger-open --open --port 8081'
LINE="node --max_old_space_size=4096 ./node_modules/.bin/react-native start"
if [[ $RESET_CACHE ]]
then
  watchman watch-del-all
  LINE="$LINE --reset-cache"
fi

# to be able to debug the packager, add this line:
# LINE="$LINE --max-workers 0"

eval "$LINE $@"
