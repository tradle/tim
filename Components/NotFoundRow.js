import {
  Text,
  // StyleSheet,
  View,
} from 'react-native'
import React, { Component } from 'react'
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/Ionicons'
import {Column as Col, Row} from 'react-native-flexbox-grid'

import { circled } from '../styles/utils'
import StyleSheet from '../StyleSheet'

class NotFoundRow extends Component {
  static propTypes = {
    text: PropTypes.string,
    id: PropTypes.number.isRequired
  };
  render() {
    // return <View/>
    let { text, id } = this.props
    return <Row size={1} style={styles.gridRow} key={id}>
            <Col sm={1} md={1} lg={1} style={styles.col} key={id + '_'}>
              <View style={styles.col}>
                <View style={styles.button}>
                  <Icon name='md-close' size={20} color='#ffffff' />
                </View>
                <Text style={styles.text}>{text}</Text>
              </View>
            </Col>
           </Row>
  }

}
var styles = StyleSheet.create({
  button: {
    ...circled(30),
    shadowOpacity: 0.7,
    opacity: 0.9,
    shadowRadius: 5,
    shadowColor: '#afafaf',
    alignItems: 'center',
    backgroundColor: 'red'
  },
  gridRow: {
    borderBottomColor: '#f5f5f5',
    backgroundColor: 'lightyellow',
    paddingVertical: 5,
    paddingRight: 7,
    borderBottomWidth: 1
  },
  col: {
    paddingVertical: 5,
    paddingLeft: 5,
    // paddingHorizontal: 10,
    flexDirection: 'row'
  },
  text: {
    fontSize: 18,
    paddingLeft: 10,
    color: '#555555'
  },
});

module.exports = NotFoundRow;
