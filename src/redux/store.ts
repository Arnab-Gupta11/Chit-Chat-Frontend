import { configureStore } from "@reduxjs/toolkit";
import { apiClient } from "./apiClient/apiClient";
import authReducer from "./features/auth/authSlice";

export const store = configureStore({
  reducer: {
    [apiClient.reducerPath]: apiClient.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiClient.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
