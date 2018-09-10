import React from 'react'
import {
  Text as RawText,
} from 'react-native'

import { translate } from '../utils/utils'

export const Text = props => {
  let { children, ...rest } = props
  if (typeof children === 'string') {
    children = translate(children)
  }

  return <RawText {...rest}>{children}</RawText>
}
