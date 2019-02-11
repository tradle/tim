/*

  a bootstrap like style

*/
import {StyleSheet} from 'react-native'
var verificationStyles = Object.freeze({
  verifiedHeader: {
    flexDirection: 'row',
    paddingVertical: 5,
    // paddingHorizontal: 7,
    marginHorizontal: -7,
    marginTop: -5,
    justifyContent: 'center'
  },
  verificationHeaderText: {
    fontSize: 18,
    // fontWeight: '500',
    alignSelf: 'center',
    color: '#f7f7f7',
    paddingLeft: 3
  },
  verificationBody: {
    paddingVertical: 5,
    paddingHorizontal: 7,
    borderRadius: 10,
    borderColor: '#7AAAC3',
    borderWidth: StyleSheet.hairlineWidth,
    marginVertical: 4,
    backgroundColor: '#ffffff',
  },
  verificationIcon: {
    width: 20,
    height: 20,
    color: '#ffffff',
  },
  sealedStatus: {
    justifyContent: 'center',
    // paddingHorizontal: 5,
    marginTop: 2
    // alignSelf: 'flex-end',
    // flexDirection: 'row',
    // position: 'absolute',
    // bottom: 1,
    // left: 10,
  },
  bigImage: {
    width: 240,
    height: 280,
    margin: 1,
    borderRadius: 10
  },
  mediumImage: {
    width: 120,
    height: 120,
    margin: 1,
    borderRadius: 10
  },
  image: {
    width: 88,
    height: 88,
    margin: 1,
    borderRadius: 10
  },
  formType: {
    color: '#EBFCFF',
    fontSize: 18,
    // fontWeight: '600',
    opacity: 0.7,
    alignSelf: 'flex-end',
    marginTop: 10,
    marginBottom: 10
  },
  row: {
    // alignItems: 'center',
    // backgroundColor: '#f7f7f7',
    flexDirection: 'row',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  resourceTitle: {
    // flex: 1,
    fontSize: 18,
    marginBottom: 2,
  },
  description: {
    // flexWrap: 'wrap',
    color: '#757575',
    fontSize: 14,
  },
  textContainer: {
    flex: 1,
    flexDirection: 'row'
  },
  dateInForm: {
    color: '#999999',
    fontSize: 12,
  },
  date: {
    flex: 1,
    color: '#999999',
    fontSize: 12,
    alignSelf: 'center',
    paddingTop: 10
  },
  myCell: {
    paddingVertical: 5,
    paddingHorizontal: 7,
    justifyContent: 'flex-end',
    borderRadius: 10,
    borderTopRightRadius: 0,
    backgroundColor: '#77ADFC' //#569bff',
  },
  shareButton: {
    flexDirection: 'row',
    marginHorizontal: 10,
    justifyContent: 'space-between',
    padding: 5,
    borderRadius: 10,
    borderColor: '#4982B1',
    backgroundColor: '#ffffff',
    borderWidth: 1
  },
  shareText: {
    // color: '#4982B1',
    color: '#4982B1',
    fontSize: 14,
    // fontWeight: '600',
    paddingHorizontal: 3,
    alignSelf: 'center'
  },
  shareView: {
    flexDirection: 'row',
    marginTop: 5,
    paddingBottom: 5,
    paddingLeft: 10,
    // justifyContent:'space-between'
  },
  linkIconGreyed: {
    color: '#cccccc'
  },
});

module.exports = verificationStyles;
