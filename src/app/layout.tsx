import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kalkulator TOPSIS | 3D Liquid Glass Studio',
  description:
    'Sistem Pendukung Keputusan interaktif metode TOPSIS (Hwang & Yoon, 1981) dengan desain 3D Liquid Glass, efek emboss bayangan, dan tipografi Poppins.'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" data-theme="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
