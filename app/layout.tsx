import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../components/AuthProvider';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Digital Hallmark Dashboard',
  description: 'Next.js admin portal for analytics, users, and reports.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Toaster position="top-right" />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
