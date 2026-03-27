import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { LogoutUser, setBoy, setName } from '../Redux/LoginManager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

const styles = StyleSheet.create({
  outer: {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
  },
  subTitle: {
    textAlign: 'center',
    marginBottom: 30,
    marginTop: 5,
  },
  buttonStyle: {
    width: '80%',
    height: 50,
    borderRadius: 20,
    backgroundColor: '#D71828',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'bold',
  },
});

const NoConnection = props => {
  const { retryConnection } = props;

  return (
    <View style={styles.outer}>
      <View
        style={[styles.inner, { backgroundColor: '#fff', borderColor: 'gray' }]}
      >
        <Image
          source={require('../assets/wifi.jpg')}
          style={{ width: '100%', height: '50%' }}
          resizeMode="contain"
        />
        <Text
          style={{
            color: 'gray',
            textAlign: 'center',
            fontSize: 16,
            fontFamily: 'bold',
          }}
        >
          Oops!
        </Text>
        <Text
          style={[
            styles.subTitle,
            { color: '#000', fontSize: 16, fontFamily: 'medium' },
          ]}
        >
          {'No Internet Connection!\n Check your connection.'}
        </Text>
        <TouchableOpacity onPress={retryConnection} style={styles.buttonStyle}>
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export { NoConnection };

const useMonitorUserStatus = () => {
  const dispatch = useDispatch();
  const userStatus = useSelector(state => state.DashManager);

  useEffect(() => {
    if (userStatus == 'inactive') {
      Logout();
    }
  }, [userStatus, dispatch]);

  const Logout = useCallback(async () => {
    try {
      const response = await dispatch(LogoutUser());
      if (response?.payload?.success === true) {
        await AsyncStorage.clear();
        dispatch(setBoy(false));
        dispatch(setName(''));
        setIsLoggedOut(true);
        Toast.show({
          type: 'success',
          text1: response?.payload?.message,
          position: 'top',
          visibilityTime: 3000,
          autoHide: true,
        });
        
      } else {
       
        Toast.show({
          type: 'info',
          text1: response?.payload?.message,
          position: 'top',
          visibilityTime: 3000,
          autoHide: true,
        });
      }
    } catch (error) {
      console.error('Error during logout:', error);
      Toast.show({
          type: 'error',
          text1:'An error occurred during logout',
          position: 'top',
          visibilityTime: 3000,
          autoHide: true,
        });
    }
  }, [dispatch, setIsLoggedOut]);
};

export { useMonitorUserStatus };
