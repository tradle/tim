#!/bin/bash

component=$1
PLIST="$(pwd)/../Tradle/Info.plist"
prev_version=$(/usr/libexec/PlistBuddy -c 'Print CFBundleShortVersionString' "$PLIST")
prev_bundle_version=$(/usr/libexec/PlistBuddy -c 'Print CFBundleVersion' "$PLIST")
IFS="." read major minor patch build <<< "$prev_bundle_version"

if [[ "$component" = 'major' ]]; then
  major=$((major + 1))
  minor=0
  patch=0
  build=0
elif [[ "$component" = 'minor' ]]; then
  minor=$((minor + 1))
  patch=0
  build=0
elif [[ "$component" = 'patch' ]]; then
  patch=$((patch + 1))
  build=0
elif [[ "$component" = 'build' ]]; then
  build=$((build + 1))
fi

version="${major}.${minor}.${patch}"
bundle_version="${major}.${minor}.${patch}.${build}"
/usr/libexec/PlistBuddy -c "Set CFBundleShortVersionString ${version}" "$PLIST"
/usr/libexec/PlistBuddy -c "Set CFBundleVersion ${bundle_version}" "$PLIST"

echo "version: '$prev_version' -> '$version'"
echo "build: '$prev_bundle_version' -> '$bundle_version'"
