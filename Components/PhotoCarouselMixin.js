import { TYPE } from '@tradle/constants'
import Navigator from './Navigator'
import utils from '../utils/utils'

var PhotoCarouselMixin = {
  showCarousel({photo, isView, done, title}) {
    let { resource, mainPhoto } = this.props
    let photos
    // done - means there is something to be set
    if (!done) {
      if (mainPhoto)
        photos = [mainPhoto]
      else {
        let rtype = utils.getType(resource)
        let model = utils.getModel(rtype)
        photos = utils.getResourcePhotos(model, resource)
      }
    }
    let route = {
      backButtonTitle: 'Back',
      componentName: 'PhotoCarousel',
      passProps: {
        photo,
        photos: photos || [photo], //this.props.resource.photos,
        resource
      },
      titleTextColor: '#f7f7f7',
      sceneConfig: Navigator.SceneConfigs.FadeAndroid,
      tintColor: '#dddddd',
      // onRightButtonPress: {
      //   stateChange: this.closeCarousel.bind(this)
      // }
    }
    if (done) {
      if (title)
        route.title = title
      route.rightButtonTitle = 'Done'
      route.onRightButtonPress = () => {
        this.closeCarousel()
        done()
      }
    }
    this.props.navigator.push(route)
  },
  closeCarousel() {
    this.props.navigator.pop();
  }

}
module.exports = PhotoCarouselMixin;
