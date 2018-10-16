
import {StyleSheet, Platform} from 'react-native';
export default StyleSheet.create({
  container: {
    backgroundColor: '#f7f7f7',
    marginTop: Platform.OS === 'ios' ? 64 : 44,
    flex: 1,
  }
})
