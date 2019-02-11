/*
  To use SimpleModal you need to write something like that

    Actions.showModal({
      title: translate('approveThisApplicationFor', translate(resource.from.title)),
      buttons: [
        {
          text: translate('cancel'),
          onPress: () => {  Actions.hideModal(); console.log('Canceled!')}
        },
        {
          text: translate('Ok'),
          onPress: () => {
            this.ok(resource)
          }
        }
      ]
    })
*/

import React from 'react'
import {
  StyleSheet,
  Modal,
  TouchableOpacity,
  View,
  // Text,
  Platform,
  ActivityIndicator
} from 'react-native'
import PropTypes from 'prop-types'
import omit from 'lodash/omit'

import { Text } from './Text'

const CENTER = false
const noop = () => {}

export default function SimpleModal (props) {
  const { title='', message='', buttons=[], style=DEFAULT_STYLES, showIndicator=false } = props
  let centerButtonStyle
  // if (buttons.length === 1) {
  //   centerButtonStyle = { flex: 1 }
  // }

  const renderedButtons = buttons.map(function (button, i) {
    const { text, onPress } = button
    const isCancel = buttons.length === 2 && i === 0
    const buttonStyle = isCancel ? style.cancel : style.ok
    const textStyle = isCancel ? style.cancelText : style.okText
    return (
      <TouchableOpacity onPress={onPress} style={[style.button, buttonStyle, centerButtonStyle]} key={'simple-modal-btn-' + i}>
        <Text style={textStyle}>{text}</Text>
      </TouchableOpacity>
    )
  })

  const head = title && (
    <View style={style.head}>
      <Text style={style.title}>{title}</Text>
    </View>
  )

  const modalProps = omit(props, ['title', 'message', 'buttons'])
  if (Platform.OS === 'android' && !modalProps.onRequestClose) {
    modalProps.onRequestClose = noop
  }
  if (showIndicator) {
    return <Modal {...modalProps} >
             <View style={style.indicatorContainer}>
               <View style={style.indicatorContent}>
                  <Text style={style.indicatorTitle}>{title || ''}</Text>
                  <ActivityIndicator size='large' style={style.indicator} color='#757575' />
                </View>
              </View>
            </Modal>
  }

  return (
    <Modal {...modalProps} >
      <View style={style.container}>
        <View style={style.box}>
          {head}
          <View style={style.body}>
            <Text style={style.message}>{message || ''}</Text>
          </View>
          <View style={[style.buttonsContainer, centerButtonStyle]}>
            {renderedButtons}
          </View>
        </View>
      </View>
    </Modal>
  )
}

const DEFAULT_STYLES = StyleSheet.create({
  container: {
    flexGrow: 1,
    // alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 10
  },
  box: {
    padding: 20,
    // maxWidth: 600,
    backgroundColor: '#ffffff',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowColor: '#757575',
    shadowOffset: { width: 10, height: 10 },
    // boxShadow: '2px 2px 10px rgba(0, 0, 0, 0.2)'
  },
  head: {
    flexGrow: 1,
    flexDirection: 'row',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1, //StyleSheet.hairlineWidth,
    borderBottomColor: '#eee'
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
    alignSelf: 'flex-start',
    fontSize: 20
  },
  buttonsContainer: {
    flexGrow: 1,
    flexDirection: 'row',
    justifyContent: CENTER ? 'center' : 'flex-end'
  },
  button: {
    // flex: CENTER ? 1 : null,
    alignItems: 'center',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#eeeeee',
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 10,
    paddingBottom: 10,
    marginLeft: 5
  },
  cancel: {
    marginRight: 10
  },
  ok: {
    backgroundColor: '#77ADFC',
    borderColor: '#77ADFC',
    // colors from bootstrap:
    // backgroundColor: '#337ab7',
    // borderColor: '#337ab7'
  },
  okText: {
    color: '#fff'
  },
  indicator: {
    alignSelf: 'center',
    backgroundColor: 'transparent',
    marginTop: 30
  },
  indicatorContainer: {
    flexGrow: 1,
    // alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 10
  },
  indicatorContent: {
    alignSelf: 'center',
    justifyContent: 'center',
    backgroundColor: '#eee',
    borderRadius: 30,
    opacity: 0.9,
    paddingHorizontal: 50,
    paddingVertical: 30
    // width: 200,
    // height: 150
  },
  indicatorTitle: {
    alignSelf: 'center',
    fontSize: 20,
    color: '#000'
  },
})
