import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import {  BASE_URL1 } from "./Constant";
import { getUniqueId } from 'react-native-device-info';
import AsyncStorage from '@react-native-async-storage/async-storage';


//------ declare initial state
const initialState = {
    boyData: {
        email: '',
        emailError: '',
        passwordError: '',
        password: '',
        apiStatus: '',
        apiMsg: '',
        BoyImage: false,
    },
    image: "",
    response: [],
    loading: false,
    error: '',
}

//-------- create the thunk --------
export const Login = createAsyncThunk('login', async (arg, thunkAPI) => {
    const rootState = thunkAPI.getState(); // has type YourRootState
    console.log('email -----' + rootState.LoginManager.boyData.email)
    const deviceId = await getUniqueId()
    var email = arg.email;
    var password = arg.password;
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    formData.append('device_token', deviceId);
    console.log('device token -----' ,deviceId)
    try {
        const response = await axios({
            url: BASE_URL1 + 'delivery-boy/login',
            method: 'POST',
            data: formData,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'multipart/form-data',
                // 'Authorization': AUTH

            }
        });
        return response.data;
    } catch (error) {
        if (error.response) {
            console.error('Error Status:', error.response.status);
            console.error('Error Data:', error.response.data);
          } else if (error.request) {
            console.error('Error Request:', error.request);
          } else {
            console.error('Error Message:', error.message);
          }
        return error;
    }
}
)
//-------- create the logout --------
export const LogoutUser = createAsyncThunk('LogoutUser', async (arg, thunkAPI) => {
    const rootState = thunkAPI.getState(); // has type YourRootState
    console.log('email -----' + rootState.LoginManager.boyData.email)
    const auth = await AsyncStorage.getItem("Auth")
    
    try {
        const response = await axios({
            url: BASE_URL1 + 'delivery-boy/logout',
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'multipart/form-data',
               'Authorization':`Bearer ${auth}`

            }
        });
        return response.data;
    } catch (error) {
        if (error.response) {
            console.error('Error Status:', error.response.status);
            console.error('Error Data:', error.response.data);
          } else if (error.request) {
            console.error('Error Request:', error.request);
          } else {
            console.error('Error Message:', error.message);
          }
        return error;
    }
}
)

//----------post fcm token-------------------------------
export const sendFcm = createAsyncThunk('sendFcm', async (arg, thunkAPI) => {
    var deviceId = await getUniqueId();
    const formData = new FormData();
    const userId = await AsyncStorage.getItem("UserId")
    if (userId!=null) {
      formData.append('delivery_boy_id',userId);
    }
    formData.append('fcm_token',arg);
    formData.append('device_id',deviceId);
    try {
      const response = await axios({
        url: BASE_URL1 + 'delivery-boy/update-fcm',
        method: 'POST',
        data: formData,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
        }
      });
      console.log('response fcm-----------------FFF----------------------------------',JSON.stringify(response.data))
      return response.data;
    } catch (error) {
      if (error.response) {
        console.error('Error Status:', error.response.status);
        console.error('Error Data:', error.response.data);
      } else if (error.request) {
        console.error('Error Request:', error.request);
      } else {
        console.error('Error Message:', error.message);
      }
      return error;
    }
  }
  )

const LoginSlice = createSlice({
    name: 'boyData',
    initialState,
    reducers: {
        setEmail: (state, action) => {
            state.boyData.email = action.payload
            //-----email validation ------
            let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
            if (reg.test(action.payload) === false) {
                state.boyData.emailError = 'Email address is invalid!'
            } else {
                state.boyData.emailError = ''
            }

        },
        setPassword: (state, action) => {
            if (action.payload) {
                state.boyData.passwordError = ''
            }
            state.boyData.password = action.payload
        },
        setError: (state, action) => {
            state.error = action.payload

        },
        setBoy: (state, action) => {
            state.boyData.isAdminLogin = action.payload

        },
        setName: (state, action) => {
            state.name = action.payload

        },
        setEmailError: (state, action) => {
            state.boyData.emailError = action.payload

        },
        setPasswordError: (state, action) => {
            state.boyData.passwordError = action.payload

        },
    },
    extraReducers: (builder) => {
        // Add reducers for additional action types here, and handle loading state as needed
        builder.addCase(Login.pending, (state) => {
            state.loading = true
        })
        builder.addCase(Login.fulfilled, (state, action) => {
            if (action.payload.success == true) {
                state.loading = false
                state.response = action.payload.data
                state.BoyImage = action.payload.image
                state.error = ''
            } else {
                state.loading = false
                state.error = action.payload.message
            }
        })
        builder.addCase(Login.rejected, (state, action) => {
            state.loading = false
            state.response = []
            state.error = action.error.message
        })
        // logout
        builder.addCase(LogoutUser.pending, (state) => {
            state.loading = true
        })
        builder.addCase(LogoutUser.fulfilled, (state, action) => {
                state.loading = false
                state.error = ''
            
        })
        builder.addCase(LogoutUser.rejected, (state, action) => {
            state.loading = false
            state.error = action.error.message
        })
          //---send fcm ----------
    builder.addCase(sendFcm.pending, (state) => {
        state.loading = true
      })
      builder.addCase(sendFcm.fulfilled, (state, action) => {
        state.loading = false
        state.error = ''
      })
      builder.addCase(sendFcm.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
    
    },
});
export const { setEmail, setPassword, setError, setBoy, setName, setEmailError, setPasswordError } = LoginSlice.actions

export default LoginSlice.reducer;