import * as Ionicons from 'react-icons/io'
import * as MaterialIcons from 'react-icons/md'
import { Text } from 'react-native'

const cached = {}
const normalized = {
  'md-finger-print': 'md-fingerprint',
  'ios-checkmark-circle-outline': 'ios-checkmark-empty',
  'ios-call-outline': 'ios-telephone',
  'ios-close-circle-outline': 'ios-close-circled'
}

module.exports = props => {
  const Icon = getIconComponent(props.name)
  if (__DEV__ && !Icon) {
    throw new Error('icon not found: ' + props.name)
  }

  return Icon ? <Icon {...props} /> : <Text>{props.name} not found</Text>
}

function getIconComponent (nativeName) {
  if (nativeName in cached) return cached[nativeName]

  nativeName = normalized[nativeName] || nativeName
  const IconSet = nativeName.indexOf('md-') === 0 ? MaterialIcons : Ionicons
  const parts = nativeName.split('-').map(part => part[0].toUpperCase() + part.slice(1))
  const attempts = [
    parts,
    ['Io'].concat(parts)
  ]

  if (IconSet === Ionicons) {
    if (parts[0].toLowerCase() === 'ios') {
      attempts.push(['Io'].concat(parts.slice(1)))
    }
  }

  return cached[nativeName] = attempts.reduce(function (match, next) {
    return match || IconSet[next.join('')]
  }, null)
}
