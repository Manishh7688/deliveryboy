/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import crashlytics from '@react-native-firebase/crashlytics'

crashlytics().log('App launched');
// crashlytics().crash()

if (__DEV__) {
  crashlytics().setCrashlyticsCollectionEnabled(false);
}
if (__DEV__) globalThis.RNFBDebug = true;


AppRegistry.registerComponent(appName, () => App);
