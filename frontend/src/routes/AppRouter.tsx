import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout';
import DashboardPage from '../pages/DashboardPage';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import NewNotePage from '../pages/NewNotePage';
import NoteDetailPage from '../pages/NoteDetailPage';
import TrashPage from '../pages/TrashPage';
import ProfilePage from '../pages/ProfilePage';
import SharedNotePage from '../pages/SharedNotePage';
import NotFoundPage from '../pages/NotFoundPage';

const AppRouter = (): React.JSX.Element => (
  <BrowserRouter>
    <Routes>
      {/* Public share link – no navbar */}
      <Route path="/s/:token" element={<SharedNotePage />} />

      {/* Auth pages – no navbar */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* App layout with navbar */}
      <Route element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="/notes/new" element={<NewNotePage />} />
        <Route path="/notes/:id" element={<NoteDetailPage />} />
        <Route path="/trash" element={<TrashPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </BrowserRouter>
);

export default AppRouter;
