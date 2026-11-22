import { useParams, Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

const SharedNotePage = (): React.JSX.Element => {
  const { token } = useParams<{ token: string }>();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 transition-colors dark:bg-gray-950">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-xs transition-colors dark:border-gray-800 dark:bg-gray-900">
        <span className="text-4xl">🔗</span>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Shared Note
        </h1>
        <p className="mt-2 font-mono text-xs text-indigo-600 dark:text-indigo-400">Token: {token}</p>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Read-only public note view coming in T14.
        </p>
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
          >
            ← Go to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
};

export default SharedNotePage;
