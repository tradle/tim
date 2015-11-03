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
var STRUCTURED_MESSAGE_COLOR = '#F6FFF0';
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
    if (!this.props.isAggregation) {
      var fromHash = utils.getId(resource.from);
      if (fromHash == me[constants.TYPE] + '_' + me[constants.ROOT_HASH])
        isMyMessage = true;
    }
    this.state = { isMyMessage: isMyMessage };
  }
  render() {
    var resource = this.props.resource;
    var model = utils.getModel(resource[constants.TYPE] || resource.id).value;
    var me = utils.getMe();
    var isMyMessage = this.state.isMyMessage;
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
    var isNewProduct
    var isVerification = resource[constants.TYPE] === 'tradle.Verification';
    if (isVerification)
      onPressCall = this.props.onSelect;
    else {
      var ret = this.formatRow(isMyMessage, model, resource, renderedRow);
      onPressCall = ret ? ret.onPressCall : null
      isNewProduct = ret ? ret.isNewProduct : null
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
        if (!model.style)
          addStyle = {paddingVertical: 5, paddingHorizontal: 7, borderRadius: 10, borderColor: '#cccccc', backgroundColor: '#ffffff', marginVertical: 2};
      }
      if (model.style  ||  isVerification)
        addStyle = [addStyle, {paddingVertical: 5, paddingHorizontal: 7, borderRadius: 10, backgroundColor: STRUCTURED_MESSAGE_COLOR, borderWidth: 1, borderColor: '#deeeb4', marginVertical: 2}]; //model.style];
      else if (isAdditionalInfo)
        addStyle = [addStyle, {paddingVertical: 5, paddingHorizontal: 7, borderRadius: 10, backgroundColor: '#FCF1ED', borderWidth: 1, borderColor: '#FAE9E3', marginVertical: 2}]; //model.style];
      else {
        if (isMyMessage  &&  !isSimpleMessage)
          addStyle = [addStyle, {paddingVertical: 5, paddingHorizontal: 7, borderRadius: 10, backgroundColor: STRUCTURED_MESSAGE_COLOR, borderWidth: 1, borderColor: '#deeeb4', marginVertical: 2}]; //model.style];
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
            viewStyle.width = isMyMessage || !hasOwnerPhoto ? 250 : 280;
        }
      }
      if (!isSimpleMessage)
        viewStyle.width = isMyMessage || !hasOwnerPhoto ? 250 : 280;
      if (isVerification) {
        var msgModel = utils.getModel(resource.document[constants.TYPE]).value;
        var orgName = resource.organization  ? resource.organization.title : ''
        renderedRow = <View>
                        <View style={{backgroundColor: '#289427', paddingVertical: 5, paddingHorizontal: 7, marginHorizontal: -6, marginTop: -5}}>
                          <Text style={{fontSize: 16, fontWeight: '600', color: '#ffffff', alignSelf: 'center'}}>
                             Verified by {orgName}
                          </Text>
                        </View>
                        <View style={{paddingTop: 5}}>
                          {this.formatDocument(msgModel, resource, this.verify.bind(this))}
                        </View>
                        <View style={{paddingTop: 5}}>
                          <Text style={styles.verySmallLetters}>{msgModel.title}</Text>
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
    var ownerPhoto = <Image style={styles.msgImage} source={require('image!happyLock')}></Image>;
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

    return (
      <View style={[rowStyle, viewStyle, {width: 280}]}>
        {ownerPhoto}
        <View style={addStyle ? [styles.textContainer, addStyle] : styles.textContainer}>
          <View style={{flex: 1}}>
            <View style={{backgroundColor: STRUCTURED_MESSAGE_COLOR, paddingVertical: 5, paddingHorizontal: 7, margin: -5}}>
              <Text style={{color: '#2E3B4E'}}>
                {msg}
              </Text>
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
    if (this.state.isMyMessage) {
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
    var isNewProduct
    viewCols.forEach(function(v) {
      if (properties[v].type === 'array'  ||  properties[v].type === 'date')
        return;
      var style = styles.resourceTitle; //(first) ? styles.resourceTitle : styles.description;
      if (isMyMessage) {
        style = [style, {justifyContent: 'flex-end'}];
        if (isSimpleMessage)
          style.push({color: '#ffffff'});
        else if (isAdditionalInfo)
          style.push({color: '#2892C6'});
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
        if (isAdditionalInfo)
          style = [style, {paddingBottom: 10, color: '#2892C6'}];
        vCols.push(<Text style={style} numberOfLines={first ? 2 : 1}>{val}</Text>)
      }
      else {
        if (!resource[v]  ||  !resource[v].length)
          return;
        var msgParts = utils.splitMessage(resource[v]);
        // Case when the needed form was sent along with the message
        if (msgParts.length === 2) {
          var msgModel = utils.getModel(msgParts[1]);
          if (msgModel) {
            if (self.props.verificationsToShare)
              style = styles.description;
            msgModel = msgModel.value;
            if (!msgParts[0].length)
              msgParts[0] = 'I just sent you a request for '; // + msgModel.title;
            if (!isMyMessage)
              onPressCall = self.createNewResource.bind(self, msgModel);
            isNewProduct = msgParts[0].length  &&  msgParts[0] === 'application for'
            var color = isMyMessage ? (isNewProduct ? {color: 'red', fontWeight: '400', fontSize: 20} : {color: STRUCTURED_MESSAGE_COLOR}) : {color: '#2892C6'}
            var link = isMyMessage
                     ? <Text style={[style, color]}>{msgModel.title}</Text>
                     : <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                         <Text style={[style, {color: isMyMessage ? STRUCTURED_MESSAGE_COLOR : '#2892C6'}]}>{msgModel.title}</Text>
                         <Icon style={styles.linkIcon} size={20} name={'ios-arrow-right'} />
                       </View>

            var msg = isNewProduct
                    ? <View style={{color: '#ffffff'}}>
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
        vCols.push(<Text style={style}>{resource[v]}</Text>);
      }
      first = false;

    });
                  // <View>
                  //   <View style={{flexDirection: 'row'}}>
                  //     <View style={styles.separator} />
                  //     <View style={{flex:20, marginLeft: 10, marginRight: -10, alignSelf: 'center'}}>
                  //       <Text style={styles.verifications}>OR</Text>
                  //     </View>
                  //     <View style={styles.separator} />
                  //     {orgRow}
                  //   </View>
                  //   <View style={{alignSelf: 'center'}}><Text style={[styles.verySmallLetters, {marginTop: -3, paddingBottom:10}]}>Choose from the ones below</Text></View>
                  //   {vtt}
                  // </View>

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
      vCols.push(<Text style={styles.verySmallLetters}>{s}</Text>);
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
        else
          return null
      }
      else
        ret.onPressCall = this.props.onSelect;
      return ret
    }
  }
  // share() {
  //   console.log('Share')
  //   Actions.share(this.props.resource, this.props.to)
  // }
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
             : <View style={{flexDirection: 'row', justifyContent: 'flex-end', marginTop: 5}}>
                   <Text style={styles.verySmallLetters}>verified by </Text>
                   <Text style={[styles.verySmallLetters, {color: '#289427'}]}>{verification.organization.title.length < 10 ? verification.organization.title : verification.organization.title.substring(0, 8) + '..'}</Text>
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
    var verPhoto;
    var vCols = [];
    var first = true;
    var self = this;
    // var model = utils.getModel(resource[constants.TYPE] || resource.id).value;

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
                         <Text style={[style, {color: isMyMessage ? STRUCTURED_MESSAGE_COLOR : '#7AAAC3'}]}>{msgModel.value.title}</Text>
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
    borderRadius: 10,
    // backgroundColor: '#ffffff',
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
    backgroundColor: '#dddddd',
    height: 25,
    marginRight: 5,
    width: 25,
    borderRadius: 12,
    borderColor: '#cccccc',
    borderWidth: 1
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
  separator: {
    height: 0.5,
    marginTop: 5,
    backgroundColor: '#cccccc',
    flex: 40
  }
});
reactMixin(MessageRow.prototype, RowMixin);

module.exports = MessageRow;
