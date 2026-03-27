import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Image,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {
  Title,
  Subheading,
  IconButton,
  RadioButton,
  Text,
  List,
  Avatar,
  Appbar,
} from 'react-native-paper';
import SwipeButton from 'rn-swipe-button';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ScrollView } from 'react-native-gesture-handler';
import LottieView from 'lottie-react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useSelector, useDispatch } from 'react-redux';
import { CompleteRide } from '../Redux/OrdersManager';
import Toast from 'react-native-toast-message';
import Loader from '../Components/loader';
import appEvents from '../events/appevents'

const CompleteOrder = ({ navigation, route }) => {
  const res = route?.params?.data || '';

  const dispatch = useDispatch();
  const data = useSelector(state => state.OrdersManager);

  const [value, setValue] = React.useState('Cash');
  const [OrderImage, setOrderImage] = React.useState('');
  const [PlaceHolder, setPlaceHolder] = React.useState('Upload Image');

  const chooseFile = () => {
    appEvents({
      eventName: 'Upload Image',
      payload: { order_id: res?.order_id }
    })
    let options = {
      mediaType: 'photo',
      quality: 0.2,
    };

    Alert.alert('Upload Image', 'Choose an option', [
      {
        text: 'Camera',
        onPress: () => {
          launchCamera(options, response => {
            if (!response.didCancel && response.assets) {
              setOrderImage(response.assets[0].uri);
              setPlaceHolder('Replace Image');
            }
          });
        },
      },
      {
        text: 'Gallery',
        onPress: () => {
          launchImageLibrary(options, response => {
            if (!response.didCancel && response.assets) {
              setOrderImage(response.assets[0].uri);
              setPlaceHolder('Replace Image');
            }
          });
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const complete = async () => {
    appEvents({
      eventName: 'Complete Delivery',
      payload: { order_id: res?.order_id, payment_type: value }
    })
    if (!OrderImage) {
      Toast.show({
        type: 'info',
        text1: 'Please upload an image.',
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
      });
      return;
    }
    if (res?.latitude) {
      const arg = {
        latitude: res?.latitude,
        longitude: res?.longitude,
        transfer_id: res?.order_id?.toString(),
        image: OrderImage,
        payment_type: value,
      };
      const response = await dispatch(CompleteRide(arg));
      if (response.payload.status == 200) {
        navigation.navigate('Success');
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
      complete();
    }
  };
  if (data?.loading) {
    return <Loader />;
  } else {
    return (
      <View style={styles.container}>
        <Appbar.Header
          style={{
            justifyContent: 'space-between',
            backgroundColor: '#D71828',
          }}
        >
          <Appbar.BackAction
            onPress={() => {
              navigation.goBack();
            }}
            color="white"
          />
          <Appbar.Content
            title="Drop Order"
            color="white"
            titleStyle={{ textAlign: 'center' }}
          />
          <Appbar.Action icon="bell-outline" color="#D71828" size={30} />
        </Appbar.Header>
        <ScrollView>
          <View style={{ padding: 10 }}>
            <List.Item
              key={'order.id'}
              title={data?.ordersDetails?.payment_type}
              titleStyle={{ fontSize: 18, fontWeight: '700' }}
              left={props => (
                <Avatar.Icon
                  size={40}
                  icon="check"
                  color="#fff"
                  style={{ marginLeft: 10, backgroundColor: '#D71828' }}
                />
              )}
              style={[styles.item, { backgroundColor: '#ecf8d5' }]}
            />
            {!res?.vendor == 'vendor' && (
              <View
                style={{
                  margin: 10,
                  borderColor: '#c5c5c5',
                  borderWidth: 1,
                  padding: 10,
                  borderRadius: 10,
                }}
              >
                <LottieView
                  style={{ width: '40%', alignSelf: 'center',height:30 }}
                  source={require('../assets/rupee.json')}
                  autoPlay
                  loop
                />
                <Text
                  style={{
                    fontSize: 30,
                    fontWeight: '700',
                    marginBottom: 5,
                    textAlign: 'center',
                  }}
                >
                  ₹{data?.ordersDetails?.order_detail?.amount}
                </Text>
                <Image
                  style={{
                    height: 300,
                    width: '100%',
                    textAlign: 'center',
                    alignSelf: 'center',
                    resizeMode: 'contain',
                  }}
                  source={require('../assets/qrOswal.jpg')}
                />
              </View>
            )}
            <View
              style={{
                margin: 10,
                borderColor: '#c5c5c5',
                borderWidth: 1,
                padding: 10,
                borderRadius: 10,
              }}
            >
              {/* {orderDetails.payment_method == "Cash on Delivery" && */}
              <>
                <Text
                  style={{ fontSize: 20, fontWeight: '700', marginBottom: 5 }}
                >
                  Mode of payment
                </Text>

                <RadioButton.Group
                  onValueChange={newValue => {
                    appEvents({
                      eventName: 'Select Payment Mode',
                      payload: { order_id: res?.order_id, payment_mode: newValue }
                    })
                    setValue(newValue)
                  }}
                  value={value}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <RadioButton value="Cash" />
                    <Text>Cash</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <RadioButton value="UPI" />
                    <Text>UPI</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <RadioButton value="User did not accept order" />
                    <Text>User did not accept order</Text>
                  </View>
                </RadioButton.Group>
              </>
              {/* } */}
              <List.Item
                onPress={() => {
                  chooseFile();
                }}
                key={'2'}
                title={PlaceHolder}
                titleStyle={{ fontSize: 18, fontWeight: '700' }}
                left={props => (
                  <Avatar.Icon
                    size={40}
                    icon="camera-image"
                    color="#fff"
                    style={{ marginLeft: 10, backgroundColor: '#D71828' }}
                  />
                )}
                right={props => (
                  <IconButton
                    icon={'chevron-right'}
                    color={'green'}
                    size={30}
                    {...props}
                  />
                )}
                style={[styles.item]}
              />
            </View>
          </View>
        </ScrollView>

        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            complete();
          }}
        >
          <Text style={styles.buttonText}>Complete Delivery</Text>
        </TouchableOpacity>
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
    borderColor: '#c5c5c5',
    borderWidth: 1,
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
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CompleteOrder;
