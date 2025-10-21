import type { Metadata } from "next";
import { Roboto_Mono, Fahkwang } from "next/font/google";
import "./globals.css";

import { Providers } from "@/app/providers";
import Nav from "./components/Nav";
import VideoUpload from "./components/VideoUpload";

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

const fahkwang = Fahkwang({
  subsets: ["latin-ext"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Streaming App",
  description: "A video streaming app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`
         ${robotoMono.className} antialiased static`}
      >
        <Providers>
          <div className="min-h-dvh pb-16">
            {children}
            {/* <Footer /> */}
          </div>
          <VideoUpload />
          <Nav />
        </Providers>
      </body>
    </html>
  );
}
