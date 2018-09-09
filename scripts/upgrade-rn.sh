#!/bin/bash

set -euo pipefail

FROM="$1"
TO="$2"

# Download the patch
curl "https://github.com/ncuillery/rn-diff/compare/rn-$FROM...rn-$TO.diff" > upgrade-rn.patch

# Replace RnDiffApp occurences
appNameCamelCase=Tradle
appNameLowerCase=tradle
sed -i "" "s-ios/RnDiffApp-ios/${appNameCamelCase}-" upgrade-rn.patch
sed -i "" "s-java/com/rndiffapp-java/com/${appNameLowerCase}-" upgrade-rn.patch

# Set up the 3-way merge
# git remote add rn-diff https://github.com/ncuillery/rn-diff.git
git fetch rn-diff

# Run the apply command
git apply upgrade-rn.patch --exclude=package.json -p 2 --3way
