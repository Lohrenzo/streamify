"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import { useReducer } from "react";
import AppContext from "./state/Context";
import { appReducer, initialState } from "./state/Reducer";

export function Providers({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <SessionProvider>
      <AppContext.Provider value={{ state, dispatch }}>
        {children}
        <Toaster
          position="bottom-right"
          reverseOrder={false}
          gutter={8}
          toastOptions={{
            className: "",
            duration: 5000,
            removeDelay: 1000,
            style: {
              background: "#000e33ff",
              color: "#b4b4b4ff",
            },
          }}
        />
      </AppContext.Provider>
    </SessionProvider>
  );
}
