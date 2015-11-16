'use strict'

var React = require('react-native');
var ResourceTypesScreen = require('../Components/ResourceTypesScreen');
var NewItem = require('../Components/NewItem');
var MessageView = require('../Components/MessageView');
var MessageList = require('../Components/MessageList');
var ArticleView = require('../Components/ArticleView');
var IdentitiesList = require('../Components/IdentitiesList');
var SelectPhotoList = require('../Components/SelectPhotoList');
var ProductChooser = require('../Components/ProductChooser')
var PhotoCarousel = require('../Components/PhotoCarousel');
var QRCode = require('../Components/QRCode')
var QRCodeScanner = require('../Components/QRCodeScanner')
var utils = require('../utils/utils');
var constants = require('tradle-constants');

var {
  View,
  Text,
  TouchableOpacity
} = React

import ExNavigator from '@exponent/react-native-navigator'

var MyRouter = {
  getRoute(route) {
    var viewName = route.routeName
    switch (viewName) {
      case 'TimHome':
        return this.getHomeRoute(route)
      case 'ResourceList':
        return this.getResourceListRoute(route)
      case 'MessageList':
        return this.getMessageListRoute(route)
      case 'ResourceView':
        return this.getResourceViewRoute(route)
      case 'NewResource':
        return this.getNewResourceRoute(route)
    }
  },
  getHomeRoute() {
    var TimHome = require('../Components/TimHome')
    return {
      getSceneClass() {
        return TimHome;
      },
      renderScene(navigator) {
        return <TimHome navigator={navigator} modelName={constants.TYPES.IDENTITY} />;
      },
      configureScene() {
        return ExNavigator.SceneConfigs.FloatFromRight;
      },
      renderTitle() {
        return null
      },
      renderTitle() {
        return (
          <View style={{height: 70, width: 500, marginTop: -20, backgroundColor: '#2E3B4E'}}>
          </View>
        );
      },
    }

  },

  getResourceListRoute(route) {
    var ResourceList = require('../Components/ResourceList')
    return {
      getSceneClass() {
        return ResourceList;
      },
      renderScene(navigator) {
        var props = route.passProps
        return <ResourceList navigator={navigator}
                    filter={props.filter}
                    resource={props.resource}
                    prop={props.prop}
                    returnRoute={props.returnRoute}
                    callback={props.callback}
                    isAggregation={props.isAggregation}
                    isRegistration={props.isRegistration}
                    sortProperty={props.sortProperty}
                    modelName={props.modelName} />;
      },
      getTitle() {
        return route.title
      },
      renderTitle() {
        return (
          <Text style={{color: '#555555', fontSize: 18, marginTop: 15}}>{route.title}</Text>
        );
      },
      renderLeftButton(navigator) {
        return (
          <TouchableOpacity
            touchRetentionOffset={ExNavigator.Styles.barButtonTouchRetentionOffset}
            onPress={() => navigator.pop()}>
            <View style={{marginLeft: 20, marginTop: 17}}>
              <Text style={{color: '#7AAAC3', fontSize: 16}}>{route.backButtonTitle || 'Back'}</Text>
            </View>
          </TouchableOpacity>
        );
      },

      renderRightButton(navigator) {
        if (!route.rightButtonTitle)
          return <View />
        var self = this
        return (
          <TouchableOpacity
            touchRetentionOffset={ExNavigator.Styles.barButtonTouchRetentionOffset}
            onPress={() =>
              navigator.push(MyRouter.getRoute(route.onRightButtonPress))
            }>
            <View style={{marginRight: 20, marginTop: 17}}>
              <Text style={{color: '#7AAAC3', fontSize: 16}}>{route.rightButtonTitle || ''}</Text>
            </View>
          </TouchableOpacity>
        );
      },

      // renderLeftButton(navigator) {
      //   return (
      //     <TouchableOpacity
      //       touchRetentionOffset={ExNavigator.Styles.barButtonTouchRetentionOffset}
      //       onPress={() => navigator.push(getSettingsRoute())}
      //       style={ExNavigator.Styles.barLeftButton}>
      //       <Text style={ExNavigator.Styles.barLeftButtonText}>Settings</Text>
      //     </TouchableOpacity>
      //   );
      // },

      // renderRightButton(navigator) {
      //   return (
      //     <TouchableOpacity
      //       touchRetentionOffset={ExNavigator.Styles.barButtonTouchRetentionOffset}
      //       onPress={() => navigator.push(getHelpRoute())}
      //       style={ExNavigator.Styles.barRightButton}>
      //       <Text style={ExNavigator.Styles.barRightButtonText}>Help</Text>
      //     </TouchableOpacity>
      //   );
      // },

      configureScene() {
        return ExNavigator.SceneConfigs.FloatFromRight;
      }
    }

  },
  getMessageListRoute(route) {
    var MessageList = require('../Components/MessageList')
    return {
      getSceneClass() {
        return MessageList;
      },
      renderScene(navigator) {
        var props = route.passProps
        return <MessageList navigator={navigator}
                    filter={props.filter}
                    resource={props.resource}
                    prop={props.prop}
                    returnRoute={props.returnRoute}
                    callback={props.callback}
                    isAggregation={props.isAggregation}
                    modelName={props.modelName} />;
      },
      getTitle() {
        return route.title
      },
      renderTitle() {
        return (
          <Text style={{color: '#555555', fontSize: 18, marginTop: 15}}>{route.title}</Text>
        );
      },
      renderLeftButton(navigator) {
        return (
          <TouchableOpacity
            touchRetentionOffset={ExNavigator.Styles.barButtonTouchRetentionOffset}
            onPress={() => navigator.pop()}>
            <View style={{marginLeft: 20, marginTop: 17}}>
              <Text style={{color: '#7AAAC3', fontSize: 16}}>{route.backButtonTitle || 'Back'}</Text>
            </View>
          </TouchableOpacity>
        );
      },

      renderRightButton(navigator) {
        if (!route.rightButtonTitle)
          return <View />
        var self = this
        return (
          <TouchableOpacity
            touchRetentionOffset={ExNavigator.Styles.barButtonTouchRetentionOffset}
            onPress={() =>
              navigator.push(MyRouter.getRoute(route.onRightButtonPress))
            }>
            <View style={{marginRight: 20, marginTop: 17}}>
              <Text style={{color: '#7AAAC3', fontSize: 16}}>{route.rightButtonTitle || ''}</Text>
            </View>
          </TouchableOpacity>
        );
      },

      // renderLeftButton(navigator) {
      //   return (
      //     <TouchableOpacity
      //       touchRetentionOffset={ExNavigator.Styles.barButtonTouchRetentionOffset}
      //       onPress={() => navigator.push(getSettingsRoute())}
      //       style={ExNavigator.Styles.barLeftButton}>
      //       <Text style={ExNavigator.Styles.barLeftButtonText}>Settings</Text>
      //     </TouchableOpacity>
      //   );
      // },

      // renderRightButton(navigator) {
      //   return (
      //     <TouchableOpacity
      //       touchRetentionOffset={ExNavigator.Styles.barButtonTouchRetentionOffset}
      //       onPress={() => navigator.push(getHelpRoute())}
      //       style={ExNavigator.Styles.barRightButton}>
      //       <Text style={ExNavigator.Styles.barRightButtonText}>Help</Text>
      //     </TouchableOpacity>
      //   );
      // },

      configureScene() {
        return ExNavigator.SceneConfigs.FloatFromRight;
      }
    }

  },
  getResourceViewRoute(route) {
    var ResourceView = require('../Components/ResourceView')
    return {
      getSceneClass() {
        return ResourceView;
      },
      renderScene(navigator) {
        var props = route.passProps
        return <ResourceView navigator={navigator}
                    resource={props.resource}
                    prop={props.prop}
                    verify={props.verify} />;
      },
      getTitle() {
        return route.title
      },
      renderTitle() {
        return (
          <Text style={{color: '#555555', fontSize: 18, marginTop: 15}}>{route.title}</Text>
        );
      },
      renderLeftButton(navigator) {
        return (
          <TouchableOpacity
            touchRetentionOffset={ExNavigator.Styles.barButtonTouchRetentionOffset}
            onPress={() => navigator.pop()}>
            <View style={{marginLeft: 20, marginTop: 17}}>
              <Text style={{color: '#7AAAC3', fontSize: 16}}>{route.backButtonTitle || 'Back'}</Text>
            </View>
          </TouchableOpacity>
        );
      },

      renderRightButton(navigator) {
        if (!route.rightButtonTitle)
          return <View />

        return (
          <TouchableOpacity
            touchRetentionOffset={ExNavigator.Styles.barButtonTouchRetentionOffset}
            onPress={() => navigator.push(MyRouter.getRoute(route.onRightButtonPress))}>
            <View style={{marginRight: 20, marginTop: 17}}>
              <Text style={{color: '#7AAAC3', fontSize: 16}}>{route.rightButtonTitle || ''}</Text>
            </View>
          </TouchableOpacity>
        );
      },


      configureScene() {
        return ExNavigator.SceneConfigs.FloatFromRight;
      }
    }

  },
  getNewResourceRoute(route) {
    var NewResource = require('../Components/NewResource')
    return {
      getSceneClass() {
        return NewResource;
      },
      renderScene(navigator) {
        var props = route.passProps
      return <NewResource navigator={navigator}
                  resource={props.resource}
                  model={props.model}
                  editCols={props.editCols}
                  additionalInfo={props.additionalInfo}
                  returnRoute={props.returnRoute}
                  callback={props.callback} />;
      },
      getTitle() {
        return route.title
      },
      renderTitle() {
        return (
          <Text style={{color: '#555555', fontSize: 18, marginTop: 15}}>{route.title}</Text>
        );
      },
      renderLeftButton(navigator) {
        return (
          <TouchableOpacity
            touchRetentionOffset={ExNavigator.Styles.barButtonTouchRetentionOffset}
            onPress={() => navigator.pop()}>
            <View style={{marginLeft: 20, marginTop: 17}}>
              <Text style={{color: '#7AAAC3', fontSize: 16}}>{route.backButtonTitle || 'Back'}</Text>
            </View>
          </TouchableOpacity>
        );
      },

      renderRightButton(navigator) {
        if (!route.rightButtonTitle)
          return <View />

        return (
          <TouchableOpacity
            touchRetentionOffset={ExNavigator.Styles.barButtonTouchRetentionOffset}
            onPress={() => navigator.push(MyRouter.getRoute(route.onRightButtonPress))}>
            <View style={{marginRight: 20, marginTop: 17}}>
              <Text style={{color: '#7AAAC3', fontSize: 16}}>{route.rightButtonTitle || ''}</Text>
            </View>
          </TouchableOpacity>
        );
      },


      configureScene() {
        return ExNavigator.SceneConfigs.FloatFromRight;
      }
    }
  }
}

module.exports = MyRouter;