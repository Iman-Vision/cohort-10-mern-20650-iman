import { useParams } from 'react-router-dom';

const SharedNotePage = (): React.JSX.Element => {
  const { token } = useParams<{ token: string }>();
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6">
      <h1 className="text-2xl font-semibold">Shared Note</h1>
      <p className="text-gray-500 mt-2">Token: {token}</p>
      <p className="text-gray-400 text-sm mt-1">Share view coming in T14</p>
    </main>
  );
};

export default SharedNotePage;
