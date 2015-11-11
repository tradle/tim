var React = require('react-native')
var {
  WebView,
  View,
  Component,
  Text,
  ActivityIndicatorIOS,
  ScrollView,
  StyleSheet,
} = React

class ArticleView extends Component {
  constructor(props) {
    super(props);
  }
  renderError(domain, code, description) {
    return <Text  style={styles.error}>error :( - {description ? description : ''}</Text>
  }
  renderLoading() {
    return (
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.container}>
          <View style={styles.loading}>
            <Text>Loading</Text>
            <ActivityIndicatorIOS style={{alignSelf: 'center'}} />
          </View>
        </View>
      </ScrollView>
    )
  }
  render() {
    return (
      <WebView style={styles.webView}
        url={this.props.url}
        startInLoadingState={true}
        renderError={this.renderError.bind(this)}
        automaticallyAdjustContentInsets={false}
        renderLoading={this.renderLoading}/>
    );
  }
}

var styles = StyleSheet.create({
  contentContainer: {
    padding: 10,
  },
  container: {
    flex: 1
  },
  error: {
    marginTop: 160,
    paddingHorizontal: 20,
    fontSize: 20,
    color: '#7AAAC3'
  },
  webView: {
    backgroundColor: '#ffffff',
    marginTop: 50,
    height: 350,
  },

})

module.exports = ArticleView;