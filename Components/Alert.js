import {
  Alert,
} from 'react-native'

import { translate as _translate } from '../utils/utils'

const translate = arg => typeof arg === 'string' ? _translate(arg) : arg

const translateButton = button => ({
  ...button,
  text: translate(button.text),
})

// method signature adheres to: react-native/Libraries/Alert/Alert.js
// static alert(
//   title: ?string,
//   message?: ?string,
//   buttons?: Buttons,
//   options?: Options,
//   type?: AlertType,
// ): void {

export const alert = (title, message, buttons, options, type) => Alert.alert(
  translate(title),
  translate(message),
  buttons && buttons.map(translateButton),
  options,
  type,
)

export default { alert }
