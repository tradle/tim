
const React = require('react')
const TextInput = require('react-native').TextInput

class FloatingLabel extends React.Component {
  constructor (props) {
    super(props)
  }

  render() {
    return <TextInput value={this.props.children} {...this.props} />
  }
}

module.exports = FloatingLabel
