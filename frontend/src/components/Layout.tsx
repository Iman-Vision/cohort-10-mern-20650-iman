import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = (): React.JSX.Element => (
  <div className="flex min-h-screen flex-col bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
    <Navbar />
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
      <Outlet />
    </div>
  </div>
);

export default Layout;
