TARGET_DIR="ios"
ZIP_NAME="ZoomAuthenticationHybrid.framework-6.8.0.zip"

if [ -d "node_modules/react-native-facetec-zoom" ]
then
  if [ ! -d "$TARGET_DIR/ZoomAuthenticationHybrid.framework" ]
  then
    if [ -f "./scripts/.env" ]
    then
      source ./scripts/.env
    fi

    set -x
    if [ ! -f "$TARGET_DIR/$ZIP_NAME" ]
    then
      aws s3 cp "s3://app.tradle.io/sdk/$ZIP_NAME" "$TARGET_DIR/"
    fi

    unzip "$TARGET_DIR/$ZIP_NAME" -d "$TARGET_DIR/"
    rm "$TARGET_DIR/$ZIP_NAME"
    set +x
    exit 0
  fi
fi

echo "zoom framework already present!"
