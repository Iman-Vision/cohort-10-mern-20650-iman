import { ThemeProvider } from './context/ThemeContext';
import AppRouter from './routes/AppRouter';

const App = (): React.JSX.Element => (
  <ThemeProvider>
    <AppRouter />
  </ThemeProvider>
);

export default App;
