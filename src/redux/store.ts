import { configureStore } from "@reduxjs/toolkit";
import { apiClient } from "./apiClient/apiClient";
import authReducer from "./features/auth/authSlice";
import chatUiReducer from "./features/chatUi/chatUiSlice";

export const store = configureStore({
  reducer: {
    [apiClient.reducerPath]: apiClient.reducer,
    auth: authReducer,
    chatUi: chatUiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiClient.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
