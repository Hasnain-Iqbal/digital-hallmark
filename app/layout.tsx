import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../components/AuthProvider';

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
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
