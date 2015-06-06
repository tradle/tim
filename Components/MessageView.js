'use strict';
 
var React = require('react-native');
var utils = require('../utils/utils');
var ArticleView = require('./ArticleView');
var FromToView = require('./FromToView');
var PhotoView = require('./PhotoView');
var ViewCols = require('./ViewCols');
var MoreLikeThis = require('./MoreLikeThis');
var VerificationButton = require('./VerificationButton');

var {
  StyleSheet,
  ScrollView,
  Image, 
  View,
  Text,
  TextInput,
  TouchableHighlight,
  Component
} = React;

class MessageView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      resource: props.resource,
    };
  }
  render() {
    var resource = this.state.resource;
    var modelName = resource['_type'];
    var model = utils.getModel(modelName).value;
 
    var embed = /*modelName === 'tradle.AssetVerification' 
              ? <View style={{marginLeft: 15}}>
                  <Text style={{fontSize: 20, paddingTop: 15, paddingBottom: 15, color: '#2E3B4E'}}>Verified By</Text>
                  <Image style={styles.imageVerifiedBy} source={{uri: 'http://upload.wikimedia.org/wikipedia/en/thumb/7/7e/Barclays_logo.svg/391px-Barclays_logo.svg.png'}}/>
                  <Text style={styles.buttonText} onPress={self.showEmbed.bind(self)}>Embed</Text>
                  <View style={styles.separator}></View>
                  <Text style={self.state.embedHeight}>{"<iframe width='420' height='315' src='https://tradle.io/embed/aifSjuyeE5M' frameborder='0' allowfullscreen></iframe>"}</Text>
                  <View style={{height: 50}} />
                </View>
              :*/ <View></View>  
    var msgProp = utils.getCloneOf('tradle.Message.message', model.properties);
    var date = utils.getFormattedDate(new Date(resource[this.state.timeProp]));
    return (
      <ScrollView  ref='this' style={styles.container}>
        <View style={styles.photoBG}>
          <PhotoView resource={resource} />
        </View>

        <FromToView resource={resource} navigator={this.props.navigator} />
        <View style={styles.buttonsContainer}>
          <MoreLikeThis resource={resource} navigator={this.props.navigator} />
          <VerificationButton  resource={resource} navigator={this.props.navigator} />
        </View>
        <View style={styles.rowContainer}>    
          <View><Text style={styles.date}>{date}</Text></View>
          <View><Text style={styles.itemTitle}>{resource[msgProp]}</Text></View>
          <ViewCols resource={resource} excludedProperties={['tradle.Message.message', 'tradle.Message.time']} />
          {embed}
        </View>
      </ScrollView>
    );
  }
  showEmbed() {
    this.setState({embedHeight: {height: 60, padding: 5, marginRight: 10, borderColor: '#2E3B4E', backgroundColor: '#eeeeee'}});
  }
  
  onPress(url) {
    this.props.navigator.push({
      id: 7,
      component: ArticleView,
      passProps: {url: url}
    });
  } 
}
var styles = StyleSheet.create({
  container: {
    marginTop: 60,
    flex: 1,
  },
  itemTitle: {
    fontSize: 18,
    margin: 5,
    marginBottom: 0,
    color: '#7AAAC3'
  },
  photoBG: {
    backgroundColor: '#2E3B4E',
    alignItems: 'center',
  },
  buttonsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  rowContainer: {
    padding: 10
  },
  date: {
    fontSize: 12,
    alignSelf: 'flex-end',
    color: '#b4c3cb'
  }
});

module.exports = MessageView;