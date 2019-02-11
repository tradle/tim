/*

  a bootstrap like style

*/
var React = require('react-native')

var LABEL_COLOR = '#000000';
var INPUT_COLOR = '#000000';
var ERROR_COLOR = '#EEF2DB';
var HELP_COLOR = '#999999';
var BORDER_COLOR = '#356D9D';
var DISABLED_COLOR = '#777777';
var DISABLED_BACKGROUND_COLOR = '#eeeeee';
var FONT_SIZE = 24;
var HELP_FONT_SIZE = 26;
var height = React.Dimensions.get('window').height < 600 ? 55 : 66

var FONT_WEIGHT = '400';

var stylesheet = Object.freeze({
  fieldset: {},
  // the style applied to the container of all inputs
  formGroup: {
    normal: {
      marginBottom: 10,
    },
    error: {
      marginBottom: 10
    }
  },
  controlLabel: {
    normal: {
      color: LABEL_COLOR,
      fontSize: FONT_SIZE,
      marginBottom: 3,
      fontWeight: FONT_WEIGHT
    },
    // the style applied when a validation error occours
    error: {
      color: ERROR_COLOR,
      fontSize: HELP_FONT_SIZE,
      marginBottom: 7,
      fontWeight: FONT_WEIGHT
    }
  },
  helpBlock: {
    normal: {
      color: HELP_COLOR,
      fontSize: HELP_FONT_SIZE,
      marginLeft: 10,
      marginTop: 5
    },
    // the style applied when a validation error occours
    error: {
      color: HELP_COLOR,
      fontSize: HELP_FONT_SIZE,
      marginLeft: 10,
      marginBottom: 2
    }
  },
  errorBlock: {
    fontSize: FONT_SIZE,
    marginBottom: 2,
    color: ERROR_COLOR
  },
  textbox: {
    normal: {
      color: '#467EAE',
      // color: '#eeeeee',
      fontSize: FONT_SIZE,
      backgroundColor: '#ffffff',
      height: height,
      padding: 10,
      // borderColor: BORDER_COLOR,
      // borderBottomColor: BORDER_COLOR,
      // borderWidth: 1,
      marginBottom: 5
    },
    // the style applied when a validation error occours
    error: {
      color: INPUT_COLOR,
      backgroundColor: '#ffffff',
      fontSize: HELP_FONT_SIZE,
      height: height,
      padding: 10,
      borderColor: ERROR_COLOR,
      borderWidth: 1,
      marginBottom: 5
    },
    // the style applied when the textbox is not editable
    notEditable: {
      fontSize: FONT_SIZE,
      height: height,
      padding: 7,
      borderRadius: 4,
      borderColor: BORDER_COLOR,
      borderWidth: 1,
      marginBottom: 5,
      color: DISABLED_COLOR,
      backgroundColor: DISABLED_BACKGROUND_COLOR
    }
  },
  checkbox: {
    normal: {
      color: INPUT_COLOR,
      marginBottom: 4
    },
    // the style applied when a validation error occours
    error: {
      color: INPUT_COLOR,
      marginBottom: 4
    }
  },
  select: {
    normal: {
      marginBottom: 4
    },
    // the style applied when a validation error occours
    error: {
      marginBottom: 4
    }
  },
  datepicker: {
    normal: {
      marginBottom: 4
    },
    // the style applied when a validation error occours
    error: {
      marginBottom: 4
    }
  }
});

module.exports = stylesheet;
