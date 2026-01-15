import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from '@/lib/contexts/AuthContext';
import { ToastProvider } from '@/lib/contexts/ToastContext';
import { UserPreferencesProvider } from '@/lib/contexts/UserPreferencesContext';
import { ReadBooksProvider } from '@/lib/contexts/ReadBooksContext';
import ToastContainer from '@/components/ToastContainer';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Bookdart - Track your reading journey",
  description: "A clean, simple way to track the books you've read, discover new favorites, and build your personal reading timeline.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <UserPreferencesProvider>
            <ReadBooksProvider>
              <ToastProvider>
                {children}
                <ToastContainer />
              </ToastProvider>
            </ReadBooksProvider>
          </UserPreferencesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
