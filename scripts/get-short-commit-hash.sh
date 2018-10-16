#!/bin/bash

GIT_HASH=$(git rev-parse HEAD)
SHORT_HASH=${GIT_HASH:0:10}
echo "$SHORT_HASH"
