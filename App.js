import React, { useEffect, useRef, useState } from 'react';
import {
  MD3LightTheme as DefaultTheme,
  Provider as PaperProvider,
} from 'react-native-paper';
import { Provider } from 'react-redux';
import { LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import NetInfo from '@react-native-community/netinfo';
import Toast from 'react-native-toast-message';
import notifee, { AndroidImportance } from '@notifee/react-native';
import analytics from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';
import ErrorBoundary from './Components/ErrorBoundary';

import { store } from './Redux/RootStore';
import { setNavigationRef } from './Redux/AuthMiddleware';

import HomeScreen from './Screen/Home';
import LoginScreen from './Screen/Login';
import SplashScreen from './Screen/Splash';
import Sidebar from './Screen/Sidebar';
import SuccessScreen from './Screen/Success';
import OrderDetails from './Screen/OrderDetails';
import MyOrders from './Screen/Orders';
import OrderProductsListScreen from './Screen/Products';
import CompleteOrder from './Screen/CompleteOrder';

import { NoConnection } from './Components/NoConnection';
import withLocationPermission from './Components/WithLocationPermission';

LogBox.ignoreAllLogs();

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

/* -------------------- Drawer -------------------- */
const MyDrawer = () => (
  <Drawer.Navigator
    screenOptions={{ headerShown: false }}
    drawerContent={props => <Sidebar {...props} />}
  >
    <Drawer.Screen name="Homes" component={HomeScreen} />
  </Drawer.Navigator>
);

/* -------------------- Theme -------------------- */
const theme = {
  ...DefaultTheme,
  mode: 'adaptive',
  colors: {
    primary: '#D71828',
    onPrimary: '#fff',
    surfaceVariant: '#fff',
  },
};

/* -------------------- App -------------------- */
const App = () => {
  const navigationRef = useRef(null);
  const routeNameRef = useRef(null);
  const [isConnected, setIsConnected] = useState(true);

  /* ---------- Notifee Channel ---------- */
  useEffect(() => {
    async function createChannel() {
      await notifee.createChannel({
        id: 'oswal_boy',
        name: 'Default Channel',
        importance: AndroidImportance.HIGH,
      });
    }
    createChannel();

    // Initialize Crashlytics
    crashlytics().setCrashlyticsCollectionEnabled(true);
  }, []);

  /* ---------- Network Check ---------- */
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(!!state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  /* ---------- Retry Network ---------- */
  const retryConnection = () => {
    NetInfo.fetch().then(state => {
      setIsConnected(!!state.isConnected);
    });
  };

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <PaperProvider theme={theme}>
          <NavigationContainer
            ref={navigationRef}
            onReady={() => {
              const currentRoute =
                navigationRef.current?.getCurrentRoute()?.name;

              routeNameRef.current = currentRoute;

              // store navigation ref globally
              setNavigationRef(navigationRef.current);
            }}
            onStateChange={async () => {
              const previousRoute = routeNameRef.current;
              const currentRoute =
                navigationRef.current?.getCurrentRoute()?.name;

              if (previousRoute !== currentRoute && currentRoute) {
                await analytics().logScreenView({
                  screen_name: currentRoute,
                  screen_class: currentRoute,
                });

                // Log screen to Crashlytics for screen-wise tracking
                crashlytics().setAttribute('current_screen', currentRoute);
              }

              routeNameRef.current = currentRoute;
            }}
          >
            <Stack.Navigator
              initialRouteName="Splash"
              screenOptions={{ headerShown: false }}
            >
              <Stack.Screen name="Splash" component={SplashScreen} />
              <Stack.Screen
                name="Home"
                component={withLocationPermission(MyDrawer)}
              />
              <Stack.Screen
                name="Login"
                component={withLocationPermission(LoginScreen)}
              />
              <Stack.Screen
                name="Success"
                component={withLocationPermission(SuccessScreen)}
              />
              <Stack.Screen
                name="OrderDetails"
                component={withLocationPermission(OrderDetails)}
              />
              <Stack.Screen
                name="MyOrders"
                component={withLocationPermission(MyOrders)}
              />
              <Stack.Screen
                name="OrderProductsListScreen"
                component={withLocationPermission(OrderProductsListScreen)}
              />
              <Stack.Screen
                name="CompleteOrder"
                component={withLocationPermission(CompleteOrder)}
              />
            </Stack.Navigator>

            <Toast />
          </NavigationContainer>

          {!isConnected && (
            <NoConnection retryConnection={retryConnection} />
          )}
        </PaperProvider>
      </Provider>
    </GestureHandlerRootView>
    </ErrorBoundary>
  );
};

export default App;
