'use strict';

var React = require('react-native');
var utils = require('../utils/utils');
var constants = require('@tradle/constants');
var Icon = require('react-native-vector-icons/Ionicons');
var reactMixin = require('react-mixin');
var RowMixin = require('./RowMixin');
var Accordion = require('react-native-accordion')
var DEFAULT_CURRENCY_SYMBOL = '£'
var {
  Image,
  PixelRatio,
  StyleSheet,
  Text,
  TouchableHighlight,
  Component,
  View
} = React;

class VerificationRow extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    var resource = this.props.resource;
    var photo;
    // if (resource.from  &&  resource.from.photos)
    //   photo = <Image source={{uri: utils.getImageUri(resource.from.photos[0].url)}} style={styles.cellImage} />
    if (resource.document  &&  resource.document.photos)
      photo = <Image source={{uri: utils.getImageUri(resource.document.photos[0].url), position: 'absolute', left: 10}}  style={styles.cellImage} />
    else
      photo = <View style={{width: 70}} />


    // else if (resource.organization  &&  resource.organization.photos)
    //   photo = <Image source={{uri: utils.getImageUri(resource.organization.photos[0].url)}} style={styles.cellImage} />
    // else if (resource.from  &&  resource.from.photos)
    //   photo = <Image source={{uri: utils.getImageUri(resource.from.photos[0].url)}} style={styles.cellImage} />
    // else
    //   photo = <View style={styles.cellImage} />

    var model = utils.getModel(resource[constants.TYPE]).value;
    var verificationRequest = utils.getModel(resource.document[constants.TYPE]).value;

    var rows = [];

    // rows.push(this.addDateProp('time', styles.verySmallLetters));

    // var val = utils.formatDate(new Date(resource.time));
    // rows.push(<View><Text style={styles.resourceTitle}>{val}</Text></View>);

    if (resource.document)
      this.formatDocument(verificationRequest, resource.document, rows);

    var backlink = this.props.prop.items.backlink;

    if (resource.to  &&  backlink !== 'to') {
      var row = <View style={{flexDirection: 'row'}} key={this.getNextKey()}>
                  <Text style={[styles.description, {color: '#7AAAc3'}]}>submitted by </Text>
                  <Text style={styles.description}>{resource.to.title}</Text>
                </View>;
      // var row = resource.to.photos
      //         ? <View style={{flexDirection: 'row'}}>
      //             <Text style={[styles.description, {color: '#7AAAc3'}]}>submitted by </Text>
      //             <Text style={styles.description}>{resource.to.title}</Text>
      //             <Image source={{uri: resource.to.photos[0].url}} style={styles.icon}/>
      //           </View>
      //         : <View style={{flexDirection: 'row'}}>
      //             <Text style={[styles.description, {color: '#7AAAc3'}]}>submitted by </Text>
      //             <Text style={styles.description}>{resource.to.title}</Text>
      //           </View>;
      rows.push(row);
    }
    var verifiedBy
    if (resource.from) {
      var contentRows = [];
      // contentRows.push(<Text style={}>verified by {resource.to.title}></Text>);
      contentRows.push(<Text style={[styles.description, {color: '#7AAAc3'}]} key={this.getNextKey()}>verified by </Text>);
      if (resource.organization) {
        var orgRow = <Text style={styles.description} key={this.getNextKey()}>{resource.organization.title}</Text>
        contentRows.push(orgRow);
      }
      verifiedBy = <View style={contentRows.length == 1 ? {flex: 1} : {flexDirection: 'row'}} key={this.getNextKey()}>
                    {contentRows}
                  </View>
    }
    else
      verifiedBy = <View/>
    var date = this.addDateProp('time', [styles.verySmallLetters, {position: 'absolute', right: 10}])
    var header =  <View style={{borderColor: '#ffffff', backgroundColor: '#ffffff', borderBottomColor: '#cccccc', borderWidth: 0.5}} key={this.getNextKey()}>
                    <View style={{flexDirection: 'row', marginHorizontal: 10,  marginVertical: 3, paddingBottom: 4}}>
                    {photo}
                    {date}
                    <View style={{flexDirection: 'column'}}>
                      <Text style={styles.rTitle}>{verificationRequest.title}</Text>
                      {verifiedBy}
                    </View>
                  </View>
                  </View>

    var content = <View style={{backgroundColor: '#ffffff', borderColor: '#ffffff', borderBottomColor: '#cccccc', paddingVertical: 10, borderWidth: 0.5}}>
                    <TouchableHighlight onPress={this.props.onSelect.bind(this)}>
                      <View style={styles.row}>
                        <View style={styles.textContainer}>
                          {rows}
                        </View>
                      </View>
                    </TouchableHighlight>
                  </View>

    return (
       <View>
         <Accordion
           header={header}
           style={{alignSelf: 'stretch'}}
           content={content}
           underlayColor='transparent'
           easing='easeOutQuad' />
        </View>
    );
  }
  formatDocument(model, resource, renderedRow) {
    var viewCols = model.gridCols || model.viewCols;
    if (!viewCols)
      return
    var verPhoto;
    var vCols = [];
    var first = true;
    var self = this;
    var model = utils.getModel(resource[constants.TYPE] || resource.id).value;

    var properties = model.properties;
    var noMessage = !resource.message  ||  !resource.message.length;
    var onPressCall;

    var isSimpleMessage = model.id === constants.TYPES.SIMPLE_MESSAGE;
    var style = styles.resourceTitle
    var labelStyle = styles.resourceTitleL
    viewCols.forEach(function(v) {
      if (properties[v].type === 'array'  ||  properties[v].type === 'date')
        return;
      if (!resource[v]  &&  !properties[v].displayAs)
        return
       //(first) ? styles.resourceTitle : styles.description;

      var units = properties[v].units && properties[v].units.charAt(0) !== '['
                ? ' (' + properties[v].units + ')'
                : ''

      if (properties[v].ref) {
        if (resource[v]) {
          var symbol = (properties[v].ref === constants.TYPES.MONEY)
                     ? DEFAULT_CURRENCY_SYMBOL
                     : ''
          var val = symbol + (resource[v].title || resource[v])
          vCols.push(
            <View style={{flexDirection: 'row', justifyContent: 'space-between'}} key={self.getNextKey()}>
              <Text style={labelStyle}>{properties[v].title + units}</Text>
              <Text style={style}>{val}</Text>
            </View>
          );
          first = false;
        }

        return;
      }

      if (resource[v]  &&  properties[v].type === 'string'  &&  (resource[v].indexOf('http://') == 0  ||  resource[v].indexOf('https://') == 0))
        row = <Text style={style} key={self.getNextKey()}>{resource[v]}</Text>;
      else if (!model.autoCreate) {
        var val = (properties[v].displayAs)
                ? utils.templateIt(properties[v], resource)
                : resource[v];
        row = <Text style={style} key={self.getNextKey()}>{val}</Text>
      }
      else {
        if (!resource[v]  ||  !resource[v].length)
          return;
        var msgParts = utils.splitMessage(resource[v]);
        // Case when the needed form was sent along with the message
        if (msgParts.length === 2) {
          var msgModel = utils.getModel(msgParts[1]);
          if (msgModel) {
            vCols.push(<View key={self.getNextKey()}>
                         <Text style={style}>{msgParts[0]}</Text>
                         <Text style={[style, {color: isMyMessage ? '#efffe5' : '#7AAAC3'}]}>{msgModel.value.title}</Text>
                       </View>);
            return;
          }
        }
        var row = <Text style={style} key={self.getNextKey()}>{resource[v]}</Text>;

      }
      // if (first) {
      //   row = <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
      //           <View>{row}</View>
      //           <View><Text style={styles.verySmallLetters}>{renderedRow[0]}</Text></View>
      //         </View>
      //   renderedRow.splice(0, 1);
      // }

      vCols.push(
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}} key={self.getNextKey()}>
          <Text style={labelStyle}>{properties[v].title + units}</Text>
          {row}
        </View>
      );
      first = false;
    });
    // if (model.style)
    //   vCols.push(<Text style={styles.verySmallLetters}>{model.title}</Text>);

    if (vCols  &&  vCols.length) {
      vCols.forEach(function(v) {
        renderedRow.push(v);
      });
    }
  }
}
reactMixin(VerificationRow.prototype, RowMixin);

