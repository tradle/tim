// Store apply and call
global.logAll = true
;['setTimeout', 'setInterval', 'setImmediate'].forEach(method => {
  var orig = global[method]
  global[method] = function () {
    if (global.logAll) log('CALLING ' + method)
    return orig.apply(this, arguments)
  }
})


var origApply = Function.prototype.apply;
var origCall = Function.prototype.call;

// We need to be able to apply the original functions, so we need
// to restore the apply locally on both, including the apply itself.
origApply.apply = origApply;
origCall.apply = origApply;

// Some utility functions we want to work
Function.prototype.toString.apply = origApply;
Array.prototype.slice.apply = origApply;
console.trace.apply = origApply;

function log(str) {
    // If console.log is allowed to stringify by itself, it will
    // call .call 9 gajillion times. Therefore, do it ourselves.
    console.log(str)
}

// var times = {}
// import { Alert } from 'react-native'
// setInterval(function () {
//   var big = {}
//   for (var t in times) {
//     if (times[t] > 500) {
//       big[t] = times[t]
//     }
//   }

//   Alert.alert(JSON.stringify(big))
//   times = {}
// }, 15000)

Function.prototype.call = function () {
  var fnName = willLog(this, arguments)
  if (!fnName) return origCall.apply(this, arguments);

  log('CALLING ' + fnName)
  // var now = Date.now()
  var result = origCall.apply(this, arguments);
  // var time = Date.now() - now
  // times[fnName] = times[fnName] ? times[fnName] + time : time
  return result
};

// Function.prototype.apply = function () {
//   if (maybeLog(this)) logCall(this, arguments);
//   return origApply.apply(this, arguments);
// }

function willLog (fn, args) {
  if (!global.logAll) return

  var name = getFunctionName(fn)
  if (name === 'hasOwnProperty' || name === 'log' || name === 'slice' ||
    name === 'addListener' || name === 'EventSubscription' || name === 'handleClose' ||
    name === 'EventTarget' || name === 'EventEmitter' || name === 'removeSubscription' ||
    name === 'now' || name === 'printStack') return

  return name
  // logCall(name)
}

function getFunctionName (fn) {
  return fn.name || fn.toString().match(/function (.*?)\s*\(/)[1] || ('[anonymous function] ' + getStack().slice(0, 100))
}

function getStack () {
  try {
    throw new Error('')
  } catch (err) {
    var stack = err.stack
    return stack.slice(stack.indexOf('willLog') + 'willLog'.length + 5)
    return err.stack
  }
}

global.printStack = function (prefix) {
  prefix = prefix || ''
  try {
    throw new Error('')
  } catch (err) {
    console.log(prefix + ' ' + err.stack.slice(err.stack.indexOf('printStack') + 15))
  }
}
