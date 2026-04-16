import './globals.css';

export const metadata = {
  title: 'A#100210 Dashboard',
  description: 'Manage and track your project tasks with ease.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <main>{children}</main>
      </body>
    </html>
  );
}