var styles = StyleSheet.create({
  textContainer: {
    flex: 1,
  },
  rTitle: {
    flex: 1,
    fontSize: 18,
    marginVertical: 5,
    color: '#757575',
    // fontWeight: '600',
    // marginBottom: 2,
  },
  resourceTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
    // marginBottom: 2,
  },
  resourceTitleL: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
    paddingRight: 5,
    color: '#999999',
    // marginBottom: 2,
  },
  description: {
    flex: 1,
    flexWrap: 'wrap',
    color: '#999999',
    fontSize: 14,
  },
  row: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    marginHorizontal: 10,
    padding: 5,
  },
  cellImage: {
    backgroundColor: '#dddddd',
    height: 60,
    marginRight: 10,
    width: 60,
    borderColor: '#7AAAc3',
    borderRadius:10,
    borderWidth: 0.5,
  },
  cellBorder: {
    backgroundColor: '#eeeeee',
    height: 0.5,
    marginLeft: 4,
  },
  icon: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#7AAAc3',
    borderRadius: 10,
    marginRight: 10,
    alignSelf: 'center',
  },
  verySmallLetters: {
    fontSize: 12,
    alignSelf: 'flex-end',
    color: '#b4c3cb'
  },
  // verySmallLettersCenter: {
  //   fontSize: 12,
  //   color: '#2E3B4E'
  // },
});

module.exports = VerificationRow;
