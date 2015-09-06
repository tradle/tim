'use strict';

var React = require('react-native');
var utils = require('../utils/utils');
var constants = require('tradle-constants');
var Icon = require('react-native-vector-icons/Ionicons');
var reactMixin = require('react-mixin');
var RowMixin = require('./RowMixin');

var MONEY_TYPE = 'tradle.Money';

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
      photo = <Image source={{uri: utils.getImageUri(resource.document.photos[0].url)}}  style={styles.cellImage} />
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

    rows.push(this.addDateProp('time', styles.verySmallLetters));

    // var val = utils.formatDate(new Date(resource.time));    
    // rows.push(<View><Text style={styles.resourceTitle}>{val}</Text></View>); 

    if (resource.document) 
      this.formatDocument(verificationRequest, resource.document, rows); 

    var backlink = this.props.prop.items.backlink;
    
    if (resource.to  &&  backlink !== 'to') {
      var row = <View style={{flexDirection: 'row'}}>
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
    if (resource.from) {
      var contentRows = [];
      // contentRows.push(<Text style={}>verified by {resource.to.title}></Text>);
      contentRows.push(<Text style={[styles.description, {color: '#7AAAc3'}]}>verified by </Text>);
      if (resource.organization) {
        var orgRow = <Text style={styles.description}>{resource.organization.title}</Text>
        // var orgRow = resource.organization.photos
        //            ?  <View style={{flexDirection: 'row', flex: 1}}>
        //                  <Text style={styles.description}>{resource.organization.title}</Text>
        //                  <Image source={{uri: utils.getImageUri(resource.organization.photos[0].url)}} style={styles.icon} />
        //               </View>
        //            :  <Text style={styles.description}>{resource.organization.title}</Text>
        contentRows.push(orgRow);
        // contentRows.push(<Text style={styles.description}>{resource.organization.title}</Text>);
        // if (resource.organization.photos)
        //   contentRows.push(<Image source={{uri: utils.getImageUri(resource.organization.photos[0].url)}} style={styles.icon} />);
      }
      row = <View style={contentRows.length == 1 ? {flex: 1} : {flexDirection: 'row'}}>
              {contentRows}
            </View>
      rows.push(row);         
      contentRows = []; 

      if (backlink !== 'from') {
        contentRows.push(<Text style={[styles.description, {color: '#7AAAc3'}]}>representative</Text>);
        contentRows.push(<Text style={styles.description}>{resource.from.title}</Text>);
      }
      // if (resource.to.photos) 
      //   contentRows.push(<Image source={{uri: resource.from.photos[0].url}} style={styles.icon}/>);

      row = <View style={{flexDirection: 'row'}}>
              {contentRows}
            </View>
      rows.push(row);         
    }
    rows.push(<View style={{alignSelf: 'flex-end', marginTop: 7}}><Text style={styles.verySmallLetters}>{verificationRequest.title}</Text></View>);

    // var verification = <View style={{alignSelf: 'center'}}><Text style={styles.verySmallLettersCenter}>{verificationRequest.title}</Text></View>

    return (
      <View key={this.props.key} style={{backgroundColor: 'white'}}>
        <TouchableHighlight onPress={this.props.onSelect.bind(this)}>
          <View style={{backgroundColor: '#E0EDFA', paddingVertical: 2}}>
          <View style={styles.row} key={this.props.key + '1'}>
            {photo}
            <View style={styles.textContainer} key={this.props.key + '2'}>
              {rows}
            </View>
          </View>
          </View>
        </TouchableHighlight>
        <View style={styles.cellBorder} />
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

    var isSimpleMessage = model.id === 'tradle.SimpleMessage';
    
    viewCols.forEach(function(v) {
      if (properties[v].type === 'array'  ||  properties[v].type === 'date') 
        return;
      var style = styles.resourceTitle; //(first) ? styles.resourceTitle : styles.description;

      if (properties[v].ref) {
        if (resource[v]) {
          vCols.push(<Text style={style} numberOfLines={first ? 2 : 1}>{resource[v].title}</Text>);
          first = false;
        }

        return;
      }

      if (resource[v]  &&  properties[v].type === 'string'  &&  (resource[v].indexOf('http://') == 0  ||  resource[v].indexOf('https://') == 0)) 
        row = <Text style={style} numberOfLines={first ? 2 : 1}>{resource[v]}</Text>;
      else if (!model.autoCreate) {
        var val = (properties[v].displayAs) 
                ? utils.templateIt(properties[v], resource)
                : resource[v];
        row = <Text style={style} numberOfLines={first ? 2 : 1}>{val}</Text>
      }
      else {
        if (!resource[v]  ||  !resource[v].length)
          return;
        var msgParts = utils.splitMessage(resource[v]);
        // Case when the needed form was sent along with the message
        if (msgParts.length === 2) {
          var msgModel = utils.getModel(msgParts[1]);
          if (msgModel) {
            vCols.push(<View>
                         <Text style={style}>{msgParts[0]}</Text>
                         <Text style={[style, {color: isMyMessage ? '#efffe5' : '#7AAAC3'}]}>{msgModel.value.title}</Text>
                       </View>);                  
            return;
          }
        }
        var row = <Text style={style}>{resource[v]}</Text>;

      }
      if (first) {
        row = <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <View>{row}</View>
                <View><Text style={styles.verySmallLetters}>{renderedRow[0]}</Text></View>
              </View>
        renderedRow.splice(0, 1);
      }
      vCols.push(row);
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
  /*
  formatRow1(resource) {
    var self = this;
    var model = utils.getModel(resource[constants.TYPE]).value;
    var viewCols = model.gridCols || model.viewCols;
    var renderedViewCols;
    if (!viewCols) {
      var vCols = utils.getDisplayName(resource, model.properties);
      return <Text style={styles.resourceTitle} numberOfLines={2}>{vCols}</Text>;
    }
    var idx = viewCols.indexOf(this.props.prop.items.backlink);

    // var isIdentity = model[constants.TYPE] === constants.TYPES.IDENTITY;
    // var isOrganization = model[constants.TYPE] === 'model.Organization';
    // switch (this.props.prop.name) {
    // case 'myVerifications':
    //   idx = viewCols.indexOf(prop.items.backlink);
    //   break;
    // case 'verifiedByMe':
    //   idx = viewCols.indexOf('from');
    //   break;
    // case 'verifications':
    //   if (isOrganization)
    //     idx = viewCols.indexOf('organization');
    //   break;
    // }
    if (idx !== -1)
      viewCols.splice(idx, 1);
    var vCols = [];
    var properties = model.properties;
    var first = true
    var dateProp = 'time';

    viewCols.forEach(function(v) {
      if (v === dateProp)
        return;
      
      if (!resource[v]  &&  !properties[v].displayAs)
        return;
      var style = (first) ? styles.resourceTitle : styles.description;
      if (properties[v].style)
        style = [style, properties[v].style];
      var ref = properties[v].ref;
      if (ref) {
        if (!resource[v]) 
          return;
        var row;
        if (ref == MONEY_TYPE) {
          row = this.getMoneyValue(ref, properties[v]);
          if (!row)
            return;
        }
        else  {          
          row = <Text style={style} numberOfLines={first ? 2 : 1}>{resource[v].title}</Text>
          if (resource[v].photos  &&  v != 'organization') {
            row = <View style={styles.row}>
                    <Image source={{uri: resource[v].photos[0].url}} style={styles.icon}/>
                    {row}
                  </View>
          }
        }
        if (first  &&  dateProp) {
          var val = utils.formatDate(new Date(resource[dateProp]));
          row = <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                  <View>{row}</View>
                  <View><Text style={styles.verySmallLetters}>{val}</Text></View>
                </View>
        }
        
        vCols.push(row);
        first = false;
      }
      else if (properties[v].type === 'date') {
        if (!dateProp)
          vCols.push(self.addDateProp(v));
        else
          return;
      }
      else  {
        // row = self.anyOtherRow(properties[v], null, style);
        if (resource[v]  &&  (typeof resource[v] != 'string'))
          row = <Text style={style} numberOfLines={1}>{resource[v]}</Text>;
        // else if (!backlink  &&  resource[v]  && (resource[v].indexOf('http://') == 0  ||  resource[v].indexOf('https://') == 0))
        //   row = <Text style={style} onPress={self.onPress.bind(self)} numberOfLines={1}>{resource[v]}</Text>;
        else {          
          var val = properties[v].displayAs ? utils.templateIt(properties[v], resource) : resource[v];
          row = <Text style={style}>{val}</Text>;
        }
        if (first  &&  dateProp) {
          var val = utils.formatDate(new Date(resource[dateProp]));
          row = <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                  <View>{row}</View>
                  <View><Text style={styles.verySmallLetters}>{val}</Text></View>
                </View>
        }
        vCols.push(row);
        first = false;
      }
    }); 
    if (vCols)
      renderedViewCols = vCols;
    return renderedViewCols;
  }
  */
}
reactMixin(VerificationRow.prototype, RowMixin);

var styles = StyleSheet.create({
  textContainer: {
    flex: 1,
  },
  resourceTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
    // marginBottom: 2,
  },
  description: {
    flex: 1,
    flexWrap: 'wrap',
    color: '#999999',
    fontSize: 14,
  },
  row: {
    backgroundColor: 'white',
    // justifyContent: 'space-around',
    flexDirection: 'row',
    padding: 5,
  },
  cellText: {
    marginTop: 16,
    alignSelf: 'center',
    color: '#ffffff',
    fontSize: 20,
    backgroundColor: 'transparent'
  },
  cellImage: {
    backgroundColor: '#dddddd',
    height: 60,
    marginRight: 10,
    width: 60,
    borderColor: '#7AAAc3',
    borderRadius:10,
    borderWidth: 1,
  },
  cellBorder: {
    backgroundColor: '#eeeeee',
    height: 1,
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
  verySmallLettersCenter: {
    fontSize: 12,
    color: '#2E3B4E'
  },
});

module.exports = VerificationRow;
