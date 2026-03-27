import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, ScrollView } from 'react-native';
import {
    Title,
    Caption,
    Avatar,
    Drawer,
    Text
} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LottieView from 'lottie-react-native';
import { useSelector, useDispatch } from 'react-redux'
import { LogoutUser, setBoy, setName } from '../Redux/LoginManager'
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';


const Sidebar = ({ navigation }) => {
    const dispatch = useDispatch()
    const [active, setActive] = React.useState('');
    const data = useSelector(state => state.LoginManager);
    const [userName,setUserName] = useState('Name')
    const [userEmail,setUserEmail] = useState('mail@gmail.com')
    const [userImage,setUserImage] = useState('https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?t=st=1727100860~exp=1727104460~hmac=aa327adb03425b0f3c82c45860b4f7848b0e0da6389b7c237f1740e2b0cf0267&w=826')
 
    

    const Logout = async () => {
        const response = await dispatch(LogoutUser())
        if (response?.payload?.success==true) {
            await AsyncStorage.clear()
            dispatch(setBoy(false))
            dispatch(setName(''))
               Toast.show({
                      type: 'success',
                      text1: response?.payload?.message,
                      position: 'top',
                      visibilityTime: 3000,
                      autoHide: true,
                    });
            navigation.navigate('Login');
        }else{
              Toast.show({
                     type: 'info',
                     text1: response?.payload?.message,
                     position: 'top',
                     visibilityTime: 3000,
                     autoHide: true,
                   });
        }
    }
useEffect(()=>{
    fetchData()
},[])
    const fetchData = async()=>{
       const name = await  AsyncStorage.getItem("BoyName");
       const mail = await  AsyncStorage.getItem("BoyEmail");
       const iamge =await AsyncStorage.getItem("BoyImage");
       setUserEmail(mail)
       setUserName(name)
       setUserImage(iamge)

    }
    return (
        <View style={styles.drawerContent}>
            <ScrollView>
                <View style={styles.userInfoSection}>
                    <Avatar.Image size={70} source={userImage?{uri:userImage}:require('../assets/profile.png')} color="#fff"
                        style={{ marginLeft: 10, backgroundColor: "#90b531" }}
                    />
                    <Title style={styles.title}>{userName}</Title>
                    <Caption style={styles.caption}>{userEmail}</Caption>
                </View>
                <Drawer.Section style={styles.drawerSection}>
                    <Drawer.Item
                        icon={({ color, size }) => (
                            <MaterialCommunityIcons
                                name="cart-plus"
                                color={color}
                                size={size}
                            />
                        )}
                        label={<Text style={{ fontSize: 16, fontWeight: '700' }}>My Orders</Text>}
                        onPress={() => { navigation.navigate("MyOrders") }}
                    />
                    <Drawer.Item
                        icon={({ color, size }) => (
                            <MaterialCommunityIcons
                                name="logout"
                                color={color}
                                size={size}
                            />
                        )}
                        label={<Text style={{ fontSize: 16, fontWeight: '700' }}>Logout</Text>}
                        onPress={() => { Logout(); }}
                    />
                </Drawer.Section>
            </ScrollView>
            <View >
                {/* <Image
                    source={require('../assets/logo.png')}
                    style={{
                        width: 150,
                        height: 100,
                        alignSelf: 'center'
                    }}
                    resizeMode="contain"
                /> */}
                <LottieView
                    style={{ width: "100%", alignSelf: 'center',height:200 }}
                    source={require('../assets/motorbike1.json')}
                    autoPlay
                    loop
                />
            </View>

        </View>
    )
}

const styles = StyleSheet.create({
    drawerContent: {
        flex: 1,
    },
    userInfoSection: {
        paddingLeft: 20,
        paddingTop: 20,
        alignSelf:'center'
    },
    title: {
        marginTop: 20,
        fontWeight: 'bold',
    },
    caption: {
        fontSize: 14,
        lineHeight: 14,
    },
    row: {
        marginTop: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    section: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 15,
    },
    paragraph: {
        fontWeight: 'bold',
        marginRight: 3,
    },
    drawerSection: {
        marginTop: 15,
    },
    preference: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
});
export default Sidebar;