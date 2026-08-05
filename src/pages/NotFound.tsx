import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container-page py-20">
      <div className="max-w-md mx-auto text-center">
        <p className="font-display text-8xl font-extrabold text-brand-600">404</p>
        <h1 className="mt-4 font-display text-2xl font-extrabold text-ink-900">Page not found</h1>
        <p className="mt-2 text-ink-500">The page you're looking for doesn't exist or has been moved.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/" className="btn-primary"><Home className="h-4 w-4" /> Go Home</Link>
          <button onClick={() => window.history.back()} className="btn-outline"><ArrowLeft className="h-4 w-4" /> Go Back</button>
        </div>
      </div>
    </div>
  );
}
