import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';


const inter = Inter({ subsets: ['latin'] });


export const metadata: Metadata = {
  title: 'Умный AI-ассистент',
  description: 'Создайте своего AI-ассистента с JavaScript и OpenAI',
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <header className="bg-white border-b p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold">Умный AI-ассистент</h1>
            <span className="text-sm text-gray-600">На базе OpenAI</span>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
