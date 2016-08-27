import * as Ionicons from 'react-icons/io'
import * as MaterialIcons from 'react-icons/md'
import { Text } from 'react-native'

const normalized = {
  'md-finger-print': 'md-fingerprint',
  'ios-checkmark-circle-outline': 'ios-checkmark-empty'
}

module.exports = props => {
  const Icon = getIconComponent(props.name)
  return Icon ? <Icon {...props} /> : <Text>{props.name} not found</Text>
}

function getIconComponent (nativeName) {
  nativeName = normalized[nativeName] || nativeName
  const IconSet = nativeName.indexOf('md-') === 0 ? MaterialIcons : Ionicons
  const parts = nativeName.split('-').map(part => part[0].toUpperCase() + part.slice(1))
  if (IconSet === Ionicons) parts.unshift('Io')

  return IconSet[parts.join('')] || IconSet[parts.slice(1).join('')]
}
