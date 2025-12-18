'use client';

import React, { useState } from 'react';
import { authService } from '@/lib/services/authService';
import { Button } from '../ui/Button';
import { User } from '@/types';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await authService.signIn(email, password);
      if (user) {
        onLoginSuccess(user);
      } else {
        setError('Usuario no encontrado en el sistema.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Firebase error messages translation
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        setError('Email o contraseña incorrectos.');
      } else if (error.code === 'auth/user-not-found') {
        setError('Usuario no encontrado.');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Demasiados intentos fallidos. Intenta más tarde.');
      } else {
        setError('Error al iniciar sesión. Verifica tus credenciales.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gold-50 to-gold-100 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-2xl">
        {/* Logo */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gold-400 to-gold-600 rounded-2xl mb-4 shadow-lg">
            <span className="text-4xl font-bold text-white">G</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Gold<span className="text-gold-600">Folio</span>
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sistema de Gestión de Inversiones
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-gold-500 focus:border-gold-500 focus:z-10 sm:text-sm"
                placeholder="tu@email.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-gold-500 focus:border-gold-500 focus:z-10 sm:text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full shadow-lg" 
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>
        </form>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} GoldFolio CRM</p>
          <p className="mt-1">Sistema seguro con Firebase</p>
        </div>
      </div>
    </div>
  );
};
