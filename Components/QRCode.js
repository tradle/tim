var React = require('react-native')
var {
  StyleSheet,
  View
} = React

var QRCode = require('react-native-barcode/QR/QRCode')
var DEFAULT_DIM = 370

class QRCodeView extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      style: getStyle(this.props.dimension || DEFAULT_DIM)
    }
  }
  propTypes: {
    content: React.PropTypes.string.isRequired,
    dimension: React.PropTypes.number,
    fullScreen: React.PropTypes.boolean
  }
  render() {
    var code = <QRCode content={this.props.content} style={this.state.style} />
    if (!this.props.fullScreen) return code

    return (
      <View style={styles.container}>
        {code}
      </View>
    )
  }
}

function getStyle (dim) {
  return {
    textAlign: 'center',
    height: dim,
    width: dim
  }
}

var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent'
  }
})

module.exports = QRCodeView
