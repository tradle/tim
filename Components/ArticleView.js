var React = require('react-native')
var {
  WebView,
  View,
  Text,
  ActivityIndicatorIOS,
  ScrollView,
  StyleSheet,
} = React

var ArticleView = React.createClass({
  renderError(domain, code, description) {
    return <Text>error :( - {description}</Text>
  },
  renderLoading() {
    return (
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.container}>
          <View style={styles.loading}>
            <Text>Loading article</Text>
            <ActivityIndicatorIOS style={{alignSelf: 'center'}} />
          </View>
        </View>
      </ScrollView>
    )
  },
  render() {
    return (
      <WebView style={styles.webView}
        url={this.props.url}
        startInLoadingState={true}
        renderError={this.renderError}
        automaticallyAdjustContentInsets={false}
        renderLoading={this.renderLoading}/>
    );
  }
})

var styles = StyleSheet.create({
  contentContainer: {
    padding: 10,
  },
  container: {
    flex: 1
  },
  webView: {
    backgroundColor: '#ffffff',
    height: 350,
  },

})

module.exports = ArticleView;