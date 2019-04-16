import { TYPE } from '@tradle/constants'
import Navigator from './Navigator'
import utils from '../utils/utils'

var PhotoCarouselMixin = {
  showCarousel(currentPhoto, isView) {
    let { resource, mainPhoto } = this.props
    let photos
    if (mainPhoto)
      photos = [mainPhoto]
    else {
      let rtype = utils.getType(resource)
      let model = utils.getModel(rtype)
      photos = utils.getResourcePhotos(model, resource)
    }
    this.props.navigator.push({
      backButtonTitle: 'Back',
      componentName: 'PhotoCarousel',
      passProps: {
        currentPhoto,
        photos, //this.props.resource.photos,
        resource
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
