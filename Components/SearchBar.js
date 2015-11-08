'use strict'

var React = require('react-native');

var {
  Component,
  ActivityIndicatorIOS,
  View,
  StyleSheet,
  TextInput
} = React;

class SearchBar extends Component {
  render() {
    var filter = this.props.filter;
    var value = !filter ||  filter.length === 0 ? '' : filter;
    return (
      <View style={styles.searchBar}>
      <View style={styles.searchBarBG}>
        <TextInput
          autoCapitalize='none'
          autoCorrect={false}
          onChange={this.props.onSearchChange.bind(this)}
          onFocus={this.props.onFocus.bind(this)}
          placeholder='Search'
          placeholderTextColor='#bbbbbb'
          style={styles.searchBarInput}
          value={value}
        />
        <ActivityIndicatorIOS
          animating={this.props.isLoading}
          style={styles.spinner}
        />
      </View>
      </View>
    );
  }
}

var styles = StyleSheet.create({
  searchBar: {
    marginTop: 64,
    paddingTop: 3,
    height: 42,
    paddingBottom: 3,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eeeeee',
  },
  searchBarBG: {
    marginTop: 20,
    // padding: 10,
    flex: 1,
    alignSelf: 'center',
    backgroundColor: '#eeeeee',
    borderTopColor: '#eeeeee',
    borderRightColor: '#eeeeee',
    borderLeftColor: '#eeeeee',
    borderWidth: 2,
    borderBottomColor: '#2E3B4E',
  },
  searchBarInput: {
    height: 32,
    fontSize: 18,
    paddingLeft: 10,
    // opacity: 1,
    fontWeight: 'bold',
    // backgroundColor: '#D7E6ED',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#eeeeee',
  },
  separator: {
    height: 1,
    backgroundColor: '#eeeeee',
  },
  spinner: {
    width: 30,
  },
  scrollSpinner: {
    marginVertical: 20,
  },
});

module.exports = SearchBar;