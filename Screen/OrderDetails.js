import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { List, IconButton, Appbar, Text, TouchableRipple, Avatar } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import { useSelector, useDispatch } from 'react-redux'
import { StartRide, fetchOrdersDetails } from "../Redux/OrdersManager";
import Loader from '../Components/loader'
import appEvents from '../events/appevents'

const OrderDetails = ({ navigation, route }) => {
    const orderDetails = route?.params?.details;
    const dispatch = useDispatch()

    const data = useSelector(state => state.OrdersManager)
    const [value, setValue] = React.useState(0);

    useEffect(() => {
        if (orderDetails) {
            getData()
        }
    }, [])
    const getData = async()=>{
        const arg = { transfer_id: orderDetails?.transfer_order_id, lat: orderDetails?.latitude, long: orderDetails?.longitude }
         const res =await  dispatch(fetchOrdersDetails(arg))
    }

    const Start = async () => {
        appEvents({
            eventName: 'Start Delivery',
            payload: { order_id: data?.ordersDetails?.order_id }
        })
        if (orderDetails?.latitude) {
            const arg = { lat: orderDetails?.latitude, long: orderDetails.longitude, transfer_id: orderDetails?.transfer_order_id, ride: 1 }
            const response = await dispatch(StartRide(arg))
            if (response.payload.status == 200) {
                setValue(1)
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
        } else {
            Start()
        }

    }


    const Reached = async (order_id) => {
        appEvents({
            eventName: 'Reached Address',
            payload: { order_id: data?.ordersDetails?.order_id }
        })
        if (orderDetails?.latitude) {
            const arg = { lat: orderDetails?.latitude, long: orderDetails.longitude, transfer_id: orderDetails?.transfer_order_id, ride: 2 }
            const response = await dispatch(StartRide(arg))
            if (response.payload.status == 200) {
                navigation.navigate('CompleteOrder', { data:response?.payload?.data });
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
    if (data?.loading) {
        return (
            <Loader />
        )
    } else {
        return (
            <View style={styles.container}>
                <Appbar.Header style={{ justifyContent: 'space-between', backgroundColor: '#D71828' }}>
                    <Appbar.BackAction onPress={() => {
                        navigation.goBack();
                    }} color="white"
                    />
                    <Appbar.Content title="Order Details" color="white" titleStyle={{ textAlign: 'center' }} />
                    <Appbar.Action icon="home" color="white" size={30} onPress={() => {
                        navigation.navigate('Home');
                    }} />
                </Appbar.Header>
                <ScrollView>
                    <View style={{ marginTop: 20 }}>
                        <Text style={{ textAlign: 'center', fontSize: 15, color: "#a0a09f", fontWeight: '700' }}>ORDER ID</Text>
                        <Text style={{ textAlign: 'center', fontSize: 35, fontWeight: '700' }}>#{data?.ordersDetails?.order_id}</Text>
                    </View>
                    <View style={{ marginHorizontal: 10, marginTop: 10, borderColor: "#c5c5c5", borderWidth: 1, padding: 10, borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
                        <Text style={{ fontSize: 20, fontWeight: '700', marginVertical: 2 }}>{data?.ordersDetails?.user_name}</Text>
                        {data?.ordersDetails?.shopname &&(<Text  style={{fontSize: 18, fontWeight: '500',color:'#000', marginVertical: 2 }}>Shopname : {data?.ordersDetails?.shopname}</Text>)}
                        <Text style={{ marginVertical: 2 }}>{data?.ordersDetails?.phone_no}</Text>
                        <Text style={{ marginVertical: 2 }}>{data?.ordersDetails?.address?.doorflat + "," + data?.ordersDetails?.address?.address + "," + data?.ordersDetails?.address?.landmark}</Text>
                    </View>
                    <View style={{ marginHorizontal: 10, flexDirection: 'row', borderColor: "#c5c5c5", borderWidth: 1, borderBottomLeftRadius: 10, borderBottomRightRadius: 10, borderTopWidth: 0 }}>
                        <TouchableRipple
                            onPress={() => {
                                appEvents({
                                    eventName: 'Call Customer',
                                    payload: { order_id: data?.ordersDetails?.order_id }
                                })
                                Linking.openURL(`tel:${data?.ordersDetails?.phone_no}`)
                            }}
                            rippleColor="rgba(0, 0, 0, .32)"
                            style={{ flex: 1, paddingVertical: 10, }}
                        >
                            <View style={{ marginHorizontal: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }} >
                                <MaterialCommunityIcons
                                    name="phone"
                                    color="green"
                                    size={17}
                                />
                                <Text style={{ marginLeft: 10, fontSize: 15, fontWeight: '700' }}>Call</Text>
                            </View>
                        </TouchableRipple>
                        <TouchableRipple
                            // onPress={() => orderDetails.latitude ? Linking.openURL('google.navigation:q=' + orderDetails.latitude + '+' + orderDetails.longitude + '') : Toast.showWithGravity('Location not found!', Toast.SHORT, Toast.TOP)}
                            onPress={() => Linking.openURL(`geo:0,0?q=${data?.ordersDetails?.address?.latitude},${data?.ordersDetails?.address?.longitude}`)}

                            rippleColor="#aedb3b"
                            style={{ flex: 1, backgroundColor: '#D71828', borderBottomEndRadius: 10 }}
                        >
                            <View style={{ padding: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }} >
                                <MaterialCommunityIcons
                                    name="map-marker"
                                    color="white"
                                    size={17}
                                />
                                <Text style={{ marginLeft: 10, fontSize: 15, fontWeight: '700', color: 'white' }}>Go To Map</Text>
                            </View>
                        </TouchableRipple>
                    </View>
                    <List.Item
                        key={'order.id'}
                        title={data?.ordersDetails?.payment_type}
                        titleStyle={{ fontSize: 18, fontWeight: '700' }}
                        left={(props) => (
                            <Avatar.Icon size={40} icon="check" color="#fff"
                                style={{ marginLeft: 10, backgroundColor: "#D71828" }}
                            />
                        )}
                        // right={(props) =>
                        //     <IconButton
                        //         icon={'Pending' ? 'clock-outline' : 'check'}
                        //         color={'green'}
                        //         {...props}
                        //     />
                        // }

                        style={[styles.item, { backgroundColor: '#ecf8d5', }]}
                    />
                    <View style={{ margin: 10, borderColor: "#c5c5c5", borderWidth: 1, padding: 10, borderRadius: 10, }}>
                        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 5 }}>Order Summery</Text>
                        <View style={{ flexDirection: 'row', }}>
                            <Text style={{ flex: 1, fontWeight: '700' }}>Amount : </Text>
                            <Text style={{ flex: 2, }}>₹{data?.ordersDetails?.order_detail?.amount}</Text>
                        </View>
                        {/* <View style={{ flexDirection: 'row', }}>
                            <Text style={{ flex: 1, fontWeight: '700' }}>Slot : </Text>
                            <Text style={{ flex: 2, }}>10:15am</Text>
                        </View> */}
                        <View style={{ flexDirection: 'row', }}>
                            <Text style={{ flex: 1, fontWeight: '700' }}>Date : </Text>
                            <Text style={{ flex: 2, }}>{data?.ordersDetails?.order_detail?.date}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', }}>
                            <Text style={{ flex: 1, fontWeight: '700' }}>No. of Products : </Text>
                            <Text style={{ flex: 2, }}>{data?.ordersDetails?.order_detail?.no_of_product}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', }}>
                            <Text style={{ flex: 1, fontWeight: '700' }}>Distance : </Text>
                            <Text style={{ flex: 2, }}>{data?.ordersDetails?.order_detail?.distance}</Text>
                        </View>
                    </View>

                    <List.Item
                        key={'2'}
                        title="Order Details"
                        onPress={() => {
                            appEvents({
                                eventName: 'View Order Products',
                                payload: { order_id: data?.ordersDetails?.order_id }
                            })
                            navigation.navigate('OrderProductsListScreen', { details: data?.ordersDetails?.order_id });
                        }}
                        titleStyle={{ fontSize: 18, fontWeight: '700' }}
                        left={(props) => (
                            <Avatar.Icon size={40} icon="package-variant-closed" color="#fff"
                                style={{ marginLeft: 10, backgroundColor: "#D71828" }}
                            />
                        )}
                        right={(props) =>
                            <IconButton
                                icon={'chevron-right'}
                                color={'green'}
                                size={30}
                                {...props}
                            />
                        }

                        style={styles.item}
                    />
                </ScrollView>

                {data?.ordersDetails?.delivery_status == 'Accepted' && value == 0 ?
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => {
                            Start();
                        }}
                    >
                        <Text style={styles.buttonText}>Start Delivery</Text>
                    </TouchableOpacity>
                    :

                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => {
                            Reached();
                        }}
                    >
                        <Text style={styles.buttonText}>Reached At Address</Text>
                    </TouchableOpacity>
                }
            </View>
        );
    }
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    item: {
        backgroundColor: '#fff',
        borderRadius: 10,
        margin: 10,
        borderColor: "#c5c5c5", borderWidth: 1,
    },
    button: {
        alignSelf: 'center',
        height: 50,
        width: '90%',
        backgroundColor: '#D71828',
        borderColor: '#D71828',
        borderWidth: 1,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
export default OrderDetails

