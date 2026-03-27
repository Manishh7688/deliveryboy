import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { setBoy, setName, setEmail, sendFcm } from '../Redux/LoginManager';
import GetLocation from 'react-native-get-location';
import {
  PERMISSIONS,
  RESULTS,
  request,
  check,
  openSettings,
} from 'react-native-permissions';
import Modal from 'react-native-modal';
import messaging from '@react-native-firebase/messaging';
import { UpdateLocation } from '../Redux/DashManager';
// import PushNotification from "react-native-push-notification";
import VersionCheck from 'react-native-version-check';
import notifee, { AndroidImportance } from '@notifee/react-native';

const Splash = ({ navigation }) => {
  const dispatch = useDispatch();
  const [modalVisible, setModalVisible] = useState(false);
  const [isNavigated, setIsNavigated] = useState(false);
  const data = useSelector(state => state.DashManager);
  const [boyStatus, setBoyStatus] = useState('Active');
  // const sleep = time => new Promise(resolve => setTimeout(resolve, time));

  const locationRef = useRef({ latitude: null, longitude: null });

  const getLocation = async () => {
    try {
      const location = await GetLocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 60000,
      });

      console.log('📍 Location:', location);
      update(location.latitude, location.longitude);
    } catch (error) {
      console.log('❌ Error getting location:', error.code, error.message);
    }
  };

  //   const taskRandom = async (taskDataArguments) => {
  //     const { delay } = taskDataArguments;

  //     await new Promise(async (resolve) => {
  //       while (BackgroundService.isRunning()) {
  //         try {

  //           await getLocation();
  //         } catch (err) {
  //           console.error("⛔ Background task error:", err);
  //         }
  //         await sleep(delay);
  //       }
  //       resolve();
  //     });
  //   };

  // const options = {
  //     taskName: 'Example',
  //     taskTitle: '📌 Location',
  //     taskDesc: 'accessing live location',
  //     taskIcon: {
  //       name: 'ic_launcher', // Must exist in `android/app/src/main/res/mipmap-*`
  //       type: 'mipmap',
  //     },
  //     color: '#000',
  //     linkingURI: 'oswal://chat/jane',
  //     parameters: {
  //       delay: 1 * 60 * 1000, // 1 minute
  //     },
  //   };

  //   const hasPermissions = async () => {
  //     const fine = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
  //     const background = await check(PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION);
  //     return fine === RESULTS.GRANTED && background === RESULTS.GRANTED;
  //   };

  //   const toggleBackground = async () => {
  //     const hasPerm = await hasPermissions();
  //     if (!hasPerm) {

  //       return;
  //     }

  //     try {
  //       console.log("Starting background service...");
  //       await BackgroundService.start(taskRandom, options);
  //     } catch (e) {

  //     }
  //   };

  useEffect(() => {
    getFcmToken();
    requestLocationPermission();
    checkLocationPermission();
    // toggleBackground()
    requestNotificationPermission();
    notificationListener();
    checkUpdateNeeded();
    getLocation();
  }, []);

  const checkUpdateNeeded = async () => {
    console.log('Current Version: ' + VersionCheck.getCurrentVersion());
    console.log(
      'package Name: ' + JSON.stringify(VersionCheck.getPackageName()),
    );
    console.log(
      'Latest Version: ' + JSON.stringify(VersionCheck.getLatestVersion()),
    );
    let updateNeeded = await VersionCheck.needUpdate();
    console.log('Update Needed: ' + JSON.stringify(updateNeeded));
    if (updateNeeded?.isNeeded) {
      Alert.alert(
        'Update!',
        'New Version of the App is available. Kindly update for enhanced working.',
        [
          {
            text: 'Update',
            onPress: () => {
              Linking.openURL(updateNeeded.storeUrl);
            },
          },
        ],
        { cancelable: false },
      );
    }
  };
  //======================= app notification permission ============================
  const requestNotificationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const result = await check(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
        console.log('Initial notification permission check result:', result);

        if (result !== RESULTS.GRANTED) {
          const newResult = await request(
            PERMISSIONS.ANDROID.POST_NOTIFICATIONS,
            {
              title: 'Notification',
              message:
                'App needs access to your notifications so you can get updates.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          );

          console.log('Notification permission request result:', newResult);

          if (newResult === RESULTS.GRANTED) {
            console.log('Notification permission granted after request');
          } else {
            console.log('Notification permission denied');
          }
        } else {
          console.log('Notification permission already granted');
        }
      } catch (err) {
        console.log('Notification Error=====>', err);
      }
    } else {
      console.log('Notification permission is not required for this platform');
    }
  };

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const result = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
        console.log('Initial location permission check result:', result);

        if (result !== RESULTS.GRANTED) {
          const newResult = await request(
            PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
            {
              title: 'Location Access',
              message:
                'This app needs access to your location to provide accurate information based on your location.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          );

          console.log('Location permission request result:', newResult);

          if (newResult === RESULTS.GRANTED) {
            console.log('Location permission granted after request');
          } else {
            console.log('Location permission denied');
          }
        } else {
          console.log('Location permission already granted');
        }
      } catch (err) {
        console.log('Location Error=====>', err);
      }
    }
  };
  //======================= app notification permission ============================

  const checkLocationPermission = async () => {
    try {
      const result = await check(
        PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION,
      );
      handlePermissionResult(result);
    } catch (error) {
      console.error('Error checking location permission:', error);
    }
  };

  const handlePermissionResult = result => {
    console.log('Permission result:', result);
    switch (result) {
      case RESULTS.UNAVAILABLE:
        console.log('Location service is not available on this device');
        break;
      case RESULTS.DENIED:
        setModalVisible(true);
        break;
      case RESULTS.GRANTED:
        console.log('Location permission granted');
        setTimeout(() => {
          navigation.navigate('Login');
        }, 2000);
        break;
      case RESULTS.BLOCKED:
        console.log('Location permission is blocked');
        break;
    }
  };

  // const handleAllow = useCallback(async () => {
  //     const permissionGranted = await backPermissons();
  //     if (permissionGranted) {
  //         navigation.navigate("Login");
  //         setModalVisible(false);
  //     }
  // }, [navigation]);

  // const denied = () => {
  //     navigation.navigate("Login");
  // };

  // const backPermissons = async () => {
  //     const backgroundResult = await check(PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION);
  //     if (backgroundResult !== RESULTS.GRANTED) {
  //         const newBackgroundResult = await request(PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION);
  //         if (newBackgroundResult !== RESULTS.GRANTED) {
  //             Alert.alert(
  //                 'Location Permission',
  //                 'We need all the time location permission to provide better services. Please enable it in the app settings.',
  //                 [
  //                     { text: 'Cancel', style: 'cancel' },
  //                     { text: 'Open Settings', onPress: () => openSettings() },
  //                 ],
  //                 { cancelable: false }
  //             );
  //             return false;  // Denied permission, return false
  //         }
  //     } else {
  //         console.log("Background location permission granted.");
  //         requestNotificationPermission();
  //         return true;  // Permission granted
  //     }
  // };

  // //======================= start  notification listener ============================

  const getFcmToken = async () => {
    const fcmToken = await messaging().getToken();
    console.log(fcmToken,'----------------fcm-----------------');
    
    var fcm = await AsyncStorage.setItem('fcmToken', fcmToken);
    if (fcmToken) {
      await dispatch(sendFcm(fcmToken));
    }
  };
  const notificationListener = async () => {
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log(
        'Notification caused app to open from background state:',
        remoteMessage.notification,
      );
    });
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log(
            'Notification caused app to open from quit state:',
            remoteMessage.notification,
          );
        }
      });
    messaging().onMessage(async remoteMessage => {
      console.log('received in foreground', remoteMessage.notification);
      const channelId = await notifee.createChannel({
        id: 'oswal_boy',
        name: 'Default Channel',
        importance: AndroidImportance.HIGH,
      });

      // Display a local notification using Notifee
      await notifee.displayNotification({
        title: remoteMessage.notification?.title || 'Oswal',
        body: remoteMessage.notification?.body || '',
        android: {
          channelId,
          smallIcon: 'ic_launcher', // Must exist in res/mipmap
          largeIcon: remoteMessage.notification?.android?.imageUrl || undefined,
          pressAction: {
            id: 'default', // Handle clicks if needed
          },
          style: remoteMessage.notification?.android?.imageUrl
            ? {
                type: notifee.AndroidStyle.BIGPICTURE,
                picture: remoteMessage.notification.android.imageUrl,
              }
            : undefined,
        },
      });
    });
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log(
        'Message handled in the background!',
        remoteMessage.notification,
      );
    });
    messaging()
      .subscribeToTopic('OswalDeliveryBoy')
      .then(() => console.log('Subscribed to topic!'));
  };

  //check login =================================

  useEffect(() => {
    checkLogin();
  }, [boyStatus]);
  const checkLogin = async () => {
    try {
      const isBoyLogin = await AsyncStorage.getItem('isBoyLogin');
      const BoyName = await AsyncStorage.getItem('BoyName');
      const BoyEmail = await AsyncStorage.getItem('BoyEmail');

      if (isBoyLogin && boyStatus == 'Active') {
        dispatch(setBoy(true));
        dispatch(setName(BoyName));
        dispatch(setEmail(BoyEmail));
        setTimeout(() => {
          navigation.navigate('Home');
        }, 2000);
      } else {
        setTimeout(() => {
          navigation.navigate('Login');
        }, 2000);
      }
    } catch (error) {
      console.error('Error checking login status:', error);
    }
  };
  //update live location of delivery boy

  const update = async (lat, long) => {
    locationRef.current = { latitude: lat, longitude: long };
    const arg = { lati: lat, longi: long };
    const response = await dispatch(UpdateLocation(arg));

    if (response?.payload?.success) {
      const newStatus = response.payload.delivery_boy_status;
      if (newStatus != boyStatus) {
        setBoyStatus(newStatus);
      }
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Image
        style={{
          height: '100%',
          width: '100%',
          textAlign: 'center',
          alignSelf: 'center',
          resizeMode: 'cover',
        }}
        source={require('../assets/splash.png')}
      />
    </View>
  );
};

export default Splash;

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: 'gray',
    padding: 10,
    borderRadius: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  boldText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'justify',
  },
  modal1: {
    justifyContent: 'center',
  },
});
