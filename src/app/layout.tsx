import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: "ONE MORE TRY! - Think You're Fast? Prove It!",
  description: "High-octane visual reflex game. Spot the odd one out in 15 seconds. Challenge your friends and climb the global leaderboard!",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon.svg",
  },
  openGraph: {
    title: "ONE MORE TRY! - Viral Reflex Game",
    description: "Think you're fast? Prove it! Can you beat my reflex score?",
    type: "website",
    siteName: "ONE MORE TRY!",
  },
  twitter: {
    card: "summary_large_image",
    title: "ONE MORE TRY! - Reflex Rush",
    description: "Can you beat my reflex speed? Spot the odd one before time runs out!",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#080a10",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/icons/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/icon.svg" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function() {});
                });
              }
            `,
          }}
        />
      </head>
      <body className="antialiased bg-[#080a10] text-gray-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
