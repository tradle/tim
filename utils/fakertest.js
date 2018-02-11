console.log('requiring fakertest.js')

const {
  newAPIBasedVerification,
  newIdscanVerification,
  newAu10tixVerification,
  newVisualVerification,
  newVerificationTree,
  randomDoc
} = require('./faker')

const doc = randomDoc()
const tree = newVerificationTree(doc, 3)
log(tree)


function log (j) {
  console.log(JSON.stringify(j, null, 2))
}
