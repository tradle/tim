import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  // StyleSheet,
} from 'react-native'
// import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
// import { PDFViewer } from '@react-pdf/renderer'

import React, { Component } from 'react'
import dateformat from 'dateformat'

import constants from '@tradle/constants'
const {
  TYPE,
} = constants

import PhotoView from './PhotoView'
import StyleSheet from '../StyleSheet'
import { getContentSeparator, getMarkdownStyles } from '../utils/uiUtils'
import Markdown from './Markdown'
import PageView from './PageView'
import platformStyles from '../styles/platform'

// import defaultBankStyle from '../styles/bankStyle.json'
import defaultBankStyle from '../styles/defaultBankStyle.json'
import utils, {
  translate,
  translateModelDescription,
  getModel,
  dimensions
} from '../utils/utils'
let LOADING = true
class ApplicantLegalEntityConsent extends Component {
  static propTypes = {
    resource: PropTypes.object.isRequired,
  };
  render() {
    let { resource } = this.props
    let bankStyle = defaultBankStyle
    let model = getModel(resource[TYPE])
    let properties = model.properties

    let styles = createStyles({bankStyle})

    let description = <View style={styles.description}>
                        <Markdown markdownStyles={getMarkdownStyles(bankStyle, false, false, true)} passThroughProps={{navigator, bankStyle}}>
                          {translateModelDescription(model)}
                        </Markdown>
                      </View>
    let signature = <View style={styles.photoBG}>
                     <PhotoView resource={resource} mainPhoto={resource.signature} navigator={navigator}/>
                   </View>

    let date = <View style={styles.date}>
                  <Text style={styles.dateLabel}>{translate('dateSubmitted')}</Text>
                  <Text style={[styles.dateValue]}>{dateformat(new Date(resource._time), 'mmm d, yyyy')}</Text>
                </View>
    let p = ['declaration', 'certification']

    let props = p.map(p => {
      let val = translate(resource[p] && 'Yes' || 'No')
      if (properties[p].description)
        return <View style={styles.description}>
                 <Markdown markdownStyles={getMarkdownStyles(bankStyle, false, false, true)} passThroughProps={{navigator, bankStyle}}>
                   {translate(properties[p], model, true)}
                 </Markdown>
                 <Text style={styles.title}>{val}</Text>
               </View>
      else {
        return <View style={styles.description}>
                 <Text style={styles.title}>{translate(properties[p], model)}</Text>
                 <Text style={styles.title}>{val}</Text>
               </View>
      }
    })


    // return (
    //   <PDFViewer>
    //     <Document>
    //       <Page size="A4" style={styles.page}>
    //         <View style={styles.section}>
    //           <Text style={styles.text}>section #1</Text>
    //         </View>
    //         <View style={styles.section}>
    //           <Text style={styles.text}>section #2</Text>
    //         </View>
    //       </Page>
    //     </Document>
    //   </PDFViewer>
    // )
    // ReactDOM.render(<PDFViewer>{d}</PDFViewer>, elm);
    let contentSeparator = getContentSeparator(bankStyle)
    let height = utils.dimensions(ApplicantLegalEntityConsent).height
    let width = utils.getContentWidth()
    return (
      <ScrollView style={{width, alignSelf: 'center'}}>
        <View style={styles.pageTitle}>
          <Text style={styles.bigTitle}>{translate(model)}</Text>
          {date}
        </View>
        <View>
          {description}
          {signature}
          {props}
        </View>
      </ScrollView>
    )

  }
}

var createStyles = utils.styleFactory(ApplicantLegalEntityConsent, function ({ dimensions, bankStyle }) {
  return StyleSheet.create({
    title: {
      fontSize: 16,
      // fontFamily: 'Avenir Next',
      marginHorizontal: 7,
      color: '#555555',
      fontWeight: '600'
    },
    pageTitle: {
      // alignSelf: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between'
    },
    bigTitle: {
      paddingTop: 25,
      fontSize: 22,
      // fontFamily: 'Avenir Next',
      marginHorizontal: 7,
      color: '#555555'
    },
    date: {
      // padding: 10,
      padding: 25,
      flexDirection: 'row',
      alignSelf: 'flex-end'
    },
    dateLabel: {
      fontSize: 14,
      marginTop: 5,
      marginRight: 10,
      color: '#999999'
      // color: '#b4c3cb'
    },
    dateValue: {
      fontSize: 14,
      marginTop: 5,
      marginRight: 10,
      color: '#555555'
      // color: '#b4c3cb'
    },
    description: {
      padding: 10
    },
    photoBG: {
      backgroundColor: '#f7f7f7',
      alignItems: 'center',
      borderColor: '#cccccc', //bankStyle.linkColor,
      borderTopWidth: 1,
      borderBottomWidth: 1
    },
  })
})
// const styles = StyleSheet.create({
  // page: {
  //   flexDirection: 'row',
  //   flex: 1,
  //   backgroundColor: '#f7f7f7'
  // },
  // section: {
  //   margin: 10,
  //   padding: 10,
  //   flexGrow: 1
  // },
  // text: {
  //   color: '#ff0000',
  //   fontSize: 20
  // }
// });

module.exports = ApplicantLegalEntityConsent
