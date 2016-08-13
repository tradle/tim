GIT_HASH=$(git rev-parse HEAD)
REPO_DIR=$(git rev-parse --show-toplevel)
echo "{\"commit\":\"$GIT_HASH\"}" > "$REPO_DIR/version.json"
