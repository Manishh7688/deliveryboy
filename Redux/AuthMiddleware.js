import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { LogoutUser, setBoy, setName } from './LoginManager';
import { CommonActions } from '@react-navigation/native';

let navigationRef = null;

// Set navigation reference from App.js
export const setNavigationRef = ref => {
    navigationRef = ref;
};

// Middleware logic
export const authMiddleware = store => next => async action => {
    const result = next(action);

    const payload = action?.payload;

    // Only logout when isactive is explicitly === 0
    if (
        action.type.endsWith('/fulfilled') &&
        payload &&
        payload.isactive === 0
    ) {
        console.warn('⚠️ User marked as inactive (isactive === 0). Logging out...');

        try {
           const response = await store.dispatch(LogoutUser())
        if (response?.payload?.success==true) {
            await AsyncStorage.clear()
           await store.dispatch(setBoy(false))
            await store.dispatch(setName(''))
            Toast.show({
          type: 'success',
          text1: response?.payload?.message,
          position: 'top',
          visibilityTime: 3000,
          autoHide: true,
        });
           if (navigationRef) {
                    navigationRef.dispatch(
                        CommonActions.reset({
                            index: 0,
                            routes: [{ name: 'Login' }], // Or 'VLogin' depending on role
                        })
                    );
                }
        }else{
            Toast.show({
          type: 'info',
          text1: response?.payload?.message,
          position: 'top',
          visibilityTime: 3000,
          autoHide: true,
        });
        }

        } catch (err) {
            console.error('Logout error:', err);
        }
    }

    // Handle 401 unauthenticate errors from API calls in fulfilled actions (when error is returned in payload)
    if (
        action.type.endsWith('/fulfilled') &&
        payload &&
        payload.response &&
        payload.response.status === 401 &&
        payload.response.data.message === 'Unauthenticated.'
    ) {
        console.warn('⚠️ API returned 401 Unauthenticated. Logging out...');

        try {
           
                await AsyncStorage.clear();
                await store.dispatch(setBoy(false));
                await store.dispatch(setName(''));
                if (navigationRef) {
                    navigationRef.dispatch(
                        CommonActions.reset({
                            index: 0,
                            routes: [{ name: 'Login' }],
                        })
                    );
                }
        } catch (err) {
            console.error('Logout error:', err);
        }
    }



    return result;
};
