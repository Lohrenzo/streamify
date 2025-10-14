"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
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
          success: {
            duration: 3000,
            iconTheme: {
              primary: "green",
              secondary: "black",
            },
          },
        }}
      />
    </SessionProvider>
  );
}
