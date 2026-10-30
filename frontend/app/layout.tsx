import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'LexDrift | Autonomous Legal & Governance Policy Drift Sentinel on GenLayer',
  description: 'Decentralized multi-snapshot legal and governance policy drift sentinel deployed on GenLayer StudioNet. Verifies observable covenants, substring containment proofs, and pull-credit restitution.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-lex-950 text-gray-100 flex flex-col antialiased selection:bg-gold-500/30 selection:text-gold-200">
        <Navbar />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
