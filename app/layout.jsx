import localFont from 'next/font/local';
import Link from 'next/link';
import Search from '../components/Search.jsx';
import './globals.css';

const mono = localFont({
  src: './fonts/JetBrainsMono-wght.woff2',
  variable: '--font-mono',
  weight: '100 800',
  display: 'swap',
  fallback: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

export const metadata = {
  ...(SITE_URL ? { metadataBase: new URL(SITE_URL) } : {}),
  title: { default: 'Developer Map: 80 knowledge graphs, one map', template: '%s · Developer Map' },
  description: 'Thirteen thousand developer concepts from 80 knowledge graphs, from packets and compilers to containers, crypto and the Web, joined where the graphs share an idea.',
};

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0c0f14' },
    { media: '(prefers-color-scheme: dark)', color: '#0c0f14' },
  ],
};

const NAV = [
  ['/map', 'Map'],
  ['/regions', 'Regions'],
  ['/graphs', 'Graphs'],
  ['/about', 'About'],
];

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={mono.variable}>
      <body>
        <a className="skip" href="#main">Skip to content</a>
        <header className="site-header">
          <Link href="/" className="wordmark" aria-label="Developer Map, home">
            <span className="prompt" aria-hidden="true">~/</span>developer<span className="wordmark-map">map</span><span className="cursor" aria-hidden="true" />
          </Link>
          <nav aria-label="Sections" className="site-nav">
            {NAV.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}
          </nav>
          <Search />
        </header>
        <div id="main">{children}</div>
        <footer className="site-footer">
          <p>
            <strong>Developer Map</strong> joins 80 source knowledge graphs. Every page is built from the JSON in the repository;
            source assertions are shown as recorded, not fact-checked.
          </p>
          <nav aria-label="Footer">
            {NAV.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}
            <a href="https://github.com/SolutionsAsService/developer-map">Source on GitHub</a>
          </nav>
        </footer>
      </body>
    </html>
  );
}
