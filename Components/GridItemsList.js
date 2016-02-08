'use strict';

var React = require('react-native');
var PhotoList = require('./PhotoList')
var extend = require('extend')
var equal = require('deep-equal')
var {
  Component,
  StyleSheet,
  PropTypes,
  View,
} = React;

class GridItemsList extends Component {
  props: {
    navigator: PropTypes.object.isRequired,
    list: PropTypes.array.isRequired,
    callback: PropTypes.func.isRequired,
    resource: PropTypes.object.isRequired,
    returnRoute: PropTypes.object.isRequired,
    prop: PropTypes.string.isRequired
  };
  constructor(props) {
    super(props);
    this.state = {
      list: this.props.list,
    };
    var currentRoutes = this.props.navigator.getCurrentRoutes();
    var currentRoutesLength = currentRoutes.length;
    currentRoutes[currentRoutesLength - 1].onRightButtonPress = () => {
      props.callback(props.prop, this.state.list)
      props.navigator.popToRoute(props.returnRoute);
    }

  }

  cancelItem(item) {
    var list = [];
    extend(list, this.state.list);
    for (var i=0; i<list.length; i++) {
      if (equal(list[i], item)) {
        list.splice(i, 1);
        break;
      }
    }
    if (list.length !== 0)
      this.setState({
        list: list,
      })
    else {
      this.props.callback(this.props.prop, list)
      this.props.navigator.popToRoute(this.props.returnRoute);
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <PhotoList photos={this.state.list} callback={this.cancelItem.bind(this)} navigator={this.props.navigator} numberInRow={3} resource={this.props.resource}/>
      </View>
    )
  }
}

var styles = StyleSheet.create({
  container: {
    flex: 1,
    borderColor: 'transparent',
    borderTopColor: 'red',
    borderTopWidth: 0.5,
    marginTop: 60,
  },
});

module.exports = GridItemsList;

