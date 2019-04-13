import { TYPE } from '@tradle/constants'
import Navigator from './Navigator'
import utils from '../utils/utils'

var PhotoCarouselMixin = {
  showCarousel(currentPhoto, isView) {
    this.props.navigator.push({
      backButtonTitle: 'Back',
      componentName: 'PhotoCarousel',
      passProps: {
        currentPhoto: currentPhoto,
        photos: this.props.mainPhoto ? [this.props.mainPhoto] : this.props.resource.photos,
        resource: this.props.resource
      },
      titleTextColor: '#D2EBF7',
      sceneConfig: Navigator.SceneConfigs.FadeAndroid,
      tintColor: '#dddddd',
      onRightButtonPress: {
        stateChange: this.closeCarousel.bind(this)
      }
    })
  },
  closeCarousel() {
    this.props.navigator.pop();
  }

}
module.exports = PhotoCarouselMixin;
