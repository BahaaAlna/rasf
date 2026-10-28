import { BrowserRouter } from 'react-router';
import { AuthProvider } from './auth/AuthProvider';
import App from './App';

/** The whole app, Firebase included: loaded by main.tsx once there's a project. */
export default function Root() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  );
}
