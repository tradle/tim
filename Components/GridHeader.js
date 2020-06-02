
import React, { Component } from 'react'
import {
  TouchableOpacity,
  View,
  Text,
} from 'react-native'
import PropTypes from 'prop-types'

import constants from '@tradle/constants'
import { makeResponsive } from 'react-native-orient'

import Icon from 'react-native-vector-icons/Ionicons'
import {Column as Col, Row} from 'react-native-flexbox-grid'
import { getModel, translateForGrid } from '../utils/utils'
import StyleSheet from '../StyleSheet'
import { circled } from '../styles/utils'

const { MONEY } = constants.TYPES
const PHOTO = 'tradle.Photo'

class GridHeader extends Component {
  static propTypes = {
    navigator: PropTypes.object.isRequired,
    modelName: PropTypes.string.isRequired,
    gridCols: PropTypes.array.isRequired,
    multiChooser: PropTypes.bool,
    isSmallScreen: PropTypes.bool,
    checkAll: PropTypes.func,
    sort: PropTypes.func
    // backlinkList: PropTypes.array
  };
  constructor(props) {
    super(props);
    this.state = {
      isChecked: false
    };
  }
  render() {
    let { modelName, isSmallScreen, multiChooser, gridCols, notSortable } = this.props
    if (!gridCols)
      return <View />

    let model = getModel(modelName)
    let props = model.properties

    let size
    if (gridCols) {
      let vCols = gridCols.filter((c) => props[c].type !== 'array')
      gridCols = vCols
      size = Math.min(gridCols.length, 12)
      if (size < gridCols.length)
        gridCols.splice(size, gridCols.length - size)
    }
    else
      size = 1

    let smCol = isSmallScreen ? size/2 : 1
    if (multiChooser)
      size++
    let { sortProperty, order } = this.props
    let cols = gridCols.map((p) => {
      let colStyle
      if (sortProperty  &&  sortProperty === p) {
        let asc = order[sortProperty]
        colStyle = [styles.col, asc ? styles.sortAscending : styles.sortDescending]
      }
      else
        colStyle = [styles.col]
      let prop = props[p]
      let { ref, type, icon, color } = prop
      let textStyle
      if (prop  &&  (type === 'number'  ||  ref === MONEY))
        textStyle = {alignSelf: 'flex-end', paddingRight: 10}
      else
        textStyle = {}
      let title
      if (icon)
        title = <View style={[styles.button, {alignItems: 'center', backgroundColor: color}]}>
                  <Icon name={icon} color='#ffffff' size={20}/>
                </View>
      else
        title = <Text style={[styles.cell, textStyle]}>
                  {translateForGrid({property: props[p], model}).toUpperCase()}
                </Text>

      if (prop.type === 'number')
        colStyle.push({alignItems: 'flex-end'})
      if (icon)
        colStyle.push({marginTop: 3})

      let isSortable = prop.ref !== PHOTO  &&  (!notSortable  ||  !notSortable.includes(p))
      if (isSortable)
        title = <TouchableOpacity onPress={() => this.props.sort(p)}>
                  {title}
                </TouchableOpacity>
      return <Col sm={smCol} md={1} lg={1} style={colStyle} key={p}>
               {title}
             </Col>
    })
    if (this.props.multiChooser) {
      // let checkIcon
      // let isChecked = this.state.isChecked
      // let colName
      // if (isChecked) {
      //   checkIcon = 'ios-checkmark-circle-outline'
      //   colName = translate('Uncheck')
      // }
      // else {
      //   checkIcon = 'ios-radio-button-off'
      //   colName = translate('Check')
      // }
      // cols.push(<Col sm={smCol} md={1} lg={1} style={styles.col} key={'check'}>
      //             <Text style={styles.checkCell}>{colName}</Text>
      //             <TouchableOpacity onPress={this.checkAll.bind(this)}>
      //               <Icon name={checkIcon}  size={30}  color='#7AAAc3' style={{paddingRight: 10, alignSelf: 'flex-end'}}/>
      //             </TouchableOpacity>
      //           </Col>)
      cols.push(<Col sm={smCol} md={1} lg={1} style={styles.col} key={'check'} />)
    }

    return <View style={styles.gridHeader} key='Datagrid_h1'>
            <Row size={size} style={styles.headerRow} key='Datagrid_h2' nowrap>
              {cols}
            </Row>
          </View>

  }
  checkAll() {
    this.setState({isChecked: !this.state.isChecked})
    this.props.checkAll()
  }
}
GridHeader = makeResponsive(GridHeader)

var styles = StyleSheet.create({
  col: {
    paddingVertical: 5,
    // paddingLeft: 7
    // borderRightColor: '#aaaaaa',
    // borderRightWidth: 0,
  },
  checkCell: {
    paddingVertical: 5,
    alignSelf: 'flex-end',
    paddingRight: 7
  },
  cell: {
    paddingVertical: 5,
    fontSize: 14,
    paddingLeft: 7
  },
  headerRow: {
    borderBottomColor: '#cccccc',
    borderBottomWidth: 1,
  },
  sortAscending:  {
    borderTopWidth: 4,
    borderTopColor: '#7AAAC3'
  },
  sortDescending: {
    borderBottomWidth: 4,
    borderBottomColor: '#7AAAC3'
  },
  gridHeader: {
    backgroundColor: '#e7e7e7'
  },
  button: {
    ...circled(20),
    shadowOpacity: 0.7,
    opacity: 0.9,
    shadowRadius: 5,
    shadowColor: '#afafaf',
  },
});

module.exports = GridHeader;
