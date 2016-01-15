'use strict';

var React = require('react-native');
var PhotoList = require('./PhotoList')

var {
  Component,
  StyleSheet,
  View,
} = React;

class GridItemsList extends Component {
  constructor(props) {
    super(props);
    var dataSource = new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
      });
    this.state = {
      list: this.props.list,
      dataSource: dataSource.cloneWithRows(this.props.list),
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
    this.setState({
      list: list,
      dataSource: this.state.dataSource.cloneWithRows(list)
    })
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
    marginTop: 60,
  },
});

module.exports = GridItemsList;

