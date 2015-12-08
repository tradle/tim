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
    var noRes
    if (this.props.filter)
      noRes = <Text style={styles.NoResourcesText}>{`No results for “${this.props.filter}”`}</Text>
    else if (!this.props.isLoading)
      // If we're looking at the latest resources, aren't currently loading, and
      // still have no results, show a message
      noRes = <Text style={styles.NoResourcesText}>{'No ' + (this.props.model.plural || (this.props.model.title + 's')) + ' were found.'}</Text>
    else
      return <View />
    return (
      <View style={[styles.container, styles.centerText]}>
        {noRes}
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
