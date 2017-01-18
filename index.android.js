import { NativeModules } from 'react-native'
import AsyncSnappyStorage from 'react-native-async-storage-snappy'
NativeModules.AsyncRocksDBStorage = AsyncSnappyStorage

// require('./utils/perf')
require('./index.common')
