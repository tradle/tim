import asyncstorageDown from 'asyncstorage-down'
import AsyncStorage from '../utils/async-storage'

export default location => asyncstorageDown(location, { AsyncStorage })
