#!/bin/bash

# PLATFORM=$1

# if [[ $PLATFORM == "ios" ]] && [[ $PLATFORM == "android" ]]
# then
#   echo "expected 'ios' or 'android' as first argument"
#   exit 1
# fi


# echo "getting keys for platform: $PLATFORM"

# set -x

get_key() {
  code-push deployment ls tim-$1 -k --format json | jq '[.[] | {"key":.name,"value":.key}] | from_entries'
}

echo "{\"ios\":$(get_key ios),\"android\":$(get_key android)}" | jq .
