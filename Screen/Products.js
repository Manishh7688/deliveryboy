import React, { useEffect } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { Title, Subheading, IconButton, List, Avatar, Appbar, Divider } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductsDetails } from '../Redux/OrdersManager';
import appEvents from '../events/appevents'


const OrderProductsListScreen = ({ navigation, route }) => {
    const orderDetails = route.params.details;
    const dispatch = useDispatch()
    const data = useSelector(state => state.OrdersManager);
    useEffect(()=>{
     if (orderDetails) {
        try {
            appEvents({
                eventName: 'Product List',
                payload: { order_id: orderDetails }
            })
        } catch (error) {
            console.log(error)
        }
        dispatch(fetchProductsDetails(orderDetails))
     }
    },[])
    

    const renderItem = ({ item }) => (
        <>
       
            <List.Item
                titleNumberOfLines={2}
                title={item?.product_name}
                description={`${item?.type} x ${item?.qty}   |  Amount: Rs.${item?.amount}`}
                left={() => <Avatar.Image source={{ uri: item?.image }} style={{ resizeMode: 'contain',backgroundColor:'white' }} size={60} />}
            />
            <Divider />
        </>
    );

    return (
        <View style={styles.container}>
            <Appbar.Header style={{ justifyContent: 'space-between', backgroundColor: '#D71828' }}>
                <Appbar.BackAction onPress={() => {
                    navigation.goBack();
                }} color="white"
                />
                <Appbar.Content title={`#${orderDetails}`} color="white" titleStyle={{ textAlign: 'center' }} />
                <Appbar.Action icon="bell-outline" color="#D71828" size={30} />
            </Appbar.Header>
            <View style={{ padding: 10 ,marginBottom:40}}>
                <List.Item
                    key={'2'}
                    title="Total Items"
                    // onPress={() => {
                    //     navigation.navigate('Products');
                    // }}
                    titleStyle={{ fontSize: 18, fontWeight: '700' }}
                    left={(props) => (
                        <Avatar.Icon size={40} icon="package-variant-closed" color="#fff"
                            style={{ marginLeft: 10, backgroundColor: "#D71828" }}
                        />
                    )}
                    right={(props) =>
                        <Title>{data?.productsDetails?.length}</Title>
                    }

                    style={styles.item}
                />
                <FlatList
                    data={data?.productsDetails}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.product_name}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    divider: {
        marginVertical: 10,
    },
    item: {
        backgroundColor: '#fff',
        borderRadius: 10,
        // margin: 10,
        borderColor: "#c5c5c5", borderWidth: 1,
    },
});

export default OrderProductsListScreen;
