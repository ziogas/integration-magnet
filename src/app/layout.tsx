import '@/styles/global.css';
import type { Metadata, Viewport } from 'next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'NextJS template',
  description: 'NextJS template',
  icons: [
    // { rel: 'apple-touch-icon', url: '/apple-touch-icon.png' },
    // { rel: 'icon', sizes: '32x32', url: '/favicon-32x32.png' },
    // { rel: 'icon', sizes: '16x16', url: '/favicon-16x16.png' },
  ],
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-gray-50 text-gray-950 scroll-smooth h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
