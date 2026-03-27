import { useEffect, useState } from 'react';
import { Platform, Alert } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import GetLocation from 'react-native-get-location';

const useLocation = () => {
  const [location, setLocation] = useState(null);

  useEffect(() => {
    checkLocationPermission();
  }, []);

  const checkLocationPermission = async () => {
    let permission;

    if (Platform.OS === 'ios') {
      permission = PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
    } else {
      permission = PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
    }

    const result = await check(permission);

    switch (result) {
      case RESULTS.UNAVAILABLE:
        Alert.alert('Location service is not available on this device.');
        break;
      case RESULTS.DENIED:
        requestLocationPermission(permission);
        break;
      case RESULTS.LIMITED:
        Alert.alert('Location permission is limited.');
        break;
      case RESULTS.GRANTED:
        getLocation();
        break;
      case RESULTS.BLOCKED:
        Alert.alert('Location permission is blocked. Please enable it in the settings.');
        break;
    }
  };

  const requestLocationPermission = async (permission) => {
    const result = await request(permission);

    if (result === RESULTS.GRANTED) {
      getLocation();
    } else {
      Alert.alert('Location permission denied.');
    }
  };

  const getLocation = () => {
    GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 60000,
    })
      .then(location => {
        setLocation(location);
      })
      .catch(error => {
        const { code, message } = error;
        console.warn(code, message);
      });
  };



  return { location };
};

export default useLocation;
