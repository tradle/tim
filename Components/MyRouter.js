'use strict'

var React = require('react-native');
var ResourceList = require('../Components/ResourceList');
var TimHome = require('../Components/TimHome');
var ResourceTypesScreen = require('../Components/ResourceTypesScreen');
var NewResource = require('../Components/NewResource');
var NewItem = require('../Components/NewItem');
var ResourceView = require('../Components/ResourceView');
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


var MyRouter = {
  getHomeRoute() {
    return {
      getSceneClass() {
        return require('./Components/TimHome');
      },
      renderScene() {
        return <TimHome navigator={navigator} modelName={constants.TYPES.IDENTITY} />;
      },
      // configureScene() {
      //   return ExNavigator.SceneConfigs.FloatFromRight;
      // },
    }

  },

  getResourceListRoute(route) {
    return {
      getSceneClass() {
        return require('./Components/ResourceList');
      },
      renderScene() {
        var props = route.passProps
        return <ResourceList navigator={nav}
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

      // configureScene() {
      //   return ExNavigator.SceneConfigs.FloatFromRight;
      // },
    }

  }

}

module.exports = MyRouter;