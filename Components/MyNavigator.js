'use strict'

import React, {Component} from 'react'
import {
  NavigationExperimental
} from 'react-native'

const {
  CardStack: NavigationCardStack,
  StateUtils: NavigationStateUtils,
  Header: NavigationHeader,
} = NavigationExperimental
const NavigationHeaderBackButton = require('NavigationHeaderBackButton');

var ResourceList = require('./Components/ResourceList');
var VideoPlayer = require('./Components/VideoPlayer')
var EnumList = require('./Components/EnumList')
var TimHome = require('./Components/TimHome');
var PasswordCheck = require('./Components/PasswordCheck');
var TouchIDOptIn = require('./Components/TouchIDOptIn');
var NewResource = require('./Components/NewResource');
var NewItem = require('./Components/NewItem');
var ItemsList = require('./Components/ItemsList')
var GridItemsList = require('./Components/GridItemsList')
var ResourceView = require('./Components/ResourceView');
var MessageView = require('./Components/MessageView');
var MessageList = require('./Components/MessageList');
var ArticleView = require('./Components/ArticleView');
var IdentitiesList = require('./Components/IdentitiesList');
var ProductChooser = require('./Components/ProductChooser')
var CameraView = require('./Components/CameraView');
var PhotoCarousel = require('./Components/PhotoCarousel');
var QRCode = require('./Components/QRCode')
var QRCodeScanner = require('./Components/QRCodeScanner')

class MyNavigator extends Component {

  // This sets up the methods (e.g. Pop, Push) for navigation.
  constructor(props, context) {
    super(props, context);

    this._onPushRoute = this.props.onNavigationChange.bind(null, 'push');
    this._onPopRoute = this.props.onNavigationChange.bind(null, 'pop');

    this._renderScene = this._renderScene.bind(this);
    this._renderOverlay = this._renderOverlay.bind(this)
  }

  // Now we finally get to use the `NavigationCardStack` to render the scenes.
  render() {
    return (
      <NavigationCardStack
        onNavigateBack={this._onPopRoute}
        navigationState={this.props.navigationState}
        renderScene={this._renderScene}
        renderOverlay={this._renderOverlay}
        style={styles.navigator}
      />
    );
  }

  // Render a scene for route.
  // The detailed spec of `sceneProps` is defined at `NavigationTypeDefinition`
  // as type `NavigationSceneRendererProps`.
  // Here you could choose to render a different component for each route, but
  // we'll keep it simple.
  /*
  _renderScene(sceneProps) {
    return (
      <MyVeryComplexScene
        route={sceneProps.scene.route}
        onPushRoute={this._onPushRoute}
        onPopRoute={this._onPopRoute}
        onExit={this.props.onExit}
      />
    );
  }
*/
  _renderScene(props) {
    if (__DEV__) {
      let displayName = props.scene.route.title
      if (!displayName)
        displayName = props.scene.route.key
      debug('navigating to ' + displayName)
    }

    // var props = route.passProps;
    // if (!this.state.navigator) {
    //   this._navListeners = [
    //     nav.navigationContext.addListener('willfocus', this.onNavigatorBeforeTransition),
    //     nav.navigationContext.addListener('didfocus', this.onNavigatorAfterTransition)
    //   ]

    //   this.state.navigator = nav;
    // }
    switch (props.scene.route.key) {
    case 'TimHome':
      return <TimHome route={props.scene.route} onPushRoute={this._onPushRoute} onPopRoute={this._onPopRoute} />
    case 'ResourceTypesScreen':
      return <ResourceTypesScreen route={props.scene.route} onPushRoute={this._onPushRoute} onPopRoute={this._onPopRoute} />
    case 'ResourceView':
      return <ResourceView route={props.scene.route} onPushRoute={this._onPushRoute} onPopRoute={this._onPopRoute} />
    case 'NewResource':
      return <NewResource route={props.scene.route} onPushRoute={this._onPushRoute} onPopRoute={this._onPopRoute} />
    case 'MessageView':
      return <MessageView route={props.scene.route} onPushRoute={this._onPushRoute} onPopRoute={this._onPopRoute} />
    case 'NewItem':
      return <NewItem route={props.scene.route} onPushRoute={this._onPushRoute} onPopRoute={this._onPopRoute} />
    case 'ArticleView':
      return <ArticleView route={props.scene.route} onPushRoute={this._onPushRoute} onPopRoute={this._onPopRoute} />
    case 'IdentitiesList':
      return <IdentitiesList route={props.scene.route} onPushRoute={this._onPushRoute} onPopRoute={this._onPopRoute} />
    case 'ItemsList':
      return <ItemsList route={props.scene.route} onPushRoute={this._onPushRoute} onPopRoute={this._onPopRoute} />
    case 'MessageList':
      return <MessageList route={props.scene.route} onPushRoute={this._onPushRoute} onPopRoute={this._onPopRoute} />
    case 'CameraView':
      return <CameraView route={props.scene.route} onPushRoute={this._onPushRoute} onPopRoute={this._onPopRoute} />
    // case 13:
    //   return <SelectPhotoList
    //             metadata={props.metadata}
    //             style={styles.style}
    //             navigator={props.navigator}
    //             onSelect={props.onSelect}
    //             onSelectingEnd={props.onSelectingEnd} />

    case 'PhotoCarousel':
      return <PhotoCarousel route={props.scene.route}/>
    case 'ProductChooser':
      return <ProductChooser route={props.scene.route}/>
    case 'QRCodeScanner':
      return <QRCodeScanner route={props.scene.route}/>
    case 'QRCode':
      return <QRCode route={props.scene.route}/>
    // case 18:
      // return <VideoPlayer {...props} />
    case 'GridItemsList':
      return <GridItemsList route={props.scene.route}/>
    case 'PasswordCheck':
      return <PasswordCheck route={props.scene.route}/>
    case 'TouchIDOptIn':
      return <TouchIDOptIn route={props.scene.route}/>
    case 'EnumList':
      return <EnumList route={props.scene.route}/>
    default: // 10
      return <ResourceList route={props.scene.route}/>
    }
  }

  _renderOverlay(props) {
    const showHeader = true
    // const showHeader = props.scene.route.title &&
    //   (Platform.OS === 'ios' || props.scene.route.key === 'details');

    if (showHeader) {
      return (
        <NavigationHeader
        {...props}
        renderTitleComponent={this._renderTitleComponent.bind(this)}
        renderLeftComponent={this._renderLeftComponent.bind(this)}
        renderRightComponent={this._renderRightComponent.bind(this)}
        />
      );
    }

    return null;
  }
  _renderTitleComponent(props) {
    return (
      <NavigationHeader.Title>
        {props.scene.route.title}
      </NavigationHeader.Title>
    );
  }

  _renderLeftComponent(props) {
    const { dispatch, navigation } = this.props;

    if (props.scene.route.showBackButton) {
      return (
        <NavigationHeaderBackButton onNavigate={() => {
          this._onPopRoute()
          // return NavigationStateUtils.pop(self.state.navState)
        }} />
      );
    }

    return null;
  }

  _renderRightComponent(props) {
    return this.props.renderActionButton
          ? (
            <TouchableHighlight underlayColor='transparent' onPress={this.props.renderActionButton.bind(this)}>
              <Text style={{fontSize: 18, justifyContent: 'center', margin: 15}}>YAY</Text>
            </TouchableHighlight>
          );
          : null
  }
}
module.exports = MyNavigator