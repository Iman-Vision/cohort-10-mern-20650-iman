import { useParams } from 'react-router-dom';

const NoteDetailPage = (): React.JSX.Element => {
  const { id } = useParams<{ id: string }>();

  return (
    <section className="flex flex-col items-center justify-center flex-1 p-6">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-xs transition-colors dark:border-gray-800 dark:bg-gray-900">
        <span className="text-4xl">📄</span>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Note Details
        </h1>
        <p className="mt-2 font-mono text-xs text-indigo-600 dark:text-indigo-400">ID: {id}</p>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Rich editor and autosave coming in T8.
        </p>
      </div>
    </section>
  );
};

export default NoteDetailPage;
