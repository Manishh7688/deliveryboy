import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import {RefreshControl, ScrollView} from 'react-native-gesture-handler';
import {List, Avatar, Appbar, Text} from 'react-native-paper';
import {useSelector, useDispatch} from 'react-redux';
import {fetchOrdersData, RejectOrder} from '../Redux/OrdersManager';
import Loader from '../Components/loader';
import GetLocation from 'react-native-get-location';
import {SwipeListView} from 'react-native-swipe-list-view';
import Toast from 'react-native-toast-message';
import appEvents from '../events/appevents'


const MyOrders = ({navigation}) => {
  const dispatch = useDispatch();
  const data = useSelector(state => state.OrdersManager);
  const [refreshing, setRefreshing] = useState(false);
  const [laod, setLoad] = useState(false);
  const [tab, setTab] = useState(0);

  console.log(
    '------------------------res---------',
    data?.ordersList?.complete_orders,
  );
  const fetchInitialData = async () => {
    setLoad(true);
    try {
      const loc = await GetLocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 60000,
      });

      await fetchData(loc);
    } catch (error) {
      console.error('Error fetching location:', error.code);
      if (error.code === 'UNAVAILABLE') {
      // GPS disabled → prompt user to enable it
      Alert.alert(
        'Enable GPS',
        'Your location service is turned off. Please enable GPS to continue.'
      );
    }
    } finally {
      setLoad(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchData = async loc => {
    setLoad(true);
    try {
      const arg = {latitude: loc?.latitude, longitude: loc?.longitude};
      const res = await dispatch(fetchOrdersData(arg));
      if (res?.payload?.success == true) {
        setLoad(false);
      }
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  };
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    appEvents({
      eventName: 'Refresh Orders',
      payload: {}
    })
    try {
      const loc = await GetLocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 60000,
      });
      await fetchData(loc);
    } catch (error) {
      console.error('Error getting location during refresh:', error.message);
    } finally {
      setRefreshing(false);
    }
  }, []);

  //--------------------------reject order-------------------------
  const onRejectOrder = async id => {
    const res = await dispatch(RejectOrder({transfer_id: id}));
    if (res?.payload?.status==200) {
          Toast.show({
                 type: 'success',
                 text1: res?.payload?.message,
                 position: 'top',
                 visibilityTime: 3000,
                 autoHide: true,
               });
       fetchInitialData();
    } else {
         Toast.show({
                type: 'info',
                text1: res?.payload?.message,
                position: 'top',
                visibilityTime: 3000,
                autoHide: true,
              });
      
    }
  };

  if (data?.loading || laod) {
    return (
      <View style={{flex: 1}}>
        <Appbar.Header
          style={{justifyContent: 'space-between', backgroundColor: '#D71828'}}>
          <Appbar.BackAction
            onPress={() => {
              navigation.goBack();
            }}
            color="white"
          />
          <Appbar.Content
            title="My Orders"
            color="white"
            titleStyle={{textAlign: 'center'}}
          />
          <Appbar.Action
            icon="home"
            color="white"
            size={30}
            onPress={() => {
              navigation.navigate('Home');
            }}
          />
        </Appbar.Header>
        <Loader />
      </View>
    );
  } else {
    return (
      <View style={styles.container}>
        <Appbar.Header
          style={{justifyContent: 'space-between', backgroundColor: '#D71828'}}>
          <Appbar.BackAction
            onPress={() => {
              navigation.goBack();
            }}
            color="white"
          />
          <Appbar.Content
            title="My Orders"
            color="white"
            titleStyle={{textAlign: 'center'}}
          />
          <Appbar.Action
            icon="home"
            color="white"
            size={30}
            onPress={() => {
              navigation.navigate('Home');
            }}
          />
        </Appbar.Header>

        <View style={styles.topHeader}>
          <TouchableOpacity
            style={{alignItems: 'center', width: '50%'}}
            onPress={() => {
              setTab(0)
              appEvents({
                eventName: 'Switch to Pending Orders',
                payload: {}
              })
            }}>
            <Text
              style={[styles.headerText, {marginBottom: tab == 1 ? 10 : 0}]}>
              Pending Orders
            </Text>
            {tab == 0 && (
              <View
                style={{
                  height: 5,
                  borderRadius: 10,
                  width: 150,
                  backgroundColor: '#fff',
                  marginTop: 5,
                  alignSelf: 'center',
                }}></View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={{alignItems: 'center', width: '50%'}}
            onPress={() => {
              setTab(1)
              appEvents({
                eventName: 'Switch to Complete Orders',
                payload: {}
              })
            }}>
            <Text
              style={[styles.headerText, {marginBottom: tab == 0 ? 10 : 0}]}>
              Complete Orders
            </Text>
            {tab == 1 && (
              <View
                style={{
                  height: 5,
                  borderRadius: 10,
                  width: 150,
                  backgroundColor: '#fff',
                  marginTop: 5,
                  alignSelf: 'center',
                }}></View>
            )}
          </TouchableOpacity>
        </View>
        {tab == 0 ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }>
            {data?.ordersList?.orders?.length > 0 ? (
              <SwipeListView
                data={data?.ordersList?.orders}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({item: order}) => (
                  <View style={styles.listItemContainer}>
                    <List.Item
                      title={`Order #${order?.order_id}`}
                      description={() => (
                        <View>
                          {order?.shopname && (
                            <Text style={{color: '#000', fontWeight: '500'}}>
                              Shop: {order?.shopname}
                            </Text>
                          )}
                          <Text>Name: {order?.user_name}</Text>
                        </View>
                      )}
                      onPress={() => {
                        appEvents({
                          eventName: 'View Order Details',
                          payload: { order_id: order?.order_id }
                        })
                        navigation.navigate('OrderDetails', {details: order});
                      }}
                      left={props => (
                        <Avatar.Icon
                          size={40}
                          icon="package-variant-closed"
                          color="#fff"
                          style={{marginLeft: 10, backgroundColor: '#D71828'}}
                        />
                      )}
                      right={props => (
                        <View style={{marginTop: 0}}>
                          <Text>{order?.distance} km</Text>
                          <Text>{order?.time} min</Text>
                        </View>
                      )}
                      style={styles.item}
                    />
                    {order?.delivery_status == 2 && (
                      <View style={styles.absoluteRedBox}>
                        <Text style={styles.ongoingText}>Ongoing</Text>
                      </View>
                    )}
                  </View>
                )}
                renderHiddenItem={({item}) => (
                  <View style={styles.rowBack}>
                    <TouchableOpacity
                      style={[styles.backRightBtn, styles.backBtn]}
                      onPress={() => onRejectOrder(item?.transfer_order_id)}>
                      {data?.rejectLoading ? (
                        <ActivityIndicator size={'small'} color={'#fff'} />
                      ) : (
                        <Text style={styles.backTextWhite}>Reject Order</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
                rightOpenValue={-75} // swipe left to open reject
                disableRightSwipe={true} // only allow left swipe
              />
            ) : (
              <>
                <Image
                  style={[
                    {
                      height: 400,
                      width: '100%',
                      alignSelf: 'center',
                      resizeMode: 'contain',
                      marginTop: '10%',
                    },
                  ]}
                  source={require('../assets/noOrders.jpg')}
                />
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: 20,
                    fontWeight: '500',
                  }}>
                  Opps! No Order Found
                </Text>
              </>
            )}
          </ScrollView>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }>
            {data?.ordersList?.complete_orders?.length > 0 ? (
              <List.Section>
                {data?.ordersList?.complete_orders?.map((order, index) => (
                  <View
                    key={index}
                    style={[styles.listItemContainer, {marginBottom: 5}]}>
                    <List.Item
                      key={index}
                      title={`Order #${order?.order_id}`}
                      description={() => (
                        <View>
                          <Text style={{color: '#000', fontWeight: '500'}}>
                            Shop: {order?.shopname}
                          </Text>
                          <Text>Name: {order?.user_name}</Text>
                        </View>
                      )}
                      left={props => (
                        <Avatar.Icon
                          size={40}
                          icon="package-variant-closed"
                          color="#fff"
                          style={{marginLeft: 10, backgroundColor: '#D71828'}}
                        />
                      )}
                      right={props => (
                        <View style={{marginTop: 0}}>
                          <Text>{order?.distance} km</Text>
                          <Text>
                            {order?.delivery_status === 4
                              ? 'Completed'
                              : order?.delivery_status === 5
                              ? 'Rejected'
                              : ''}
                          </Text>

                          {/* <Text >{order?.time} min</Text> */}
                        </View>
                      )}
                      style={styles.item}></List.Item>
                  </View>
                ))}
              </List.Section>
            ) : (
              <>
                <Image
                  style={[
                    {
                      height: 400,
                      width: '100%',
                      alignSelf: 'center',
                      resizeMode: 'contain',
                      marginTop: '10%',
                    },
                  ]}
                  source={require('../assets/noOrders.jpg')}
                />
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: 20,
                    fontWeight: '500',
                  }}>
                  Opps! No Order Found
                </Text>
              </>
            )}
          </ScrollView>
        )}
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
    backgroundColor: '#ecf8d5',
    borderRadius: 10,
    marginBottom: 10,
    elevation: 5,
    margin: 10,
  },
  absoluteRedBox: {
    position: 'absolute',
    width: 80,
    height: 20,
    backgroundColor: '#D71828',
    top: -5,
    right: 10,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listItemContainer: {
    position: 'relative',
    marginBottom: 5,
  },
  ongoingText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '700',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#D71828',
    marginTop: 'auto',
  },
  headerText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '700',
  },
  rowBack: {
    alignItems: 'center',
    backgroundColor: '#DDD',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end', // align reject button to right
    paddingRight: 15,
    margin: 15,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  backBtn: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    width: 75,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  backRightBtn: {
    backgroundColor: 'red',
    right: 0,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  backTextWhite: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});
export default MyOrders;
