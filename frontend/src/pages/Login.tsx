// src/pages/Login.tsx

import LoginForm from '../components/auth/LoginForm';
import { useLocation } from 'react-router-dom';

interface LocationState {
  message?: string;
  from?: Location;
}

const Login = () => {
  const location = useLocation();
  const state = location.state as LocationState;
  const message = state?.message;
  
  return (
    <div className="container mx-auto px-4 py-8">
      {message && (
        <div className="max-w-md mx-auto mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {message}
        </div>
      )}
      <LoginForm />
    </div>
  );
};

export default Login;