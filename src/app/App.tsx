import { RouterProvider } from 'react-router';
import { ThemeProvider } from './context/ThemeContext';
import { DataProvider } from './context';
import { router } from '../routes';
import { useData } from './context';

function AppContent() {
  const { isLoading } = useData();

  if (isLoading) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        background: 'var(--background, #0f172a)',
        zIndex: 9999,
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid rgba(99, 102, 241, 0.2)',
          borderTop: '4px solid #6366f1',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <p style={{
          color: 'rgba(255,255,255,0.6)',
          fontSize: '0.9rem',
          fontFamily: 'system-ui, sans-serif',
          margin: 0,
        }}>
          Cargando datos…
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return <RouterProvider router={router} />;
}

export default function App() {
  return (
    <ThemeProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </ThemeProvider>
  );
}
