import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'Freelancer OS - Document Automation & Management Platform',
    template: '%s | Freelancer OS'
  },
  description: 'An agency-grade, multi-tenant OS for freelancers. Automate client onboarding, quotations, agreements, invoices, requirement forms, and project handovers to premium agency-grade PDFs.',
  keywords: ['freelancer dashboard', 'document automation', 'proposal builder', 'contract generator', 'invoice maker', 'agency template creator', 'freelancer OS'],
  authors: [{ name: 'Freelancer OS Team' }],
  creator: 'Freelancer OS',
  metadataBase: new URL('https://freelancer-os.demo'), // Fallback base URL for metadata
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Freelancer OS',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://freelancer-os.demo',
    title: 'Freelancer OS - Document Automation & Management Platform',
    description: 'Create professional proposals, agreements, requirement forms, invoices, and handovers instantly to premium agency-grade PDFs.',
    siteName: 'Freelancer OS',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Freelancer OS - Document Automation & Management Platform',
    description: 'Agency-grade multi-tenant dashboard to generate proposals, contracts, requirement specs, and invoices.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-black min-h-screen antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
