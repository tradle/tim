'use strict';

var React = require('react-native');
var utils = require('../utils/utils');
var ArticleView = require('./ArticleView');
var MessageView = require('./MessageView');
var NewResource = require('./NewResource');
var PhotoList = require('./PhotoList');
var Icon = require('react-native-vector-icons/Ionicons');
var extend = require('extend');
var groupByEveryN = require('groupByEveryN');
var constants = require('tradle-constants');
var LinearGradient = require('react-native-linear-gradient');
var RowMixin = require('./RowMixin');
var reactMixin = require('react-mixin');

var {
  Image,
  StyleSheet,
  Text,
  TouchableHighlight,
  AlertIOS,
  Component,
  View
} = React;

class MessageRow extends Component {
  constructor(props) {
    super(props);
    // var dataSource = new ListView.DataSource({
    //   rowHasChanged: (row1, row2) => row1 !== row2,
    // });

    // this.state = {
    //   resource: this.props.resource,
    //   dataSource: dataSource
      // viewStyle: {
      //   margin: 1,
      // },
      // cnt: 0
    // }
  }
  render() {
    var resource = this.props.resource;
    var isModel = !resource[constants.TYPE];
    if (isModel  &&  resource.autoCreate)
      return <View style={{height: 0}} />;
    var model = utils.getModel(resource[constants.TYPE] || resource.id).value;
    var me = utils.getMe();
    var isMyMessage;
    if (!isModel  &&  !this.props.isAggregation) {
      var fromHash = utils.getId(resource.from);
      if (fromHash == me[constants.TYPE] + '_' + me[constants.ROOT_HASH]) 
        isMyMessage = true;      
    }
    var to = this.props.to;
    var ownerPhoto, hasOwnerPhoto;
    if (isModel) {
      if (resource.owner  &&  resource.owner.photos)  {
        hasOwnerPhoto = true;
        var uri = utils.getImageUri(resource.owner.photos[0].url);
        ownerPhoto = 
          <View style={[styles.cell, {marginVertical: 2}]}>
            <Image source={{uri: uri}} style={styles.msgImage} />         
          </View>
      }
      else
        ownerPhoto = <View style={[styles.cell, {marginVertical: 20}]} />
    }  
    else {
      if (isMyMessage  || !to  ||  !to.photos) 
        ownerPhoto = <View style={[styles.cell, {marginVertical: 0}]} />
      else if (to) {
        if (to.photos) {
          var uri = utils.getImageUri(to.photos[0].url);
          ownerPhoto = <Image source={{uri: uri}} style={styles.msgImage} /> 
          hasOwnerPhoto = true;
        }
        else if (!isMyMessage) {
          var title = resource.to.title.split(' ').map(function(s) {
            return s.charAt(0);
          }).join('');
          ownerPhoto = <LinearGradient colors={['#A4CCE0', '#7AAAc3', '#5E92AD']} style={styles.cellRoundImage}>
            <Text style={styles.cellText}>{title}</Text>
          </LinearGradient>
        }
      }
    }
    var renderedRow = [];
    var onPressCall;
    if (isModel) 
      onPressCall = this.props.onSelect;
    else
      onPressCall = this.formatRow(isMyMessage, model, resource, renderedRow);
    
    var photoUrls = [];
    var photoListStyle = {height: isModel ? 0 : 3};
    var addStyle, inRow;
    var noMessage = !resource.message  ||  !resource.message.length;
    if (!renderedRow.length) {
      var vCols = isModel 
                ? utils.getDisplayName(resource) 
                : noMessage ? null : utils.getDisplayName(resource, model.properties);
      if (vCols)                
        renderedRow = <Text style={isModel ? styles.modelTitle : styles.resourceTitle} numberOfLines={2}>{vCols}</Text>;
    }
    else if (!isModel) {
      var fromHash = resource.from.id;
      if (isMyMessage) { 
        if (!noMessage)
          addStyle = styles.myCell;
      }
      else {
        if (!model.style)
          addStyle = {padding: 5, borderRadius: 10, borderColor: '#cccccc', backgroundColor: '#ffffff', marginVertical: 2};
          // addStyle = {padding: 5, borderRadius: 10, borderColor: '#cccccc', backgroundColor: '#ffffff', marginVertical: 2};
        // else
        //   addStyle = {padding: 5, borderRadius: 10};
      }
      if (model.style) 
        addStyle = [addStyle, {padding: 5, borderRadius: 10, backgroundColor: '#efffe5', borderWidth: 1, borderColor: '#deeeb4', marginVertical: 2}]; //model.style];
        // viewCols = <View style={styles.myCell}>{viewCols}</View>
    }
    var properties = model.properties;
    var verPhoto;
    if (!isModel  &&  properties.photos) {
      if (resource.photos) {
        var len = resource.photos.length;
        inRow = len === 1 ? 1 : (len == 2 || len == 4) ? 2 : 3;
        var style;
        if (inRow === 1)
          style = styles.bigImage;
        else if (inRow === 2)
          style = styles.mediumImage;
        else
          style = styles.image;
        for (var p of resource.photos) 
          photoUrls.push({url: utils.getImageUri(p.url)});
        
        photoListStyle = {
          flexDirection: 'row', 
          alignSelf: isMyMessage ? 'flex-end' : 'flex-start', 
          marginLeft: isMyMessage ? 30 : 55,
          borderRadius: 10,
          marginBottom: 3, 
        }
      }
      else
        verPhoto = <View style={{height: 0, width:0}} />
    }
    else if (isModel  &&  resource.owner  &&  resource.owner.photos) {
      var ownerImg = resource.owner.photos[0].url;
      var url = utils.getImageUri(ownerImg);
      verPhoto = <Image source={{uri: ownerImg}} style={styles.ownerImage} />
    }
    var rowStyle = isModel && model.style 
                 ? [styles.row, {backgroundColor: '#efffe5'}] 
                 : noMessage ? {} : styles.row;
    var val;
    var date;
    if (!isModel  &&  resource.time) {
      var previousMessageTime = this.props.previousMessageTime;      
      var showTime = !previousMessageTime  ||  this.props.isAggregation;

      if (!showTime)  {
        var prevDate = new Date(previousMessageTime);
        var curDate = new Date(resource.time);
        showTime = resource.time - previousMessageTime > 3600000 ||
                   prevDate.getDate()  !== curDate.getDate()  ||
                   prevDate.getMonth() !== curDate.getMonth() ||
                   prevDate.getYear()  !== curDate.getYear() 
      }

      if (showTime)
        val = utils.getFormattedDate(resource.time);
    }
    
    var date = val 
             ? <Text style={styles.date} numberOfLines={1}>{val}</Text>
             : <View />;

    var showMessageBody;
    if (!isModel  &&  noMessage) {
      if (hasOwnerPhoto) 
        showMessageBody = true;
      else if (!model.properties['message'])
        showMessageBody = true;
    }
    else 
      showMessageBody = true;
    var messageBody;
    var isSimpleMessage = model.id === 'tradle.SimpleMessage';
    if (showMessageBody) {
      var viewStyle;
      if (!isModel) {
        viewStyle = {flexDirection: 'row', alignSelf: isMyMessage ? 'flex-end' : 'flex-start'};
        if ((!noMessage  &&  resource.message.length > 30)  ||  !isSimpleMessage)
          viewStyle.width = 260;
      }  

      // var verified;
      // if (!resource.verifications  ||  !resource.verifications.length)
      //   verified = <View />
      // else {
      //   var verifications = [];
      //   resource.verifications.forEach(function(v) {
      //     if (v.organization  &&  v.organization.photo)              
      //       verifications.push(<Image source={{uri: v.organization.photo}} style={styles.orgImage} />)
      //   })
      //   verified = <View style={styles.verificationCheck}>
      //                <Icon name='ios-checkmark-empty' size={25} style={styles.icon} />
      //                {verifications}
      //              </View>
      // }
      messageBody = 
        <TouchableHighlight onPress={onPressCall ? onPressCall : () => {}} underlayColor='transparent'>
          <View style={[rowStyle, viewStyle]}>
            {isModel ? <View style={{paddingLeft: 10}}/> : ownerPhoto}
            <View style={addStyle ? [styles.textContainer, addStyle] : styles.textContainer}>
              <View style={{flex: 1}}>
                {renderedRow}
             </View>
            </View>
            {!isModel ? <View/> : ownerPhoto}
          </View>
        </TouchableHighlight>      
    }
    else
      messageBody = <View style={{height: 5}}/>
    var len = photoUrls.length;
    var inRow = len === 1 ? 1 : (len == 2 || len == 4) ? 2 : 3;
    // var inRow = len ? (len === 1 ? 1 : (len % 2) ? 3 : 2) : 0;
    var photoStyle = {};
    var height; 
    if (inRow > 0) {
      if (inRow === 1)
        photoStyle = styles.bigImage;
      else if (inRow === 2)
        photoStyle = styles.mediumImage;
      else
        photoStyle = styles.image;
    }

    var viewStyle = { margin:1, backgroundColor: '#f7f7f7' }
    // var viewStyle = { margin:1, backgroundColor: '#f7f7f7' }
    var isModel = !this.props.resource[constants.TYPE];
    var model = isModel ? utils.getModel(this.props.resource.id).value : utils.getModel(this.props.resource[constants.TYPE]).value;
    var isLicense = model.id.indexOf('License') !== -1  ||  model.id.indexOf('Passport') !== -1;
    // var isUtility = !isLicense  &&  model.id.indexOf('Utility') !== -1
    var photoStyle = (isLicense) ? styles.bigImageH : photoStyle;
      
    return (
      <View style={viewStyle} key={resource}>
        {date}
        {messageBody}
        <View style={photoListStyle}>
          <PhotoList photos={photoUrls} resource={this.props.resource} style={[photoStyle, {marginTop: -20}]} navigator={this.props.navigator} numberInRow={inRow} />    
        </View>  
      </View>
    );
  }
  onPress(event) {
    this.props.navigator.push({
      id: 7,
      component: ArticleView,
      passProps: {url: this.props.resource.message}
    });
  }
  createNewResource(model) {
    var resource = {
      'from': this.props.resource.to,
      'to': this.props.resource.from,
      'message': this.props.resource.message,
    }
    resource[constants.TYPE] = model.id;

    this.props.navigator.push({
      id: 4,
      title: model.title,
      rightButtonTitle: 'Done',
      backButtonTitle: 'Back',
      component: NewResource,
      titleTextColor: '#7AAAC3',
      passProps:  {
        model: model,
        resource: resource
      }
    });    
  }

