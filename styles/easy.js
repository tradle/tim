
var LINK = '#006A4D';
var MY_MESSAGE_BG = '#006A4D';

var EasyBank = Object.freeze({
  LINK_COLOR: '#006A4D',
  // LINK_COLOR: '#42A382',
  PRODUCT_ROW_BG_COLOR: '#5F9D6E',
  PRODUCT_ROW_TEXT_COLOR: '#f7f7f7',

  SEPARATOR: '#006A4D',
  MY_MESSAGE_BG,
  STRUCTURED_MESSAGE_COLOR: '#5F9D6E',
  linkIcon: {
    width: 20,
    height: 20,
    color: LINK
  },
  separator: {
    height: 0.5,
    marginTop: 5,
    backgroundColor: LINK,
    flex: 40
  },
  linkIconGreyed: {
    width: 20,
    height: 20,
    opacity: 0.5,
    color: LINK
  },
  shareIcon: {
    height: 20,
    color: MY_MESSAGE_BG,
    width: 20
  }
});

module.exports = EasyBank;
