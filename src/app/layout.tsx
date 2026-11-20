import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mentora | Teacher Session Booking Platform',
  description: 'Teacher-Student Session Booking REST API & Multi-Role RBAC Dashboards',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
