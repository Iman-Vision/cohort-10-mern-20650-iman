import { Link } from 'react-router-dom';

const NotFoundPage = (): React.JSX.Element => (
  <main className="flex flex-col items-center justify-center min-h-screen gap-4">
    <h1 className="text-6xl font-bold text-gray-300 dark:text-gray-700">404</h1>
    <p className="text-xl text-gray-600 dark:text-gray-400">Page not found</p>
    <Link
      to="/"
      className="mt-2 px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
    >
      Go to Dashboard
    </Link>
  </main>
);

export default NotFoundPage;
