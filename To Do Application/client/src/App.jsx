import React, { useState } from 'react';
import { AuthProvider, useAuth } from './components/AuthContext';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Board from './components/Board';

function MainApp() {
  const { user, loading } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  if (loading) return <div className="center">Loading...</div>;

  if (!user) {
    return showRegister ? (
      <RegisterForm
        onSuccess={() => setShowRegister(false)}
        onSwitch={() => setShowRegister(false)}
      />
    ) : (
      <LoginForm
        onSuccess={() => {}}
        onSwitch={() => setShowRegister(true)}
      />
    );
  }

  return <Board />;
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
