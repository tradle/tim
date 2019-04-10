// prevent "Can't find variable: Symbol" error
import 'es6-symbol/implement'

import AsyncSnappyStorage from 'react-native-async-storage-snappy'

AsyncSnappyStorage.encrypt()

// require('./utils/perf')
require('./index.common')
// require('./test/ui/zoom.js')
// require('./test/ui/regula.js')
// require('./test/ui/image-store')
