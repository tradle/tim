#!/bin/bash
export $(cat $(dirname "$0")/../android/gradle.properties | grep -v "^#" | grep "^VERSION_" | xargs)
echo "$VERSION_MAJOR.$VERSION_MINOR.$VERSION_PATCH"
