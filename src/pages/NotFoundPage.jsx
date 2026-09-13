import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold mb-2">404 - Page Not Found</h1>
      <p className="text-zinc-400 mb-6">The page you are looking for does not exist.</p>
      <Link to="/" className="text-emerald-400 underline text-sm">
        Return to Home
      </Link>
    </div>
  );
}
