import React, { Component } from 'react'
import ActionSheet from 'react-native-actionsheet'

/**
 * An interface to ActionSheet that mimics Alert.alert
 * @param  {Array} props.options  [{ text: String, onPress: Function }, { text: String, onPress: Function }]
 * @return {ActionSheet}
 */
export default class EasyActionSheet extends Component {
  render() {
    const { options } = this.props
    const defaultCancelButtonIndex = options.length - 1
    const {
      cancelButtonIndex=defaultCancelButtonIndex
    } = this.props

    const choices = options.map(opt => opt.text)
    const onPress = index => {
      const handler = options[index].onPress
      if (handler) handler()
    }

    const interceptRef = ref => {
      this.show = () => ref.show()
      this.hide = () => ref.hide()
    }

    return (
      <ActionSheet
        {...this.props}
        ref={interceptRef}
        options={choices}
        onPress={onPress}
        cancelButtonIndex={cancelButtonIndex}
      />
    )
  }
}
