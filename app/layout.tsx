import type { Metadata } from 'next';
import { IBM_Plex_Sans } from 'next/font/google';
import { inter } from '@/lib/fonts';
import { TemplateLayout } from '@/components/custom/template-layout';
import '@/app/globals.css';
import '@deriv-com/smartcharts-champion/dist/smartcharts.css';
import './custom.css';

// SmartCharts declares `font-family: IBM Plex Sans, sans-serif` internally.
const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-ibm-plex-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Deriv Accumulators Trading App',
  description: 'A white-label accumulator trading application powered by Deriv',
  icons: {
    icon: [
      { url: '/logo.png', type: 'image/png' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full lg:h-auto" suppressHydrationWarning>
      <body
        className={`${inter.className} ${ibmPlexSans.variable} bg-background flex min-h-dvh flex-col overflow-hidden max-lg:h-dvh max-lg:overflow-hidden lg:block lg:h-auto lg:min-h-screen lg:overflow-x-hidden lg:overflow-y-auto`}
      >
        <TemplateLayout>{children}</TemplateLayout>
      </body>
    </html>
  );
}
