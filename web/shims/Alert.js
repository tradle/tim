'use strict'

import {
  StyleSheet,
  Modal,
  TouchableOpacity,
  View,
  Text
} from 'react-native'
import ReactDOM from 'react-dom'
import Icon from 'react-native-vector-icons/Ionicons'

const CENTER = false
const noop = () => {}
const Alert = {
  alert,
  prompt
}

module.exports = Alert

function alert (title, message, buttons) {
  if (typeof message !== 'string') {
    buttons = message
    message = title
    title = null
  }

  let callback
  if (typeof buttons === 'function') {
    callback = buttons
    buttons = []
  } else {
    callback = noop
  }

  buttons = buttons.map(function (b, i) {
    const style = buttons.length === 2 && i === 0 ? styles.cancel : styles.ok
    return (
      <TouchableOpacity onPress={() => {
        remove()
        b.onPress()
      }} style={[styles.button, style]}>
        <Text>{b.text}</Text>
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
}

function appendModal (modal) {
  const el = document.createDocumentFragment()
  ReactDOM.render(modal, el)
  const id = 'alert-' + Math.random()
  el.firstChild.id = id
  document.querySelector('.react-root').appendChild(el)
  return function remove () {
    const child = document.getElementById(id)
    child.parentNode.removeChild(child)
  }
}

function prompt (title, message, buttons) {
  throw new Error('not supported yet')
}

      // isOpen={bool}
      // onAfterOpen={afterOpenFn}
      // onRequestClose={requestCloseFn}
      // closeTimeoutMS={n}
      // style={customStyle}

//          <TouchableOpacity onPress=
//            <Icon name="ios-close" size={20} style={styles.close} />

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)'
  },
  box: {
    padding: 20,
    maxWidth: 500,
    minWidth: 300,
    backgroundColor: '#ffffff'
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
    fontSize: 30
  },
  message: {
    alignSelf: 'left',
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
  ok: {
    backgroundColor: '#77ADFC',
    borderColor: '#77ADFC',
    // colors from bootstrap:
    // backgroundColor: '#337ab7',
    // borderColor: '#337ab7',
    color: '#ffffff'
  }
})
