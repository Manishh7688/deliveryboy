import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import {  BASE_URL1 } from "./Constant";
import AsyncStorage from '@react-native-async-storage/async-storage';

//------ declare initial state
const initialState = {
  ordersList:[],
  ordersDetails:[],
  productsDetails:[],
  startDelivery: [],
  loading: false,
  error: '',
  rejectLoading:false
}

//-------- fetchOrdersData--------
export const fetchOrdersData = createAsyncThunk('orders/fetch', async (arg,thunkAPI) => {
  const auth = await AsyncStorage.getItem("Auth")
   const lat=arg.latitude
   const long=arg.longitude
   const formdata = new FormData()
   formdata.append('latitude',lat)
   formdata.append('longitude',long)
   console.log("=================formdata complete====================",auth);
   
  try {
    const response = await axios({
      url: BASE_URL1 + `delivery-boy/order-list`,
      method: 'POST',
      data:formdata,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'multipart/form-data',
        'Authorization':`Bearer ${auth}`
      }
    });
    // console.log(response?.data,"------------------------res---------",response?.data?.orders);
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
//-------- fetchOrders details--------
export const fetchOrdersDetails = createAsyncThunk('fetchOrdersDetails/fetch', async (arg,thunkAPI) => {
  const auth = await AsyncStorage.getItem("Auth")   
  try {
    const response = await axios({
      url: BASE_URL1 + `delivery-boy/order-detail?transfer_id=${arg.transfer_id}&latitude=${arg.lat}&longitude=${arg.long}`,
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'multipart/form-data',
        'Authorization':`Bearer ${auth}`
      }
    });
    // console.log(response?.data,"------------------------res---------");
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
//-------- fetchProduct details--------
export const fetchProductsDetails = createAsyncThunk('fetchProductsDetails/fetch', async (arg,thunkAPI) => {
  const auth = await AsyncStorage.getItem("Auth")
   
  try {
    const response = await axios({
      url: BASE_URL1 + `delivery-boy/product-details?order_id=${arg}`,
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'multipart/form-data',
        'Authorization':`Bearer ${auth}`
      }
    });
    // console.log(response?.data,"------------------------res---------");
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
//-------- StartRide --------
export const StartRide = createAsyncThunk('StartRide/fetch', async (arg, thunkAPI) => {
  const formData = new FormData();
  const auth = await AsyncStorage.getItem("Auth")
  formData.append('transfer_id', arg.transfer_id);
  formData.append('latitude', arg.lat);
  formData.append('longitude', arg.long);
  formData.append('ride', arg.ride);

  try {
    const response = await axios({
      url: BASE_URL1 + 'delivery-boy/start-delivery',
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
//-------- CompleteRide --------
export const CompleteRide = createAsyncThunk('CompleteRide/fetch', async (arg, thunkAPI) => {
  const formData = new FormData();
  const auth = await AsyncStorage.getItem("Auth")
  formData.append('transfer_id', arg.transfer_id);
  formData.append('paymentType', arg.payment_type);
  if (arg.image)
    formData.append('image', {
      name: 'image.jpg',
      type: 'image/jpg',
      fileName: 'image.jpg',
      uri: Platform.OS === 'ios' ? arg.image.replace('file://', '') : arg.image,
    });
  formData.append('latitude', arg.latitude);
  formData.append('longitude', arg.longitude);
  // console.log("=================formdata complete====================",formData);
  
  try {
    const response = await axios({
      url: BASE_URL1 + 'delivery-boy/complete-order',
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

//========================reject order======================

export const RejectOrder = createAsyncThunk('RejectOrder', async (arg, thunkAPI) => {
  const formData = new FormData();
  const auth = await AsyncStorage.getItem("Auth") 
  formData.append('transfer_id', arg.transfer_id);
  console.log("=================formdata complete====================",auth);
  
  try {
    const response = await axios({
      url: BASE_URL1 + 'delivery-boy/order-reject',
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

const OrdersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
  },
  extraReducers: (builder) => {
    //------------ fetchOrdersData ---------------
    builder.addCase(fetchOrdersData.pending, (state) => {
      state.loading = true
    })
    builder.addCase(fetchOrdersData.fulfilled, (state, action) => {
      state.loading = false
      state.ordersList = action.payload.data
      state.error = ''
    })
    builder.addCase(fetchOrdersData.rejected, (state, action) => {
      state.loading = false
      state.ordersList = []
      state.error = action.error.message
    })
    //------------ fetchOrdersDetailsData ---------------
    builder.addCase(fetchOrdersDetails.pending, (state) => {
      state.loading = true
    })
    builder.addCase(fetchOrdersDetails.fulfilled, (state, action) => {
      state.loading = false
      state.ordersDetails = action.payload.orders
      state.error = ''
    })
    builder.addCase(fetchOrdersDetails.rejected, (state, action) => {
      state.loading = false
      state.ordersDetails = []
      state.error = action.error.message
    })
    //------------ fetchOrdersDetailsData ---------------
    builder.addCase(fetchProductsDetails.pending, (state) => {
      state.loading = true
    })
    builder.addCase(fetchProductsDetails.fulfilled, (state, action) => {
      state.loading = false
      state.productsDetails = action.payload.data
      state.error = ''
    })
    builder.addCase(fetchProductsDetails.rejected, (state, action) => {
      state.loading = false
      state.productsDetails = []
      state.error = action.error.message
    })
    //------------ StartRide ---------------
    builder.addCase(StartRide.pending, (state) => {
      state.loading = true
    })
    builder.addCase(StartRide.fulfilled, (state, action) => {
      state.loading = false
      state.startDelivery = action.payload.data
      state.error = ''
    })
    builder.addCase(StartRide.rejected, (state, action) => {
      state.loading = false
      state.startDelivery =[]
      state.error = action.error.message
    })
    //------------ CompleteRide ---------------
    builder.addCase(CompleteRide.pending, (state) => {
      state.loading = true
    })
    builder.addCase(CompleteRide.fulfilled, (state, action) => {
      state.loading = false
      state.error = ''
    })
    builder.addCase(CompleteRide.rejected, (state, action) => {
      state.loading = false
      state.error = action.error.message
    })
    //------------ reject order ---------------
    builder.addCase(RejectOrder.pending, (state) => {
      state.rejectLoading = true
    })
    builder.addCase(RejectOrder.fulfilled, (state, action) => {
      state.rejectLoading = false
      state.error = ''
    })
    builder.addCase(RejectOrder.rejected, (state, action) => {
      state.rejectLoading = false
      state.error = action.error.message
    })
  },
});

export default OrdersSlice.reducer;