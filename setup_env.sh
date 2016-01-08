function getJsonVal () {
    python -c "import json,sys;sys.stdout.write(json.dumps(json.load(sys.stdin)$1, sort_keys=True, indent=4))";
}

dir=${PROJECT_DIR}/${PROJECT_NAME}
echo "Starting environment configuration for project: " $dir

# environment variable from value passed in to xcodebuild.
# if not specified, we default to DEV
env=${BDF_ENVIRONMENT}
if [ -z "$env" ]
then
env="DEV"
fi
echo "Using $env environment"

# copy the environment-specific file
cp $dir/environment_$env.json $dir/environment.json

# Date and time that we are running this build
buildDate=`date "+%F %H:%M:%S"`
todaysDay=`date "+%d"`

# app settings
#appName=`/usr/libexec/PlistBuddy -c "Print :appName" "$dir/environment.plist"`
appName=`cat "$dir/environment.json" | getJsonVal "['appName']"`
version=`/usr/libexec/PlistBuddy -c "Print :CFBundleShortVersionString" "${PROJECT_DIR}/${PROJECT_NAME}/Info.plist"`

#if [ "$env" != "PROD" ]
#then
# need to dynamically append today's day for non-prod
#appName="$appName $todaysDay"
# Last hash from the current branch
#version=`git log --pretty=format:"%h" -1`
#fi

# Build the preprocess file
cd ${PROJECT_DIR}/${PROJECT_NAME}
preprocessFile="environment_preprocess.h"
echo "Creating header file"

echo -e "//-----------------------------------------" > $preprocessFile
echo -e "// Auto generated file" >> $preprocessFile
echo -e "// Created $buildDate" >> $preprocessFile
echo -e "//-----------------------------------------" >> $preprocessFile
echo -e "" >> $preprocessFile
echo -e "#define BDF_ENVIRONMENT              $env" >> $preprocessFile
echo -e "#define BDF_ENVIRONMENT_LAST_COMMIT  $version" >> $preprocessFile
echo -e "#define BDF_ENVIRONMENT_APP_NAME     $appName" >> $preprocessFile

# dump out file to build log
cat $preprocessFile

# Force the system to process the plist file
echo "Touching plist at: " ${PROJECT_DIR}/${PROJECT_NAME}/${PROJECT_NAME}-Info.plist
touch ${PROJECT_DIR}/${PROJECT_NAME}/${PROJECT_NAME}-Info.plist

# done
echo "Done."
