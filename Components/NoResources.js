'use strict'

var React = require('react-native');
var {
  Text,
  Component,
  StyleSheet,
  View,
} = React;


class NoResources extends Component {
  render() {
    var noRes = [];
    if (this.props.filter) {
      noRes.push(<Text style={styles.NoResourcesText}>{`No results for “${this.props.filter}”`}</Text>);
    } else if (!this.props.isLoading) {
      // If we're looking at the latest resources, aren't currently loading, and
      // still have no results, show a message
      noRes.push(<Text style={styles.NoResourcesText}>{'No ' + this.props.model.title + ' were found.'}</Text>);
      if (!this.props.model.interfaces) {

        noRes.push(<Text style={styles.NoResourcesText}>{'Tap on + to add'}</Text>);
      }
    }
    return (
      <View style={[styles.container, styles.centerText]}>
        <Text style={styles.NoResourcesText}>{noRes}</Text>
      </View>
    );
  }

}
var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  centerText: {
    alignItems: 'center',
  },
  NoResourcesText: {
    marginTop: 80,
    color: '#888888',
  }
});

module.exports = NoResources;
