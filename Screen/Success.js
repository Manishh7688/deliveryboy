import React, { useState, useEffect } from 'react';
import { View, Image, Text } from 'react-native';
import LottieView from 'lottie-react-native';

const Success = ({ navigation }) => {
    useEffect(() => {
        setTimeout(() => {
            navigation.replace('Home');
        }, 3000);
    }, []);
    return (
        <View style={{ flex: 1, backgroundColor: '#00000000',}}>
            <LottieView
                style={{ width: "100%",height:400, alignSelf: 'center' }}
                source={require('../assets/received.json')}
                autoPlay
            />
            
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <LottieView
                    style={{ width: "20%", alignSelf: 'center',height:100 }}
                    source={require('../assets/checked.json')}
                    autoPlay
                    
                />
                <Text style={{ fontSize: 30, fontWeight: '700', textAlign: 'center' }}>Order Delivered</Text>
            </View>
           
        </View>

    );
};
export default Success

