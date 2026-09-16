"use client";
import { Provider } from "react-redux";
import { store } from "../redux/store";
import { AppInitializer } from "./AppInitializer";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AppInitializer>{children}</AppInitializer>
    </Provider>
  );
}
