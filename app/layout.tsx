import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nightfly | Club Booking',
  description: 'Nightfly booking platform for clubs'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <main>
          <div className="container">{children}</div>
        </main>
      </body>
    </html>
  );
}
