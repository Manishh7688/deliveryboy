import React, { useState, useEffect } from 'react';
import { View, } from 'react-native';
import LottieView from 'lottie-react-native';

const Loader = ({ }) => {

    return (
        <View style={{ flex: 1, backgroundColor: '#00000000', justifyContent: 'center' }}>
            <LottieView
                style={{ width: "70%", alignSelf: 'center',height:200 }}
                source={require('../assets/loader23.json')}
                autoPlay
                loop
            />
        </View>

    );
};
export default Loader

