'use strict';

var React = require('react-native');

var {
  ListView,
  Component,
  StyleSheet,
  PropTypes,
  TouchableHighlight,
  View,
  Text
} = React;

class EnumList extends Component {
  props: {
    navigator: PropTypes.object.isRequired,
    resource: PropTypes.object.isRequired,
    returnRoute: PropTypes.object,
    callback: PropTypes.func,
    prop: PropTypes.object.isRequired,
    enumProp: PropTypes.object.isRequired
  };
  constructor(props) {
    super(props);

    var dataSource = new ListView.DataSource({
      rowHasChanged: function(row1, row2) {
        return row1 !== row2
      }
    })
    this.state = {
      dataSource: dataSource.cloneWithRows(this.props.enumProp.oneOf),
    }
  }

  selectResource(resource) {
    this.props.callback(this.props.prop.name, this.props.enumProp.name, resource); // HACK for now
    this.props.navigator.popToRoute(this.props.returnRoute);
    return;
  }
  render() {
    var content = <ListView
          dataSource={this.state.dataSource}
          renderRow={this.renderRow.bind(this)}
          automaticallyAdjustContentInsets={false}
          keyboardDismissMode='on-drag'
          keyboardShouldPersistTaps={true}
          initialListSize={10}
          pageSize={20}
          scrollRenderAhead={10}
          showsVerticalScrollIndicator={false} />;

    return (
      <View style={styles.container}>
        <View style={styles.separator} />
        {content}
      </View>
    );
  }

  renderRow(value) {
    var key = Object.keys(value)[0]
    var val = (typeof key === 'object')
            ? key + ' ' + value[key]
            : key

    return (
      <View style={{padding: 5}}>
        <TouchableHighlight underlayColor='transparent' onPress={this.selectResource.bind(this, value)}>
          <View style={styles.row}>
            <View style={styles.textContainer}>
              <Text style={styles.resourceTitle}>{val}</Text>
            </View>
          </View>
        </TouchableHighlight>
        <View style={styles.separator} />
      </View>
    )
  }
}

var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    marginTop: 64
  },
  separator: {
    height: 1,
    backgroundColor: '#cccccc',
  },
  row: {
    flexDirection: 'row',
    padding: 5,
  },
  textContainer: {
    flex: 1,
  },
});

module.exports = EnumList;
