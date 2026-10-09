import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { Shell } from '@/components/layout/Shell';

export const metadata: Metadata = {
  title: 'AI Wardrobe Suggestor | Intelligent Fashion & Styling',
  description: 'AI-powered wardrobe digitization, outfit recommendations, and smart style curation.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#09090b] text-neutral-100 selection:bg-amber-400 selection:text-black">
        <AppProvider>
          <Shell>{children}</Shell>
        </AppProvider>
      </body>
    </html>
  );
}
