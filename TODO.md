
- set up Code Push deployment pipeline, e.g. code-push to ios and android on pushes to branches release-ios and release-android respectively
- Code Push with Staging + Production, so that code push can be tested before deploying to production
- deliver "check for update" trigger via push notification
  - maybe tradle provider will send new code, or a message to check for update
- check for updates once an hour
- handle rejected messages, mark as failed to deliver, offer user to re-send
- check for latest version in App Store, ask to reinstall
  - may backfire for beta (unless it's always ahead)
