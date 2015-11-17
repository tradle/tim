'use strict'

var React = require('react-native');
var ArticleView = require('../Components/ArticleView');
var IdentitiesList = require('../Components/IdentitiesList');
var SelectPhotoList = require('../Components/SelectPhotoList');
var PhotoCarousel = require('../Components/PhotoCarousel');
var utils = require('../utils/utils');
var constants = require('tradle-constants');
var Icon = require('react-native-vector-icons/Ionicons');
var extend = require('xtend/mutable')

var {
  View,
  Text,
  StyleSheet,
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
    case 'ResourceView':
      return this.getResourceViewRoute(route)
    case 'MessageList':
      return this.getMessageListRoute(route)
    case 'MessageView':
      return this.getMessageViewRoute(route)
    case 'NewResource':
      return this.getNewResourceRoute(route)
    case 'NewItem':
      return this.getNewItemRoute(route)
    case 'ProductChooser':
      return this.getProductChooserRoute(route)
    case 'ResourceTypesScreen':
      return this.getResourceTypesScreen(route)
    case 'QRCodeScanner':
      return this.getQRCodeScannerRoute(route)
    case 'QRCode':
      return this.getQRCodeRoute(route)
    case 'ArticleView':
      return this.getArticleViewRoute(route)
    }
  },
  getHomeRoute() {
    var TimHome = require('../Components/TimHome')
    return {
      getSceneClass() {
        return TimHome;
      },
      // showNavigationBar: false,
      renderScene(navigator) {
        return <TimHome navigator={navigator} modelName={constants.TYPES.IDENTITY} />;
      },
      // renderTitle() {
      //   return (
      //     <View style={{height: 70, width: 500, marginTop: -20, backgroundColor: '#2E3B4E'}}>
      //     </View>
      //   );
      // },
    }
  },

  getResourceListRoute(route) {
    var ResourceList = require('../Components/ResourceList')
    return extend(defaultRouteConfig(route), {
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
    })
  },

  getMessageListRoute(route) {
    var MessageList = require('../Components/MessageList')
    return extend(defaultRouteConfig(route), {
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
    })

  },
  getProductChooserRoute(route) {
    var ProductChooser = require('../Components/ProductChooser')
    return extend(defaultRouteConfig(route), {
      getSceneClass() {
        return ProductChooser;
      },
      renderScene(navigator) {
        var props = route.passProps
        return <ProductChooser navigator={navigator}
                  resource={props.resource}
                  returnRoute={props.returnRoute}
                  callback={props.callback} />;
      },
      renderRightButton(navigator) {
        if (!route.rightButtonTitle)
          return <View />

        return (
          <TouchableOpacity
            touchRetentionOffset={ExNavigator.Styles.barButtonTouchRetentionOffset}
            onPress={() => navigator.push(MyRouter.getRoute(route.onRightButtonPress))}>
            <View style={{marginRight: 10, marginTop: 8}}>
              <Icon name='plus'  size={22}  color='#7AAAC3'  style={styles.icon}/>
            </View>
          </TouchableOpacity>
        );
      },

      configureScene() {
        return ExNavigator.SceneConfigs.FloatFromBottom;
      }
    })
  },
  getResourceTypesScreenRoute(route) {
    var ResourceTypesScreen = require('../Components/ResourceTypesScreen')
    return extend(defaultRouteConfig(route), {
      getSceneClass() {
        return ResourceTypesScreen;
      },
      renderScene(navigator) {
        var props = route.passProps
        return <ResourceTypesScreen navigator={navigator}
                  resource={props.resource}
                  returnRoute={props.returnRoute}
                  callback={props.callback} />;
      },
      renderRightButton(navigator) {
        if (!route.rightButtonTitle)
          return <View />

        return (
          <TouchableOpacity
            touchRetentionOffset={ExNavigator.Styles.barButtonTouchRetentionOffset}
            onPress={() => navigator.push(MyRouter.getRoute(route.onRightButtonPress))}>
            <View style={{marginRight: 10, marginTop: 8}}>
              <Icon name='plus'  size={22}  color='#7AAAC3'  style={styles.icon}/>
            </View>
          </TouchableOpacity>
        );
      },

      configureScene() {
        return ExNavigator.SceneConfigs.FloatFromBottom;
      }
    })

  },
  getResourceViewRoute(route) {
    var ResourceView = require('../Components/ResourceView')
    return extend(defaultRouteConfig(route), {
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
    })
  },
  getMessageViewRoute(route) {
    var MessageView = require('../Components/MessageView')
    return extend(defaultRouteConfig(route), {
      getSceneClass() {
        return MessageView;
      },
      renderScene(navigator) {
        var props = route.passProps
        return <MessageView navigator={navigator}
                    resource={props.resource}
                    verify={props.verify} />;
      },
    })
  },
  getNewResourceRoute(route) {
    var NewResource = require('../Components/NewResource')
    return extend(defaultRouteConfig(route), {
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
    })
  },
  getNewItemRoute(route) {
    var NewItem = require('../Components/NewItem')
    return extend(defaultRouteConfig(route), {
      getSceneClass() {
        return NewItem;
      },
      renderScene(navigator) {
        var props = route.passProps
      return <NewItem navigator={navigator}
                  resource={props.resource}
                  metadata={props.metadata}
                  onAddItem={props.onAddItem}
                  chooser={props.chooser}
                  template={props.template}
                  parentMeta={props.parentMeta}    />
      },
    })
  },

  getQRCodeScannerRoute(route) {
    var QRCodeScanner = require('../Components/QRCodeScanner')
    return extend(defaultRouteConfig(route), {
      getSceneClass() {
        return QRCodeScanner;
      },
      renderScene(navigator) {
        var props = route.passProps
        return <QRCodeScanner navigator={navigator}
                onread={props.onread} />
      },
    })
  },
  getQRCodeRoute(route) {
    var QRCode = require('../Components/QRCode')
    return extend(defaultRouteConfig(route), {
      getSceneClass() {
        return QRCode;
      },
      renderScene(navigator) {
        var props = route.passProps
        return <QRCode navigator={navigator}
                content={props.content}
                fullScreen={props.fullScreen}
                dimension={props.dimension} />
      },
    })
  },
  getArticleViewRoute(route) {
    var ArticleView = require('../Components/ArticleView')
    return extend(defaultRouteConfig(route), {
      getSceneClass() {
        return ArticleView;
      },
      renderScene(navigator) {
        var props = route.passProps
        return <ArticleView navigator={navigator} url={props.url} />;
      },
    })

  }

}

function defaultRouteConfig (route) {
  return {
    getTitle() {
      return route ? route.title : null
    },
    renderTitle() {
      return (
        <Text style={{color: '#555555', fontSize: 16, marginTop: 8}}>{route.title}</Text>
      );
    },
    renderLeftButton(navigator) {
      return (
        <TouchableOpacity
          touchRetentionOffset={ExNavigator.Styles.barButtonTouchRetentionOffset}
          onPress={() => navigator.pop()}>
          <View style={{marginLeft: 10, marginTop: 8}}>
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
          <View style={{marginRight: 10, marginTop: 8}}>
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

var styles = StyleSheet.create({
  icon: {
    width: 22,
    height: 22,
    color: '#7AAAC3'
  }
})
module.exports = MyRouter;