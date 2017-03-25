import { NativeModules } from 'react-native'
import AsyncSnappyStorage from 'react-native-async-storage-snappy'
AsyncSnappyStorage.encrypt()
NativeModules.AsyncRocksDBStorage = AsyncSnappyStorage

// require('./utils/perf')
require('./index.common')
