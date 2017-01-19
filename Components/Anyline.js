
import { NativeModules, Platform } from 'react-native'
import { anyline } from '../environment.json'
import Anyline from 'anyline-ocr-react-native-module'
import deepExtend from 'deep-extend'

const Errors = {
  invalid: newError.bind(null, 'invalid'),
  canceled: newError.bind(null, 'canceled'),
}

// import { parse as parseMRZ } from 'mrz'

// from example

function createConfig (options={}) {
  let config = {
    license: anyline.licenseKey[Platform.OS],
    options: deepExtend({
      captureResolution: '480',
      cutout: {
        style: 'rect',
        alignment: 'top',
        offset: {
          x: 0,
          y: 120,
        },
        strokeWidth: 2,
        cornerRadius: 4,
        strokeColor: 'F21C0A',
        outerColor: '000000',
        outerAlpha: 0.3,
      },
      flash: {
        mode: 'manual',
        alignment: 'bottom_right',
      },
      beepOnResult: true,
      vibrateOnResult: true,
      blinkAnimationOnResult: true,
      cancelOnResult: true,
      reportingEnabled: true,
      visualFeedback: {
        style: 'rect',
        strokeColor: 'F21C0A',
        fillColor: 'F21C0A',
        cornerRadius: 2,
      }
    }, options)
  }

  if (Platform.OS === 'ios') {
    config.options.doneButton = { // iOS only. Android uses hardware back button.
      title: 'Cancel',
      type: 'rect', // fullwidth, rect
      cornerRadius: 0,
      //backgroundColor:#EEEEEE, // default clearcolor
      textColor: 'FFFFFF',
      textColorHighlighted: 'CCCCCC',
      fontSize: 33,
      fontName: 'HelveticaNeue',
      positionXAlignment: 'center', // left,right,center - no affect on fullwidth
      positionYAlignment: 'bottom', // top, center, bottom
      offset: {
        x: 0, // postive -> right
        y: -88, // postive -> down
      }
    }
  }

  return config
}

module.exports = exports = Anyline
if (Anyline) {
  const setupScanViewWithConfigJson = Anyline.setupScanViewWithConfigJson.bind(Anyline)
  exports.setupScanViewWithConfigJson = function ({ config, type='MRZ' }) {
    type = type.toUpperCase()
    if (!config) config = exports.config[type]
    if (!config) throw new Error('expected "config"')

    return new Promise((resolve, reject) => {
      setupScanViewWithConfigJson(JSON.stringify(config), type, function (result) {
        if (typeof result === 'string') result = JSON.parse(result)

        if (type === 'MRZ') {
          if (!result.allCheckDigitsValid) {
            return reject(Errors.invalid('the machine readable zone on your document is invalid'))
          }
        }

        if (result.cutoutBase64) {
          result.cutoutBase64 = 'data:image/png;base64,' + result.cutoutBase64
        }

        if (result.fullImageBase64) {
          result.fullImageBase64 = 'data:image/png;base64,' + result.cutoutBase64
        }

        result.width = config.options.cutout.width
        const ratio = config.options.cutout.ratioFromSize
        result.height = Math.ceil(result.width * ratio.height / ratio.width)
        resolve(result)
      }, msg => {
        if (msg.toLowerCase() === 'canceled') return reject(Errors.canceled())

        reject(new Error(msg))
      })
    })
  }

  exports.config = {
    ocr: createConfig({
      cutout: {
        width: 400,
        ratioFromSize: {
          width: 1.3,
          height: 1
        }
      }
    }),
    mrz: createConfig({
      cutout: {
        width: 400,
        ratioFromSize: {
          width: 1.42,
          height: 1
        }
      }
    }),
    barcode: createConfig({
      cutout: {
        width: 400,
        ratioFromSize: {
          width: 1.3,
          height: 1
        }
      }
    })
  }

  // alias by built-in types
  exports.config.ANYLINE_OCR = exports.config.ocr
  exports.config.MRZ = exports.config.mrz
  exports.config.BARCODE = exports.config.barcode

  // console.log('ANYLINE', Anyline)
}

function newError (type, message) {
  const err = new Error(message || type)
  err.type = type
  return err
}
