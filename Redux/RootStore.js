import { configureStore, } from '@reduxjs/toolkit'
import logger from 'redux-logger'
import DashManager from './DashManager'
import LoginManager from './LoginManager'
import OrdersManager from './OrdersManager'
import NotificationManager from './NotificationManager'
import { authMiddleware } from './AuthMiddleware'


export const store = configureStore({
  reducer: {
    DashManager: DashManager,
    LoginManager: LoginManager,
    OrdersManager: OrdersManager,
    NotificationManager: NotificationManager,
  },
  // middleware: getDefaultMiddleware => getDefaultMiddleware().concat(logger),
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({ serializableCheck: false }).concat(
      authMiddleware,
      logger
    ),
}) 