import React, { useEffect, memo, useState, useCallback } from 'react';
import { View, Image, BackHandler, Alert, RefreshControl, TouchableOpacity } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Appbar, Text, Avatar, Subheading } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux'
import { fetchDashData, } from "../Redux/DashManager";
import Loader from '../Components/loader'
import { useFocusEffect } from '@react-navigation/native';
import appEvents from '../events/appevents'


const Home = memo(({ navigation }) => {
    const dispatch = useDispatch()
    const data = useSelector(state => state.DashManager);
    const [refreshing, setRefreshing] = useState(false)
    useEffect(() => {
        dispatch(fetchDashData())
    }, []);
    useEffect(() => {
        dispatch(fetchDashData())
        navigation.closeDrawer()
    }, [navigation]);
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

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        dispatch(fetchDashData())
        try {
                appEvents({
                    eventName:'Home',
                    payload:{}
                })
            } catch (error) {
               console.log(error) 
            }
       
        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
    }, []);
    if (data?.loading) {
        return (
            <Loader />
        )
    } else {
        return (
            <View style={{ flex: 1 }}>
                <Appbar.Header style={{ justifyContent: 'space-between', backgroundColor: 'white' }}>
                    <Appbar.Action icon="view-grid-outline" size={30} onPress={() => {
                        navigation.openDrawer();
                    }}
                    />
                    <View style={{}}>
                        <Image
                            source={require('../assets/logo.png')}
                            style={{
                                width: 50,
                                height: 50,
                            }}
                            resizeMode="contain"
                        />
                    </View>
                    <Appbar.Action icon="bell-outline" color="white" size={30} />
                </Appbar.Header>
                <ScrollView
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                        />}
                >

                    <View style={{
                        backgroundColor: '#6e4126',
                        borderRadius: 10,
                        marginBottom: 10,
                        elevation: 5,
                        margin: 10,
                        padding: 10,
                        flexDirection: 'row',
                        alignItems: 'center'

                    }}>
                        <View style={{ flex: 3 }}>

                            <Subheading style={{ color: 'yellow' }}>Balance</Subheading>
                            <Text style={{ color: '#fff', fontSize: 30 }}>{data?.dashboard?.wallet_amount ? data?.dashboard?.wallet_amount : 0}</Text>
                        </View>
                        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', }}>
                            <Avatar.Icon size={50} icon="currency-rupee" color="#fff"
                                style={{ marginLeft: 10, backgroundColor: "#D71828" }}
                            />
                        </View>
                    </View>
                    <View style={{
                        backgroundColor: '#6e4126',
                        borderRadius: 10,
                        marginBottom: 10,
                        elevation: 5,
                        margin: 10,
                        padding: 10,
                        flexDirection: 'row',
                        alignItems: 'center'

                    }}>
                        <View style={{ flex: 3 }}>

                            <Subheading style={{ color: 'yellow' }}>Today's Order Amount</Subheading>
                            <Text style={{ color: '#fff', fontSize: 30 }}>{data?.dashboard?.total_collection}</Text>
                        </View>
                        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', }}>
                            <Avatar.Icon size={50} icon="currency-rupee" color="#fff"
                                style={{ marginLeft: 10, backgroundColor: "#D71828" }}
                            />
                        </View>
                    </View>
                    <View style={{
                        backgroundColor: '#6e4126',
                        borderRadius: 10,
                        marginBottom: 10,
                        elevation: 5,
                        margin: 10,
                        padding: 10,
                        flexDirection: 'row',
                        alignItems: 'center'

                    }}>
                        <TouchableOpacity style={{ flex: 3 }} onPress={()=>{
                            appEvents({
                                eventName: 'View Pending Orders',
                                payload: {}
                            })
                            navigation.navigate('MyOrders')
                        }}>

                            <Subheading style={{ color: 'yellow' }}>Today's Orders</Subheading>
                            <Text style={{ color: '#fff', fontSize: 30 }}>{data?.dashboard?.pending_orders}</Text>
                        </TouchableOpacity>
                        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', }}>
                            <Avatar.Icon size={50} icon="package-variant-closed" color="#fff"
                                style={{ marginLeft: 10, backgroundColor: "#D71828" }}
                            />
                        </View>
                    </View>
                    <TouchableOpacity style={{
                        backgroundColor: '#6e4126',
                        borderRadius: 10,
                        marginBottom: 10,
                        elevation: 5,
                        margin: 10,
                        padding: 15,
                        flexDirection: 'row',
                        alignItems: 'center'

                    }} onPress={() => {
                        appEvents({
                            eventName: 'View Completed Orders',
                            payload: {}
                        })
                        navigation.navigate('MyOrders')
                    }}>
                        <View style={{ flex: 3 }}>

                            <Subheading style={{ color: 'yellow' }}>Total Completed Orders</Subheading>
                            <Text style={{ color: '#fff', fontSize: 30 }}>{data?.dashboard?.completed_orders}</Text>
                        </View>
                        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', }}>
                            <Avatar.Icon size={50} icon="package-variant-closed" color="#fff"
                                style={{ marginLeft: 10, backgroundColor: "#D71828" }}
                            />
                        </View>
                    </TouchableOpacity>

                </ScrollView>
            </View>

        );
    }
});
export default Home

