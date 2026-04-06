import { RouterProvider } from 'react-router';
import { ThemeProvider } from './context/ThemeContext';
import { DataProvider } from './context/DataContext';
import { router } from './routes';

export default function App() {
  return (
    <ThemeProvider>
      <DataProvider>
        <RouterProvider router={router} />
      </DataProvider>
    </ThemeProvider>
  );
}
