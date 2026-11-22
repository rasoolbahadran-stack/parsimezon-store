import type { Metadata } from 'next';
import './globals.css';
import Shell from '@/components/Shell';

export const metadata: Metadata = {
  title: 'پنل مدیریت پارسی‌مزون',
  description: 'سیستم مدیریت فروشگاه و محتوا (دمو)',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/parsimezon-store/favicon.svg" type="image/svg+xml" />
      </head>
      <body suppressHydrationWarning>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
