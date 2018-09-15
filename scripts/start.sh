#!/bin/bash

set -x
set -euo pipefail

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
node --max_old_space_size=4096 ./node_modules/.bin/react-native start
