import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { EmptyState } from '../components/ui';

export default function NotFound() {
  return (
    <div className="fullpage">
      <EmptyState
        icon={Compass}
        title="Page not found"
        action={
          <Link to="/" className="btn btn-primary">
            Back to home
          </Link>
        }
      >
        The page you're looking for doesn't exist.
      </EmptyState>
    </div>
  );
}
