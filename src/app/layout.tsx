import '@/styles/global.css';
import type { Metadata, Viewport } from 'next';
import { Toaster } from '@/components/ui/sonner';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Membrane AI Integration Builder - Generate Custom Integrations',
  description:
    'Build AI-powered integrations for your product in seconds. Membrane helps you connect 3,289+ apps with intelligent code generation.',
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth h-full antialiased">
      <body className="min-h-full">
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
