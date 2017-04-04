#!/bin/bash

./hooks/update_version.sh

if [ -z "$1" ]; then
  echo "specify an image tag"
  exit 1
fi

#git rev-parse HEAD > commithash
#source ~/.bash_profile
echo 'building new docker image...'
cp ~/.npmrc .npmrc
docker build -t "tradle/web-app:$1" .
rm -f .npmrc
