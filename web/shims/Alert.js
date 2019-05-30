'use strict'

import {
  StyleSheet,
  Modal,
  TouchableOpacity,
  View,
  Text
} from 'react-native'
import ReactDOM from 'react-dom'

const CENTER = false
const noop = () => {}
const Alert = {
  alert,
  prompt
}

let _removeCurrent

function removeCurrent () {
  if (_removeCurrent) {
    _removeCurrent()
    _removeCurrent = null
  }
}

function alert (title, message, buttons) {
  if (removeCurrent) removeCurrent()

  if (!message) {
    message = title
    title = null
  }

  if (Array.isArray(message)) {
    buttons = message
    message = null
  }

  let callback
  if (typeof buttons === 'function') {
    callback = buttons
    buttons = []
  } else {
    callback = noop
  }

  if (!buttons) {
    buttons = [{ text: 'OK', onPress: noop }]
  }

  const styles = exports.styles
  buttons = buttons.map(function (b, i) {
    const cancel = buttons.length === 2 && i === 0
    const buttonStyle = cancel ? styles.cancel : styles.ok
    const textStyle = cancel ? styles.cancelText : styles.okText
    return (
      <TouchableOpacity onPress={() => {
        remove()
        if (b.onPress) b.onPress()
      }} style={[styles.button, buttonStyle]}>
        <Text style={textStyle}>{b.text}</Text>
      </TouchableOpacity>
    )
  })

  const head = title && (
    <View style={styles.head}>
      <Text style={styles.title}>{title}</Text>
    </View>
  )

  const modal = (
    <Modal
      animated="true"
      transparent="true"
    >
      <View style={styles.container}>
        <View style={styles.box}>
          {head}
          <View style={styles.body}>
            <Text style={styles.message}>{message || ''}</Text>
          </View>
          <View style={styles.buttonsContainer}>
            {buttons}
          </View>
        </View>
      </View>
    </Modal>
  )

  const remove = appendModal(modal)
  _removeCurrent = remove
}

function appendModal (modal) {
  const el = document.createDocumentFragment()
  const id = 'alert-' + Math.random()
  ReactDOM.render(modal, el, (err, result) => {
    if (err) {
      console.error('failed to show Alert', err.stack)
      return
    }

    el.firstChild.id = id
    document.querySelector('body').appendChild(el)
  })

  return function remove () {
    const child = document.getElementById(id)
    if (child) {
      child.parentNode.removeChild(child)
    }
  }
}

function prompt (title, message, buttons) {
  throw new Error('not supported yet')
}

const defaultStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)'
  },
  box: {
    padding: 20,
    maxWidth: 600,
    minWidth: '40%',
    backgroundColor: '#ffffff',
    boxShadow: '2px 2px 10px rgba(0, 0, 0, 0.2)'
  },
  head: {
    flex: 1,
    flexDirection: 'row',
    marginBottom: 20,
    paddingBottom: 5,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eeeeee'
  },
  body: {
    marginBottom: 20,
    paddingBottom: 5,
    // borderBottomWidth: StyleSheet.hairlineWidth,
    // borderBottomColor: '#eeeeee'
    // alignItems: 'center',
  },
  // close: {
  //   alignSelf: 'flex-end'
  // },
  title: {
    alignSelf: 'center',
    fontSize: 26
  },
  message: {
    alignSelf: 'flex-start',
    fontSize: 20
  },
  buttonsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: CENTER ? 'center' : 'flex-end'
  },
  button: {
    flex: CENTER ? 1 : null,
    alignItems: 'center',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#eeeeee',
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 10,
    paddingBottom: 10,
  },
  cancel: {
    marginRight: 10
  },
  cancelText: {},
  ok: {
    backgroundColor: '#77ADFC',
    borderColor: '#77ADFC',
    // colors from bootstrap:
    // backgroundColor: '#337ab7',
    // borderColor: '#337ab7',
  },
  okText: {
    color: '#ffffff'
  }
})

module.exports = exports = Alert
// allow override
exports.styles = defaultStyles
