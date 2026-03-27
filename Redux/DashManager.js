import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import {  BASE_URL1 } from "./Constant";
import AsyncStorage from '@react-native-async-storage/async-storage';

//------ declare initial state
const initialState = {
  dashboard: [],
  loading: false,
  error: '',
  networkError: false,
  default: 1,
  UserStatus:'offline',
  Status:''
}


//-------- create the thunk --------
export const fetchDashData = createAsyncThunk('dash/fetch', async () => {
  const formData = new FormData();
  formData.append('email', await AsyncStorage.getItem("BoyEmail"));
  formData.append('password', await AsyncStorage.getItem("BoyPassword"));
 const auth = await AsyncStorage.getItem("Auth")
  try {
    const response = await axios({
      url: BASE_URL1 + 'delivery-boy/dashboard',
      method: 'GET',
      data: formData,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'multipart/form-data',
        'Authorization':`Bearer ${auth}`
      }
    });
    return response.data.data;
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


// ------------------ UpdateLocation -----------------------------------------------
export const UpdateLocation = createAsyncThunk('UpdateLocation/post', async (arg, thunkAPI) => {
  const rootState = thunkAPI.getState(); // has type YourRootState
  const auth = await AsyncStorage.getItem("Auth")
  const formData = new FormData();
  formData.append('latitude', arg.lati);
  formData.append('longitude', arg.longi);
  // console.log("==============location data api ----------------",auth,formData);
  
  try {
      const response = await axios({
          url: BASE_URL1 + 'delivery-boy/update-current-location',
          method: 'POST',
          data: formData,
          headers: {
              Accept: 'application/json',
              'Content-Type': 'multipart/form-data',
              'Authorization':`Bearer ${auth}`
          }
      });
      return response.data;
  } catch (error) {
      return error;
  }
}
)
const DashSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setNetworkError: (state, action) => {
      state.adminData.password = action.payload
    },
    setDefault: (state, action) => {
      state.default = action.payload
    },
    setStatus:(state,action)=>{
      state.UserStatus = action.payload
    }
  },
  extraReducers: (builder) => {
    // Add reducers for additional action types here, and handle loading state as needed
    builder.addCase(fetchDashData.pending, (state) => {
      state.loading = true
    })
    builder.addCase(fetchDashData.fulfilled, (state, action) => {
      state.loading = false
      state.dashboard = action.payload
      state.error = ''
    })
    builder.addCase(fetchDashData.rejected, (state, action) => {
      state.loading = false
      state.dashboard = []
      state.error = action.error.message
    })
    ///------ UpdateLocation ------------------
    builder.addCase(UpdateLocation.pending, (state) => {
      console.log('rejected')
  })
  builder.addCase(UpdateLocation.fulfilled, (state, action) => {
      state.loading = false
      state.Status =action?.payload?.delivery_boy_status
  })
  builder.addCase(UpdateLocation.rejected, (state, action) => {
      state.loading = false

  })
  },
});
export const { setNetworkError, setDefault } = DashSlice.actions

export default DashSlice.reducer;