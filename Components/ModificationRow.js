import {
  TouchableOpacity,
} from 'react-native'
import PropTypes from 'prop-types';
import {
  LazyloadView as View,
} from 'react-native-lazyload'

import React, { Component } from 'react'
import _ from 'lodash'
import dateformat from 'dateformat'
import reactMixin from 'react-mixin'

import constants from '@tradle/constants'
const { TYPE } = constants

import utils, { translate } from '../utils/utils'
import RowMixin from './RowMixin'
import ResourceMixin from './ResourceMixin'
import { Text } from './Text'

const MODIFICATION = 'tradle.Modification'

class ModificationRow extends Component {
  static propTypes = {
    resource: PropTypes.object.isRequired,
    onSelect: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props)
    this.state = {
      resource: this.props.resource
    }
  }
  render() {
    let { resource, lazy, onSelect } = this.props
    let model = utils.getModel(MODIFICATION);

    let { modifications } = resource
    let { dataLineage } = modifications

    let header
    let json = dataLineage &&  dataLineage || modifications
    let title = dataLineage && translate('dataSource') || translate('Edit')
    title = `${title} ${dateformat(resource.dateModified, 'mmm dS, yyyy h:MM TT')}`

    let content = this.showJson({json, title, prop: model.properties.modifications, isView: true })
    return <View host={lazy}>
             <TouchableOpacity onPress={onSelect.bind(this)}>
               {header}
               {content}
             </TouchableOpacity>
           </View>
  }
}

reactMixin(ModificationRow.prototype, RowMixin);
reactMixin(ModificationRow.prototype, ResourceMixin);

module.exports = ModificationRow;
