import Link from 'next/link';
export default function NotFound() {
  return (
    <main className="wrap"><header className="page-head"><p className="kicker">404</p><h1>command not found</h1>
      <p className="lede">That page is not on the map. Try the search above, or go <Link href="/">home</Link>.</p></header></main>
  );
}
