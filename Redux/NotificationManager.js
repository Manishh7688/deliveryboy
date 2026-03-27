import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import {BASE_URL,AUTH}  from "../Constant";
import AsyncStorage from '@react-native-async-storage/async-storage';

//------ declare initial state
const initialState = {
  notifications: [],
  loading: false,
  error: '',
  networkError:false
}


//-------- create the thunk --------
export const fetchNotificationsData = createAsyncThunk('notifications/fetch', async () => { 
  const formData = new FormData();
  formData.append('email', await AsyncStorage.getItem("AdminEmail"));
  formData.append('password', await AsyncStorage.getItem("AdminPassword"));
  try {
    const response = await axios({
      url: BASE_URL + 'admin_notifications',
      method: 'POST',
      data: formData,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'multipart/form-data',
        'Authorization': AUTH
      }
    });
    return response.data.data;
  } catch (error) {
    return error;
  }
}
)

const NotificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNetworkError: (state, action) => {
      state.adminData.password = action.payload
  },
  },
  extraReducers: (builder) => {
    // Add reducers for additional action types here, and handle loading state as needed
    builder.addCase(fetchNotificationsData.pending, (state) => {
      state.loading = true
    })
    builder.addCase(fetchNotificationsData.fulfilled, (state, action) => {
      state.loading = false
      state.notifications = action.payload
      state.error = ''
    })
    builder.addCase(fetchNotificationsData.rejected, (state, action) => {
      state.loading = false
      state.notifications = []
      state.error = action.error.message
    })
  },
});
export const {setNetworkError } = NotificationsSlice.actions

export default NotificationsSlice.reducer;