'use strict';
 
var React = require('react-native');
var NewItem = require('./NewItem');
var ResourceView = require('./ResourceView');

var {
  StyleSheet,
  Image, 
  View,
  TouchableHighlight,
  ScrollView,
  Text,
  Component,
} = React;

class ShowItems extends Component {
  constructor(props) {
    super(props);
  }
  onNewPressed(bl) {
    var page = {
      metadata: bl,
      resourceKey: this.props.resourceKey, 
      resource: this.props.resource,
      parentMeta: this.props.parentMeta
    };
    this.props.navigator.push({
      title: 'Create new ' + bl.title,
      component: NewItem,
      id: 6,
      passProps: page
    });

  }
  onGetOutPressed() {
    var resource = this.props.resource;
    this.props.navigator.push({
      component: ResourceView,
      id: 3,
      passProps: {
        resourceKey: this.props.resourceKey, 
        resource: resource
      }
    });
    // May be save here
  }
  renderRow(bl) {
    return (
      <TouchableHighlight style={[styles.button]} underlayColor='#7AAAC3'
          onPress={this.onNewPressed.bind(this, bl)}>
        <View>
          <Text style={styles.buttonText}>{bl.title}</Text>
        </View>
      </TouchableHighlight>
    );
  }
  render() {
    var myItems = this.props.itemsMeta.map(t => 
        {
          return this.renderRow(t);
        }
      );
    return (
      <ScrollView  ref='this'
        style={styles.container}
        initialListSize={10}
        pageSize={4}
        stickyHeaderIndices={[0]}
        scrollRenderAheadDistance={2000}>
        <View style={styles.tilesBG}>
          <Image style={styles.image} source={require('image!items')} />
        </View>
        <View style={styles.listView}>
          {myItems}
        </View>
        <View style={styles.getOut}>
        <TouchableHighlight style={[styles.buttonOut]} underlayColor='#7AAAC3'
            onPress={this.onGetOutPressed.bind(this)}>
          <Text style={[styles.buttonOutText]}>Get me out of here.</Text>
        </TouchableHighlight>
        </View>
        </ScrollView>
    );
  }
 
}
var styles = StyleSheet.create({
  thumb: {
    width: 80,
    height: 80,
    marginRight: 10
  },
  image: {
    width: 170,
    height: 170,
  },
  listView: {
    flexDirection: 'row',
    paddingLeft: 20,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  tilesBG: {
    backgroundColor: '#2E3B4E',
    alignItems: 'center',
  },
  container: {
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: '#dddddd'
  },
  title: {
    fontSize: 20,
    color: '#2E3B4E'
  },
  addr: {
    fontSize: 16,
    color: '#2E3B4E'   
  },
  rowContainer: {
    flexDirection: 'row',
    padding: 10
  },
  buttonText: {
    fontSize: 18,
    color: '#2E3B4E',
    alignSelf: 'center'
  },
  buttonOutText: {
    fontSize: 18,
    color: '#ffffff',
    alignSelf: 'center'
  },
  getOut: {
    flex: 1,
    alignSelf: 'center'
  },
  buttonOut: {
    height: 36,
    padding: 20,
    alignItems: 'stretch',
    backgroundColor: '#7AAAC3',
    borderColor: '#6093ae',
    borderWidth: 1,
    borderRadius: 8,
    margin: 10,
    justifyContent: 'center',
  },
  button: {
    height: 36,
    padding: 20,
    width: 150,
    borderColor: '#6093ae',
    borderWidth: 1,
    borderRadius: 8,
    margin: 10,
    justifyContent: 'center',
  },

});
module.exports = ShowItems;