  verify(event) {
    var self = this;
    var resource = self.props.resource;
    var model = utils.getModel(resource[constants.TYPE]).value;
    this.props.navigator.push({
      id: 5,
      component: MessageView,
      backButtonTitle: 'Back',
      // rightButtonTitle: 'Edit',
      // onRightButtonPress: {
      //     title: 'Edit',
      //     component: NewResource,
      //     titleTextColor: '#7AAAC3',
      //     id: 4,
      //     passProps: {
      //       resource: resource,
      //       metadata: model,
      //       callback: this.props.onSelect,
      //       resourceKey: model.id + '_' + resource[constants.ROOT_HASH]
      //     }
      // }, 

      passProps: {resource: self.props.resource, verify: true},
      title: resource[constants.TYPE] == 'tradle.AssetVerification' ? 'Doc verification' : model.title
    });
  }
  formatRow(isMyMessage, model, resource, renderedRow) {
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
    var cnt = 0; 
    viewCols.forEach(function(v) {
      if (properties[v].type === 'array'  ||  properties[v].type === 'date') 
        return;
      var style = styles.resourceTitle; //(first) ? styles.resourceTitle : styles.description;
      if (isMyMessage) {
        style = [style, {justifyContent: 'flex-end', paddingLeft: 5}];
        if (isSimpleMessage)
          style.push({color: '#ffffff'});
      }

      if (properties[v].ref) {
        if (resource[v]) {
          vCols.push(<Text style={style} numberOfLines={first ? 2 : 1}>{resource[v].title}</Text>);
          first = false;
        }
        return;
      }

      if (resource[v]                      &&  
          properties[v].type === 'string'  && 
          (resource[v].indexOf('http://') == 0  ||  resource[v].indexOf('https://') == 0)) {
        onPressCall = self.onPress.bind(self);
        vCols.push(<Text style={style} numberOfLines={first ? 2 : 1}>{resource[v]}</Text>);
      }
      else if (!model.autoCreate) {
        var val = (properties[v].displayAs) 
                ? utils.templateIt(properties[v], resource)
                : resource[v];
        if (model.properties.verifications  &&  !isMyMessage)                  
          onPressCall = self.verify.bind(self);
        vCols.push(<Text style={style} numberOfLines={first ? 2 : 1}>{val}</Text>)
      }
      else {
        if (!resource[v]  ||  !resource[v].length)
          return;
        var msgParts = utils.splitMessage(resource[v]);
        // Case when the needed form was sent along with the message
        if (msgParts.length === 2) {
          if (!msgParts[0].length)
            msgParts[0] = 'Form for';
          var msgModel = utils.getModel(msgParts[1]);
          if (msgModel) {
            msgModel = msgModel.value;
            if (!isMyMessage)
              onPressCall = self.createNewResource.bind(self, msgModel);
            var link = isMyMessage
                     ? <Text style={[style, {color: isMyMessage ? '#efffe5' : '#2892C6'}]}>{msgModel.title}</Text>
                     : <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                         <Text style={[style, {color: isMyMessage ? '#efffe5' : '#2892C6'}]}>{msgModel.title}</Text>
                         <Icon style={styles.linkIcon} size={20} name={'ios-arrow-right'} />
                       </View>
            vCols.push(<View>
                         <Text style={style}>{msgParts[0]}</Text>
                         {link}
                       </View>);     
            if (self.props.verificationsToShare) {
              var vtt = [];
              var cnt = 0;
              for (var t in  self.props.verificationsToShare) {
                if (t === msgModel.id) {
                  var ver = self.props.verificationsToShare[t];                 
                  ver.forEach(function(r) {
                    var vModel = utils.getModel(r[constants.TYPE]);
                    var doc = self.formatDocument(msgModel, r);
                    if (cnt) {
                      doc = <View>
                              <View style={{height: 1, backgroundColor: '#dddddd'}} />
                              {doc}
                            </View>

                    }
                    vtt.push(doc);
                    cnt++;
                  })
                }
              }
              if (vtt.length) {
                var orgRow;
                // if (resource.organization) {
                //   orgRow = resource.organization.photos
                //          ?  <View style={{flexDirection: 'row', flex: 1}}>
                //                <Image source={{uri: utils.getImageUri(resource.organization.photos[0].url)}} style={styles.icon} />
                //                <Text style={styles.verySmallLetters}>{resource.organization.title}</Text>
                //             </View>
                //          :  <Text style={styles.description}>{resource.organization.title}</Text>
                //   orgRow = <TouchableHighlight underlayColor='transparent' onPress={this.transferDocs.bind(this)}>
                //              {orgRow}
                //            </TouchableHighlight>
                //   // contentRows.push(<Text style={styles.description}>{resource.organization.title}</Text>);
                //   // if (resource.organization.photos)
                //   //   contentRows.push(<Image source={{uri: utils.getImageUri(resource.organization.photos[0].url)}} style={styles.icon} />);
                // }
                // else
                  orgRow = <View />

                vCols.push(
                  <View>
                    <View style={{flexDirection: 'row'}}>
                      <View style={styles.separator} />
                      <View style={{flex:20, marginLeft: 10, marginRight: -10, alignSelf: 'center'}}>
                        <Text style={styles.verifications}>OR</Text>
                      </View>
                      <View style={styles.separator} />
                      {orgRow}
                    </View>
                    <View style={{alignSelf: 'center'}}><Text style={[styles.verySmallLetters, {marginTop: -3, paddingBottom:10}]}>Choose from the ones below</Text></View>
                    {vtt}
                  </View>)
              }
            }                        
            return;
          }
        }
        vCols.push(<Text style={style}>{resource[v]}</Text>);
      }
      first = false;
    }); 
    
    if (model.id !== 'tradle.SimpleMessage')  {
      var t = model.title.split(' ');
      var s = '';
      t.forEach(function(p) {
        if (p.indexOf('Verif') === -1)
          s += p + ' ';
      });

      if (resource.verifications  &&  resource.verifications.length) {
        var verifications = [];
        resource.verifications.forEach(function(v) {
          if (v.organization  &&  v.organization.photo) {
            verifications.push(<Text style={styles.verySmallLetters}>{v.organization.title}</Text>);
            verifications.push(<Image source={{uri: v.organization.photo}} style={styles.orgImage} />);
          }
        })
        vCols.push(<View style={styles.verificationCheck}>
                     <Text style={styles.verySmallLetters}>{s}verified by </Text>
                     {verifications}
                   </View>);
      }
      else
        vCols.push(<Text style={styles.verySmallLetters}>{s}</Text>);
    }  
    if (vCols  &&  vCols.length)
      extend(renderedRow, vCols);
    return onPressCall ? onPressCall : (isSimpleMessage ? null : this.props.onSelect);
  }
  share() {
    console.log('Share')
  }
  shareDocs() {
    this.props.navigator.push({
      title: m.title,
      titleTextColor: '#7AAAC3',
      id: 10,
      component: ResourceList,
      backButtonTitle: 'Back',
      passProps: {
        filter:      filter, 
        prop:        propName,
        modelName:   prop.ref,
        resource:    resource,
        returnRoute: currentRoutes[currentRoutes.length - 1],
        callback:    this.setChosenValue.bind(this)
      }
    });
    
  }
  formatDocument(model, verification) {
    var resource = verification.document;
    var self = this;
    var docModel = utils.getModel(resource[constants.TYPE]).value;
    var docModelTitle = docModel.title;
    var idx = docModelTitle.indexOf('Verification');
    var docTitle = idx === -1 ? docModelTitle : docModelTitle.substring(0, idx);

    var msg;
    if (resource.message)
      msg = <View><Text style={styles.description}>{resource.message}</Text></View>
    else {
      var rows = [];
      this.formatDocument1(model, resource, rows);
      msg = <View>{rows}</View>
      // msg = <View>
      //         <Text style={styles.description}>
      //           {utils.getDisplayName(resource, docModel.properties)}
      //         </Text>
      //       </View>
    }
    var photo = (resource  &&  resource.photos)
              ? <Image source={{uri: utils.getImageUri(resource.photos[0].url)}}  style={styles.cellImage} />
              : <View />;
    
    var orgRow;
    if (verification.organization) {
      var orgPhoto = verification.organization.photo
                   ? <Image source={{uri: utils.getImageUri(verification.organization.photo)}} style={[styles.orgImage, {marginTop: -5}]} />
                   : <View/> 
      orgRow =  <View style={{flexDirection: 'row', marginTop: 5}}>
                   <Text style={styles.verySmallLetters}>verified by </Text>
                   <Text style={[styles.verySmallLetters, {color: '#757575'}]}>{verification.organization.title.length < 10 ? verification.organization.title : verification.organization.title.substring(0, 8) + '..'}</Text>
                </View>
    }
    else
      orgRow = <View />

    return (
           <TouchableHighlight underlayColor='transparent' onPress={() =>
              AlertIOS.alert(
                'Sharing ' + docTitle + ' verified by ' + verification.organization.title,
                'with ' + this.props.to.organization.title, 
                [
                  {text: 'Share', onPress: this.share.bind(this)},
                  {text: 'Cancel', onPress: () => console.log('Canceled!')},
                ]
            )}>
           <View style={{flex: 1, flexDirection: 'row', paddingVertical: 5}}>
             <View>
               {photo}
             </View>  
             <View style={{flex:1}}>
               {msg}
               {orgRow}
             </View>  
           </View>
           </TouchableHighlight>
           );
  }
  formatDocument1(model, resource, renderedRow) {
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
      var style = styles.description; //(first) ? styles.resourceTitle : styles.description;

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

}

var styles = StyleSheet.create({
  textContainer: {
    flex: 1,
    flexDirection: 'row'
  },
  modelTitle: {
    flex: 1,
    flexWrap: 'wrap',
    fontSize: 17,
    fontWeight: '400',
    marginVertical: 15,
  },
  resourceTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 2,
  },
  date: {
    flex: 1,
    color: '#999999',
    fontSize: 12,
    alignSelf: 'center',
    paddingTop: 10
  },
  row: {
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
    flexDirection: 'row',
  },
  cell: {
    marginLeft: 10,
  },
  myCell: { 
    padding: 5, 
    justifyContent: 'flex-end', 
    borderRadius: 10, 
    backgroundColor: '#569bff',
  },
  msgImage: {
    backgroundColor: '#dddddd',
    height: 40,
    marginRight: 5,
    width: 40,
    borderRadius: 20,
    borderColor: '#cccccc',
    borderWidth: 1
  },
  bigImage: {
    width: 240,
    height: 280,
    margin: 1,
    borderRadius: 10
  },
  bigImageH: {
    width: 240,
    height: 170,
    margin: 1,
    borderRadius: 10
  },
  mediumImage: {
    width: 120,
    height: 120,
    margin: 1,
    borderRadius: 10
  },
  image: {
    width: 80,
    height: 80,
    margin: 1,
    borderRadius: 10
  },
  ownerImage: {
    backgroundColor: '#dddddd',
    height: 30,
    width: 30,
    marginTop: -5,
    position: 'absolute',
    right: 10,
    borderRadius: 15,
    borderColor: '#cccccc',
    borderWidth: 1
  },
  verifications: {
    fontSize: 12,
    // backgroundColor: '#efffe5'
  },
  verySmallLetters: {
    fontSize: 12,
    alignSelf: 'flex-end',
    color: '#b4c3cb'
  },
  orgImage: {
    width: 20,
    height: 20,
    marginLeft: 5,
    // marginTop: 17,
    borderRadius: 10
  },
  verificationCheck: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    padding: 3, 
    marginVertical: 5
    // marginTop: -5
  },
  cellRoundImage: {
    paddingVertical: 1,
    borderRadius: 30,
    height: 60,
    marginRight: 10,
    width: 60,
    alignSelf: 'center'
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
    height: 40,
    width: 40,
    marginRight: 10,
    borderColor: 'transparent',
    borderRadius:10,
    borderWidth: 1,
  },
  linkIcon: {
    width: 20,
    height: 20,
    color: '#2892C6'
  },
  icon: {
    width: 20,
    height: 20,
    marginLeft: 4,
    borderWidth: 1,
    borderColor: '#eeeeee',
    borderRadius: 10,
    marginRight: 5,
  },
  description: {
    flexWrap: 'wrap',
    color: '#999999',
    fontSize: 14,
  },
  separator: {
    height: 1,
    marginTop: 5,
    backgroundColor: '#cccccc',
    flex: 40
  }  
});
reactMixin(MessageRow.prototype, RowMixin);

module.exports = MessageRow;
