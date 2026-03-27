import React, { useCallback, useState } from 'react';
import { View, StyleSheet, Image, ScrollView, BackHandler, Alert, Platform } from 'react-native';
import { TextInput, Button, HelperText, Text, ActivityIndicator } from 'react-native-paper';
import LottieView from 'lottie-react-native';
import { useSelector, useDispatch } from 'react-redux'
import {  Login } from '../Redux/LoginManager'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import appEvents from '../events/appevents'
// import crashlytics from '@react-native-firebase/analytics'

const LoginScreen = ({ navigation }) => {

    
    const data = useSelector(state => state.LoginManager);
    const dispatch = useDispatch()
    const [email,setEmail] = useState('')
    const [password,setPassword] = useState('')
    const setLocal = async (data1) => {       
        AsyncStorage.setItem("isBoyLogin", 'true');
        AsyncStorage.setItem("BoyName", data1?.data?.name);
        AsyncStorage.setItem("Auth", data1?.token);
        AsyncStorage.setItem("BoyEmail", data1?.data?.email);
        AsyncStorage.setItem("BoyImage", data1?.image);
        AsyncStorage.setItem('UserId', JSON.stringify(data1?.data?.id));
        navigation.navigate('Home');
    }
    const login = async () => {
        
        if (email == '') {
            Toast.show({
                type: 'info',
                text1: 'Email field is required!',
                position: 'top',
                visibilityTime: 3000,
                autoHide: true,
            });
            return;
        } else if (password == '') {
               Toast.show({
          type: 'info',
          text1: 'Password field is required!',
          position: 'top',
          visibilityTime: 3000,
          autoHide: true,
        });
            return;
        } else {
            try {
                appEvents({
                    eventName:'Login',
                    payload:{
                        email:email,
                        device_type:Platform.OS
                    }
                })
            } catch (error) {
               console.log(error) 
            }
           const arg = { email: email, password: password }
            const response = await dispatch(Login(arg))
            if (response?.payload?.success == true) {
                Toast.show({
          type: 'success',
          text1: response?.payload?.message,
          position: 'top',
          visibilityTime: 3000,
          autoHide: true,
        });
                setLocal(response?.payload);
            } else {
                   Toast.show({
          type: 'info',
          text1: response?.payload?.message,
          position: 'top',
          visibilityTime: 3000,
          autoHide: true,
        });
            }
        }

    }
    //================================= Close app ask ====================== 
    useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        Alert.alert(
          'Alert!',
          'Are you sure you want to close the app?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'OK', onPress: () => BackHandler.exitApp() },
          ]
        );
        return true; // Prevent default behavior (going back)
      };

      // ✅ Capture the subscription
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress
      );

      // ✅ Clean up using .remove()
      return () => backHandler.remove();
    }, [])
  );

    return (
        <View style={styles.container}>
            <ScrollView>
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../assets/logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <LottieView
                        style={{ width: "40%", alignSelf: 'center',height:150 }}
                        source={require('../assets/delivery boy.json')}
                        autoPlay
                        loop
                    />

                </View>
                <View style={styles.inputContainer}>
                    <TextInput
                        label="Email"
                        value={email}
                        onChangeText={email => setEmail(email)}
                        left={<TextInput.Icon icon="email" />}
                        style={styles.input}
                    />
                    <TextInput
                        label="Password"
                        value={password}
                        onChangeText={password => setPassword(password)}
                        left={<TextInput.Icon icon="lock" />}
                        secureTextEntry
                        style={styles.input}
                    />
                    {data.loading ?
                        <View style={{ backgroundColor: '#D71828', borderRadius: 20, paddingVertical: 8, marginVertical: 20, }}>
                            <ActivityIndicator animating={true} color={"white"} />
                        </View>
                        :
                        <Button mode="contained" onPress={() => {
                            login()
                        }} style={styles.button}>
                            Login
                        </Button>
                    }


                </View>
            </ScrollView>
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginVertical: 40,
    },
    logo: {
        width: "100%",
        height: 150,
    },
    inputContainer: {
        marginHorizontal: 20,
    },
    input: {
        marginVertical: 10,
    },
    button: {
        marginVertical: 20,
    },
});

export default LoginScreen;
