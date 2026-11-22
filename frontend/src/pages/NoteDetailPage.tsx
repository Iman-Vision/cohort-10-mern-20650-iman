import { useParams } from 'react-router-dom';

const NoteDetailPage = (): React.JSX.Element => {
  const { id } = useParams<{ id: string }>();
  return (
    <main className="flex flex-col items-center justify-center flex-1 p-6">
      <h1 className="text-2xl font-semibold">Note</h1>
      <p className="text-gray-500 mt-2">ID: {id}</p>
      <p className="text-gray-400 text-sm mt-1">Editor coming in T8</p>
    </main>
  );
};

export default NoteDetailPage;
