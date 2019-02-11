import React, { Component } from 'react'
import {
  StyleSheet,
  ScrollView,
  View
} from 'react-native'
import PropTypes from 'prop-types'
import Reflux from 'reflux'
import reactMixin from 'react-mixin'

import Actions from '../Actions/Actions'
import Store from '../Store/Store'
import ResourceMixin from './ResourceMixin'
import PageView from './PageView'
import utils from '../utils/utils'
import Image from './Image'

import { makeResponsive } from 'react-native-orient'

class MatchImages extends Component {
  static propTypes = {
    navigator: PropTypes.object.isRequired,
    selfie: PropTypes.object.isRequired,
    photoId: PropTypes.object.isRequired,
    bankStyle: PropTypes.object.isRequired
    // verify: PropTypes.func
  };
  constructor(props) {
    super(props)
    let { selfie, photoId } = props
    this.state = {
      selfie,
      photoId,
      isLoading: !selfie.selfie  &&  !photoId.scan
    }
  }
  componentWillMount() {
    let { selfie, photoId } = this.props
    if (!selfie.selfie  ||  !photoId.scan)
      Actions.getItemsToMatch({selfie, photoId})
  }
  componentDidMount() {
    this.listenTo(Store, 'handleEvent');
  }
  handleEvent(params) {
    let { action, selfie, photoId } = params
    if (action !== 'matchImages')
      return
    this.setState({
      isLoading: false,
      selfie,
      photoId
    })
  }
  render() {
    let styles = createStyles()
    if (this.state.isLoading)
      return <PageView style={styles.pageView}>
              {this.showLoading({component: MatchImages})}
             </PageView>
    const { selfie, photoId } = this.state
    return  <PageView style={styles.pageView}>
              <ScrollView  style={styles.scroll}>
                <View style={styles.images}>
                  <Image source={{uri: selfie.selfie.url}} style={styles.image1} resizeMode='contain' />
                  <Image source={{uri: photoId.scan.url}} style={styles.image2} resizeMode='contain' />
                </View>
              </ScrollView>
            </PageView>
  }
}

var createStyles = utils.styleFactory(MatchImages, function ({ dimensions }) {
  let { width, height } = dimensions
  let isPortrait
  if (width < height) {
    width -= 20
    height /= 2
    isPortrait = true
  }
  else {
    width = width / 2 - 20
    isPortrait = false
  }

  return StyleSheet.create({
    pageView: {
      backgroundColor: '#000000',
      flex: 1,
      paddingTop: isPortrait ? 35 : 10
    },
    scroll: {
      padding: 10
    },
    images: {
      flexDirection: isPortrait  &&  'column' || 'row',
      justifyContent: 'space-around',
      paddingTop: isPortrait && 20 || 10
    },
    image1: {
      width,
      height
    },
    image2: {
      width,
      height,
      marginTop: isPortrait  &&  -35 || 0
    }

  })
})
reactMixin(MatchImages.prototype, Reflux.ListenerMixin);
reactMixin(MatchImages.prototype, ResourceMixin);

module.exports = makeResponsive(MatchImages)
