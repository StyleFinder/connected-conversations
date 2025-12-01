import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Connected Conversations',
  description: 'A mobile-first card-style conversation app',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
