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
var STRUCTURED_MESSAGE_COLOR = '#5482C7' //'#2E3B4E' //'#77ADFC' //'#F4F5E6'
var VERIFICATION_BG = '#FBFFE5' //'#F6FFF0';
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
    var resource = this.props.resource;
    var model = utils.getModel(resource[constants.TYPE] || resource.id).value;
    var me = utils.getMe();
    var isMyMessage;
  }
  render() {
    var resource = this.props.resource;
    var model = utils.getModel(resource[constants.TYPE] || resource.id).value;
    var me = utils.getMe();

    var isMyMessage = this.isMyMessage();
    var to = this.props.to;
    var ownerPhoto, hasOwnerPhoto = true;

    if (isMyMessage  || !to  ||  !to.photos) {
      ownerPhoto = <View style={{marginVertical: 0}} />
      hasOwnerPhoto = false;
    }
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

    var renderedRow = [];
    var onPressCall;
    var isNewProduct, isConfirmation
    var isVerification = resource[constants.TYPE] === 'tradle.Verification';
    if (isVerification)
      onPressCall = this.props.onSelect;
    else {
      var ret = this.formatRow(isMyMessage, model, resource, renderedRow);
      onPressCall = ret ? ret.onPressCall : null
      isNewProduct = ret ? ret.isNewProduct : null
      isConfirmation = ret ? ret.isConfirmation : null
    }

    var photoUrls = [];
    var photoListStyle = {height: 3};
    var addStyle, inRow;
    var noMessage = !resource.message  ||  !resource.message.length;
    var isSimpleMessage = resource[constants.TYPE] === constants.TYPES.SIMPLE_MESSAGE
    var isAdditionalInfo = !isSimpleMessage  &&  resource[constants.TYPE] === 'tradle.AdditionalInfo';
    if (!renderedRow.length  &&  !isVerification) {
      var vCols = noMessage ? null : utils.getDisplayName(resource, model.properties);
      if (vCols)
        renderedRow = <Text style={styles.resourceTitle} numberOfLines={2}>{vCols}</Text>;
    }
    else {
      var fromHash = resource.from.id;
      if (isMyMessage) {
        if (!noMessage)
          addStyle = isNewProduct ? styles.myAdCell : styles.myCell;
      }
      else {
        if (!model.style) {
          addStyle = {paddingVertical: 5, paddingHorizontal: 7, borderRadius: 10, borderColor: '#cccccc', backgroundColor: '#ffffff', marginVertical: 2};
          if (isConfirmation)
            addStyle = [addStyle, styles.myConfCell]
        }
      }
      if (model.style  ||  isVerification)
        addStyle = [addStyle, {paddingVertical: 5, paddingHorizontal: 7, borderRadius: 10, backgroundColor: (isVerification ? VERIFICATION_BG : STRUCTURED_MESSAGE_COLOR), borderWidth: 1, borderColor: '#deeeb4', marginVertical: 2}]; //model.style];
      else if (isAdditionalInfo)
        addStyle = [addStyle, {paddingVertical: 5, paddingHorizontal: 7, borderRadius: 10, backgroundColor: '#FCF1ED', borderWidth: 1, borderColor: '#FAE9E3', marginVertical: 2}]; //model.style];
      else {
        if (isMyMessage  &&  !isSimpleMessage)
          addStyle = [addStyle, {paddingVertical: 5, paddingHorizontal: 7, borderRadius: 10, backgroundColor: STRUCTURED_MESSAGE_COLOR, borderWidth: 1, borderColor: '#C1E3E8', marginVertical: 2}]; //model.style];
      }
    }
    var properties = model.properties;
    var verPhoto;
    if (properties.photos) {
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
          // marginLeft: isMyMessage ? 30 : (hasOwnerPhoto ? 45 : 10),
          borderRadius: 10,
          marginBottom: 3,
        }
      }
      else
        verPhoto = <View style={{height: 0, width:0}} />
    }
    var rowStyle = styles.row;
    var val;
    var date;
    if (resource.time) {
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
    if (noMessage) {
      if (hasOwnerPhoto)
        showMessageBody = true;
      else if (!model.properties['message'])
        showMessageBody = true;
      else if (isVerification)
        showMessageBody = true;
    }
    else
      showMessageBody = true;
    var messageBody;
    var isSimpleMessage = model.id === 'tradle.SimpleMessage';
    if (showMessageBody) {
      var viewStyle = {flexDirection: 'row', alignSelf: isMyMessage ? (isNewProduct ? 'center' : 'flex-end') : 'flex-start'};
      if (resource.message) {
        if (resource.message.charAt(0) === '['  ||  resource.message.length > 30) {
          if (!isNewProduct)
            viewStyle.width = isMyMessage || !hasOwnerPhoto ? 300 : 330;
          else {
            viewStyle.alignSelf = 'stretch'
            viewStyle.justifyContent = 'center'
          }
        }
      }
      if (!isSimpleMessage)
        viewStyle.width = isMyMessage || !hasOwnerPhoto ? 300 : 330;

      if (isVerification) {
        var msgModel = utils.getModel(resource.document[constants.TYPE]).value;
        var orgName = resource.organization  ? resource.organization.title : ''
        renderedRow = <View>
                        <View style={{flexDirection: 'row', backgroundColor: '#289427', paddingVertical: 5, paddingHorizontal: 7, marginHorizontal: -7, marginTop: -5, justifyContent: 'center'}}>
                          <Icon style={styles.verificationIcon} size={20} name={'android-done'} />
                          <Text style={{fontSize: 16, fontWeight: '600', color: '#FBFFE5', alignSelf: 'center'}}>
                             Verified by {orgName}
                          </Text>
                        </View>
                        <View style={{paddingTop: 5}}>
                          {this.formatDocument(msgModel, resource, this.verify.bind(this))}
                        </View>
                        <View style={{paddingTop: 5}}>
                          <Text style={[styles.resourceTitle, {alignSelf:'flex-end', fontSize: 18, color: '#CCCCB2'}]}>{msgModel.title}</Text>
                        </View>
                      </View>
      }
      var rowId = <Text style={{fontWeight: '600', fontSize: 16, color: isMyMessage ? '#ffffff' : '#289427', paddingRight: 3}}>{this.props.messageNumber + '.'}</Text>;
      messageBody =
        <TouchableHighlight onPress={onPressCall ? onPressCall : () => {}} underlayColor='transparent'>
          <View style={[rowStyle, viewStyle]}>
            {ownerPhoto}
            <View style={addStyle ? [styles.textContainer, addStyle] : styles.textContainer}>
              <View style={{flex: 1}}>
                {renderedRow}
             </View>
            </View>
          </View>
        </TouchableHighlight>
    }
    else
      messageBody = <View style={{height: 5}}/>

    var len = photoUrls.length;
    var inRow = len === 1 ? 1 : (len == 2 || len == 4) ? 2 : 3;
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
    var model = utils.getModel(this.props.resource[constants.TYPE]).value;
    var isLicense = model.id.indexOf('License') !== -1  ||  model.id.indexOf('Passport') !== -1;
    var photoStyle = (isLicense  &&  len === 1) ? styles.bigImageH : photoStyle;
    var verifications = this.showVerifications(rowStyle, viewStyle, addStyle);

    return (
      <View style={viewStyle} key={resource}>
        {date}
        {messageBody}
        <View style={photoListStyle}>
          <PhotoList photos={photoUrls} resource={this.props.resource} style={[photoStyle, {marginTop: -30}]} navigator={this.props.navigator} numberInRow={inRow} />
        </View>
        {verifications}
      </View>
    );
  }
  editVerificationRequest() {
    var resource = this.props.resource.document;
    var rmodel = utils.getModel(resource[constants.TYPE]).value;
    var title = utils.getDisplayName(resource, rmodel.properties);
    this.props.navigator.push({
      title: title,
      id: 4,
      component: NewResource,
      titleTextColor: '#7AAAC3',
      backButtonTitle: 'Back',
      rightButtonTitle: 'Done',
      passProps: {
        model: rmodel,
        resource: resource,
        additionalInfo: this.props.resource,
        editCols: ['photos']
      }
    })
  }
  showVerifications(rowStyle, viewStyle, addStyle) {
    if (!this.props.verificationsToShare || !this.props.resource.message)
      return <View/>;

    var resource = this.props.resource;
    var msgParts = utils.splitMessage(resource.message);
    // Case when the needed form was sent along with the message
    if (msgParts.length != 2)
      return <View />

    var msgModel = utils.getModel(msgParts[1]);
    if (!msgModel)
      return <View />;
    msgModel = msgModel.value;
    var vtt = [];
    var cnt = 0;
    var self = this;
    var chatOrg = this.props.to[constants.TYPE] === constants.TYPES.ORGANIZATION  &&  this.props.to[constants.TYPE] + '_' + this.props.to[constants.ROOT_HASH]
    for (var t in  this.props.verificationsToShare) {
      if (t === msgModel.id) {
        var ver = this.props.verificationsToShare[t];
        ver.forEach(function(r) {
          if (chatOrg  &&  utils.getId(r.organization) === chatOrg)
            return
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
    if (!vtt.length)
      return <View />;
    var modelTitle = msgModel.title;
    var idx = modelTitle.indexOf('Verification');
    var docType;
    if (idx === -1)
      docType = modelTitle;
    else
      docType = modelTitle.substring(0, idx) + (modelTitle.length === idx + 12 ? '' : modelTitle.substring(idx + 12))

    var msg = utils.getMe().firstName + ', this is your personal privacy assistant. I see you\'ve already had your ' + docType + ' verified.'
    if (vtt.length === 1)
       msg += ' You can tap below to share it with ';
    else
       msg += ' You can tap on any items in the list below to share them with ';
    msg += this.props.to.organization ? (this.props.to.organization.title + '.') : this.props.to.name;
    var st = [addStyle ? [styles.textContainer, addStyle] : styles.textContainer]
    st.push({borderWidth: 1, borderColor: '#C1DBCE'})
    return (
      <View style={[rowStyle, viewStyle, {width: 330}]}>
        <View style={{width: 30}} />
        <View style={[addStyle ? [styles.textContainer, addStyle] : styles.textContainer]}>
          <View style={{flex: 1}}>
            <View style={{backgroundColor: '#CCE0FF', paddingTop: 5, paddingHorizontal: 7, marginTop: -7, marginHorizontal: -7}}>
              <Text style={{color: '#467E9C'}}>{msg}</Text>
              <View style={[styles.separator, {marginHorizontal: -7}]} />
            </View>
            {vtt}
         </View>
        </View>
      </View>
     );
  }
          // I just sent you a request for {msgModel.title}. {utils.getMe().firstName}, this is your Tradle assistent talking. Tap on one of the items below to share with {isMyMessage ? resource.to.title : resource.from.title}

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
    var resource = this.props.resource;
    var isVerification = resource[constants.TYPE] === 'tradle.Verification';
    if (isVerification)
      resource = resource.document;

    var passProps = {
      resource: resource,
    }
    if (!isVerification)
      passProps.verify = true


    var model = utils.getModel(resource[constants.TYPE]).value;
    var route = {
      id: 5,
      component: MessageView,
      backButtonTitle: 'Back',
      passProps: passProps,
      title: resource[constants.TYPE] == 'tradle.AssetVerification' ? 'Doc verification' : model.title
    }
    if (this.isMyMessage()) {
      route.rightButtonTitle = 'Edit';
      route.onRightButtonPress = {
          title: 'Edit',
          component: NewResource,
          titleTextColor: '#7AAAC3',
          id: 4,
          passProps: {
            resource: resource,
            metadata: model,
            callback: this.props.onSelect,
            resourceKey: model.id + '_' + resource[constants.ROOT_HASH]
          }
      };
    }
    this.props.navigator.push(route);
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
    var isAdditionalInfo = !isSimpleMessage  &&  resource[constants.TYPE] === 'tradle.AdditionalInfo';
    var cnt = 0;
    var isNewProduct, isConfirmation
    var self = this
    viewCols.forEach(function(v) {
      if (properties[v].type === 'array'  ||  properties[v].type === 'date')
        return;
      var style = isSimpleMessage ? styles.resourceTitle : styles.description; //resourceTitle; //(first) ? styles.resourceTitle : styles.description;
      // if (isMyMessage)
      //   style = [style, {justifyContent: 'flex-end', color: isAdditionalInfo ? '#2892C6' : '#ffffff'}];

      if (properties[v].ref) {
        if (resource[v]) {
       //    vCols.push(
       //  <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
       //    <Text style={styles.description}>{properties[v].title}</Text>
       //    <Text style={styles.description} numberOfLines={first ? 2 : 1}>{resource[v].title || resource[v]}</Text>
       // </View>

            // )
          vCols.push(self.getPropRow(properties[v], resource[v].title || resource[v]))
          first = false;
        }
        return;
      }
      if (isMyMessage)
        style = [style, {justifyContent: 'flex-end', color: isAdditionalInfo ? '#2892C6' : '#ffffff'}];

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
        if (isAdditionalInfo)
          style = [style, {paddingBottom: 10, color: '#2892C6'}];
        vCols.push(self.getPropRow(properties[v], val, style))
      }
      else {
        if (!resource[v]  ||  !resource[v].length)
          return
        var msgParts = utils.splitMessage(resource[v]);
        // Case when the needed form was sent along with the message
        if (msgParts.length === 2) {
          var msgModel = utils.getModel(msgParts[1]);
          if (msgModel) {
            if (self.props.verificationsToShare)
              style = isSimpleMessage ? styles.resourceTitle : styles.description;
            msgModel = msgModel.value;
            if (!msgParts[0].length)
              msgParts[0] = 'I just sent you a request for '; // + msgModel.title;
            if (!isMyMessage)
              onPressCall = self.createNewResource.bind(self, msgModel);
            isNewProduct = msgParts[0].length  &&  msgParts[0] === 'application for'

            var color = isMyMessage ? (isNewProduct ? {color: '#7AAAC3', fontWeight: '400', fontSize: 20} : {color: STRUCTURED_MESSAGE_COLOR}) : {color: '#2892C6'}
            var link = isMyMessage
                     ? <Text style={[style, color]}>{msgModel.title}</Text>
                     : <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                         <Text style={[style, {color: isMyMessage ? STRUCTURED_MESSAGE_COLOR : '#2892C6'}]}>{msgModel.title}</Text>
                         <Icon style={styles.linkIcon} size={20} name={'ios-arrow-right'} />
                       </View>

            var msg = isNewProduct
                    ? <View>
                         {link}
                      </View>
                    : <View>
                         <Text style={style}>{msgParts[0]}</Text>
                         {link}
                       </View>
            vCols.push(msg);
            return;
          }
        }
        else
          isConfirmation = resource[v].indexOf('Congratulations!') !== -1
              // <Icon style={{color: '#289427', alignSelf: 'flex-end', marginTop: -10}} size={20} name={'android-done-all'} />
              // <Icon style={[{color: '#289427', alignSelf: 'flex-end', width: 50, height: 50, marginTop: -45, opacity: 0.1}]} size={50} name={'ios-flower'} />
        if (isConfirmation) {
          style = [style, {color: '#289427', fontSize: 16}]
          vCols.push(
            <View>
              <Text style={[style]}>{resource[v]}</Text>
              <Icon style={[{color: '#289427', alignSelf: 'flex-end', width: 50, height: 50, marginTop: -45, opacity: 0.2}]} size={50} name={'ios-flower'} />
              <Icon style={{color: '#289427', alignSelf: 'flex-end', marginTop: -10}} size={20} name={'android-done-all'} />
            </View>
          );

        }
        else
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

      // if (resource.verifications  &&  resource.verifications.length) {
      //   var verifications = [];
      //   resource.verifications.forEach(function(v) {
      //     if (v.organization  &&  v.organization.photo) {
      //       verifications.push(<Text style={styles.verySmallLetters}>{v.organization.title}</Text>);
      //       verifications.push(<Image source={{uri: v.organization.photo}} style={styles.orgImage} />);
      //     }
      //   })
      //   vCols.push(<View style={styles.verificationCheck}>
      //                <Text style={styles.verySmallLetters}>{s}verified by </Text>
      //                {verifications}
      //              </View>);
      // }
      // else
        // var msgTypeStyle = isAdditionalInfo &&  isMyMessage ? [styles.verySmallLetters, {color: '#ffffff'}] : styles.verySmallLetters;
      vCols.push(<Text style={[styles.resourceTitle, {color: '#EBFCFF', fontSize: 18, fontWeight: '600', opacity: 0.3, alignSelf: 'flex-end', marginTop: 10}]}>{s}</Text>);
    }
    if (vCols  &&  vCols.length)
      extend(renderedRow, vCols);
    if (isAdditionalInfo) {
      return isMyMessage ? onPressCall : this.editVerificationRequest.bind(this);
    }
    else {
      var ret = {}
      if (onPressCall)
        ret.onPressCall = onPressCall;
      else if (isSimpleMessage) {
        if (isNewProduct)
          ret.isNewProduct = true
        else if (isConfirmation)
          ret.isConfirmation = true
        else
          return null
      }
      else
        ret.onPressCall = this.props.onSelect;
      return ret
    }
  }
  getPropRow(prop, val) {
    var val = val.length > 22 ? val.substring(0, 22) : val
    var pTitle = (prop.title.length  > 21) ? (val.length === 22 ? prop.title.substring(0, 21) : prop.title.substring(0, 21)) : prop.title
    return (
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={[styles.descriptionW, {color: '#FFFFEE', paddingRight: 3}]}>{pTitle}</Text>
          <Text style={[styles.descriptionW, {fontWeight: '600'}]}>{val}</Text>
       </View>
    )
  }
  // shareDocs() {
  //   this.props.navigator.push({
  //     title: m.title,
  //     titleTextColor: '#7AAAC3',
  //     id: 10,
  //     component: ResourceList,
  //     backButtonTitle: 'Back',
  //     passProps: {
  //       filter:      filter,
  //       prop:        propName,
  //       modelName:   prop.ref,
  //       resource:    resource,
  //       returnRoute: currentRoutes[currentRoutes.length - 1],
  //       callback:    this.setChosenValue.bind(this)
  //     }
  //   });

  // }
  isMyMessage() {
    if (this.props.isAggregation)
      return

    var fromHash = utils.getId(this.props.resource.from);
    var me = utils.getMe()
    if (fromHash == me[constants.TYPE] + '_' + me[constants.ROOT_HASH])
      return true;
  }
  formatDocument(model, verification, onPress) {
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
    }
    var photo = (resource  &&  resource.photos)
              ? <Image source={{uri: utils.getImageUri(resource.photos[0].url)}}  style={styles.cellImage} />
              : <View />;

    var orgRow;
    if (verification.organization) {
      var orgPhoto = verification.organization.photo
                   ? <Image source={{uri: utils.getImageUri(verification.organization.photo)}} style={[styles.orgImage, {marginTop: -5}]} />
                   : <View/>

      orgRow =  onPress
             ? <View />
             : <View style={{flexDirection: 'row', marginTop: 10, justifyContent:'space-between'}}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', padding: 5, borderRadius: 10, borderWidth: 1, borderColor: '#eeeeee', backgroundColor: '#F0F0EE'}}>
                  <Image style={styles.msgImageSmall} source={require('image!Tradle')}></Image>
                  <Text style={{color: '#2E3B4E', fontSize: 14, paddingRight: 5, marginTop: 2}}>Tap</Text>
                </View>
                 <View style={{flexDirection: 'row', justifyContent: 'flex-end', marginTop: 5}}>
                   <Text style={[styles.verySmallLetters]}>verified by </Text>
                   <Text style={[styles.verySmallLetters, {color: '#2E3B4E'}]}>{verification.organization.title.length < 30 ? verification.organization.title : verification.organization.title.substring(0, 27) + '..'}</Text>
                 </View>
               </View>
    }
    else
      orgRow = <View />
    var orgTitle = this.props.to[constants.TYPE] === 'tradle.Organization'
                 ? this.props.to.name
                 : (this.props.to.organization ? this.props.to.organization.title : null);
    var verifiedBy = verification.organization ? verification.organization.title : ''
    return (
           <TouchableHighlight underlayColor='transparent' onPress={onPress ? onPress : () =>
              AlertIOS.alert(
                'Sharing ' + docTitle + ' verified by ' + verifiedBy,
                'with ' + orgTitle,
                [
                  {text: 'Share', onPress: this.props.share.bind(this, verification.document, this.props.to)},
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

    if (resource[constants.TYPE] != model.id)
      return;
    // var model = utils.getModel(resource[constants.TYPE] || resource.id).value;

    var properties = model.properties;
    var noMessage = !resource.message  ||  !resource.message.length;
    var onPressCall;

    var isSimpleMessage = model.id === 'tradle.SimpleMessage';

    viewCols.forEach(function(v) {
      if (properties[v].type === 'array'  ||  properties[v].type === 'date')
        return;
      var style = styles.verySmallLetters; //(first) ? styles.resourceTitle : styles.description;

      var pTitle = properties[v].title.length > 25 ? properties[v].title.substring(0, 25) + '...' : properties[v].title
      if (properties[v].ref) {
        if (resource[v]) {
          var val
          if (properties[v].type === 'object') {
            if (properties[v].ref) {
              if (properties[v].ref === 'tradle.Money')
                val = '£' + resource[v]
              else {
                var m = utils.getModel(properties[v].ref).value
                if (m.subClassOf  &&  m.subClassOf == 'tradle.Enum') {
                  if (resource[v].title  &&  (resource[v].title.length > 20 || resource[v].length > 20)) {
                    val = resource[v].title.substring(0, 20)
                    if (pTitle.length > 15)
                      pTitle = pTitle.substring(0, 15)
                  }
                }
              }
            }
          }
          if (!val)
            val = resource[v].title
          var st = {flexDirection: 'row', justifyContent: 'space-between'}
          vCols.push(
            <View style={st}>
              <Text style={[style, {color: '#555555'}]} numberOfLines={first ? 2 : 1}>{pTitle}</Text>
              <Text style={style}> {val}</Text>
            </View>);
          first = false;
        }
        return;
      }
      var row
      if (resource[v]  &&  properties[v].type === 'string'  &&  (resource[v].indexOf('http://') == 0  ||  resource[v].indexOf('https://') == 0))
        row = <Text style={style} numberOfLines={first ? 2 : 1}>{resource[v]}</Text>;
      else if (!model.autoCreate) {
        var val = (properties[v].displayAs)
                ? utils.templateIt(properties[v], resource)
                : resource[v];
        row = <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={[style, {color: '#555555'}]} numberOfLines={first ? 2 : 1}>{pTitle}</Text>
                <Text style={style} numberOfLines={first ? 2 : 1}>{val}</Text>
              </View>
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
                         <Text style={[style, {color: isMyMessage ? STRUCTURED_MESSAGE_COLOR : '#7AAAC3'}]}>{msgModel.value.title}</Text>
                       </View>);
            return;
          }
        }
        row = <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={[style, {color: '#555555'}]} numberOfLines={first ? 2 : 1}>{pTitle}</Text>
                <Text style={style}>{resource[v]}</Text>;
              </View>
      }
      if (first) {
        row = <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <View>
                  {row}
                </View>
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
  myCell: {
    paddingVertical: 5,
    paddingHorizontal: 7,
    justifyContent: 'flex-end',
    borderRadius: 10,
    backgroundColor: '#569bff',
  },
  myAdCell: {
    paddingVertical: 5,
    paddingHorizontal: 7,
    justifyContent: 'flex-end',
    // backgroundColor: '#7AAAC3',
  },
  myConfCell: {
    paddingVertical: 5,
    paddingHorizontal: 7,
    justifyContent: 'flex-end',
    borderRadius: 10,
  },
  warnImage: {
    backgroundColor: '#dddddd',
    height: 45,
    marginRight: 5,
    width: 45,
    borderRadius: 10,
    borderColor: '#cccccc',
    borderWidth: 1
  },
  msgImageSmall: {
    // backgroundColor: '#dddddd',
    height: 20,
    marginRight: 5,
    width: 20,
    // borderRadius: 10,
    // borderColor: '#cccccc',
    // borderWidth: 1
  },
  msgImage: {
    backgroundColor: '#dddddd',
    height: 30,
    marginRight: 3,
    marginLeft: -5,
    width: 30,
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
    width: 270,
    height: 200,
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
    width: 88,
    height: 88,
    margin: 1,
    borderRadius: 10
  },
  // ownerImage: {
  //   backgroundColor: '#dddddd',
  //   height: 30,
  //   width: 30,
  //   marginTop: -5,
  //   position: 'absolute',
  //   right: 10,
  //   borderRadius: 15,
  //   borderColor: '#cccccc',
  //   borderWidth: 1
  // },
  verifications: {
    fontSize: 12,
    // backgroundColor: '#efffe5'
  },
  verySmallLetters: {
    fontSize: 12,
    alignSelf: 'flex-end',
    color: '#757575'
    // color: '#b4c3cb'
  },
  orgImage: {
    width: 20,
    height: 20,
    // marginLeft: 5,
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
    // marginRight: 10,
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
  verificationIcon: {
    width: 20,
    height: 20,
    color: '#ffffff',
    // marginRight: -10
  },
  linkIcon: {
    width: 20,
    height: 20,
    color: '#2892C6'
  },
  // icon: {
  //   width: 20,
  //   height: 20,
  //   marginLeft: 4,
  //   borderWidth: 1,
  //   borderColor: '#eeeeee',
  //   borderRadius: 10,
  //   marginRight: 5,
  // },
  description: {
    // flexWrap: 'wrap',
    color: '#757575',
    fontSize: 14,
  },
  descriptionW: {
    // flexWrap: 'wrap',
    color: '#ffffff',
    fontSize: 14,
  },
  separator: {
    height: 0.5,
    marginTop: 5,
    backgroundColor: '#cccccc',
    flex: 40
  }
});
reactMixin(MessageRow.prototype, RowMixin);

module.exports = MessageRow;
