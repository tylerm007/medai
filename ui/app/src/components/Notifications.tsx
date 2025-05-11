"use client";

import { Toaster } from "react-hot-toast";

export default function Notifications() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        className: "!bg-white !text-gray-800 !shadow-lg !rounded-xl",
        error: {
          iconTheme: {
            primary: "#EF4444",
            secondary: "#fff",
          },
        },
      }}
    />
  );
}
