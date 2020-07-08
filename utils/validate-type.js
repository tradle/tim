import get from 'lodash/get'
import traverse from 'traverse'

export const types = {
  bool: 'boolean',
  boolean: 'boolean',
  string: 'string',
  num: 'number',
  number: 'number',
  oneOf: vals => val => vals[val],
}

export const validate = ({ input, spec, allowExtraProps }) => {
  traverse(input).forEach(function (val) {
    if (!this.isLeaf) return

    const propValidator = get(spec, this.path)
    if (!propValidator) {
      if (!allowExtraProps) {
        throw new Error(`no extra props allowed: ${this.path.join('.')}`)
      }

      return
    }

    if (typeof propValidator === 'string') {
      if (typeof val !== propValidator) {
        throw new Error(`expected property at path ${this.path.join('.')} to be a ${propValidator}}`)
      }
    } else if (typeof propValidator === 'function') {
      if (!(propValidator(val))) {
        throw new Error(`invalid value for property at path ${this.path.join('.')}: ${val}`)
      }
    }
  })
}
