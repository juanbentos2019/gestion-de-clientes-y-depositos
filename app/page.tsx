'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { Login } from '@/components/auth/Login';
import { Button } from '@/components/ui/Button';
import { authService } from '@/lib/services/authService';

export default function Home() {
  const { currentUser, loading } = useAuth();
  const [view, setView] = useState<'dashboard' | 'clients' | 'deposits'>('dashboard');

  const handleLogout = async () => {
    try {
      await authService.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Login onLoginSuccess={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-gold-400 to-gold-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                G
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                Gold<span className="text-gold-600">Folio</span>
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{currentUser.username}</div>
                <div className="text-xs text-gray-500 uppercase">{currentUser.role}</div>
              </div>
              <Button variant="ghost" onClick={handleLogout} className="text-red-500">
                Salir
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setView('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                view === 'dashboard'
                  ? 'border-gold-600 text-gold-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🏠 Dashboard
            </button>
            <button
              onClick={() => setView('clients')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                view === 'clients'
                  ? 'border-gold-600 text-gold-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              👥 Clientes
            </button>
            <button
              onClick={() => setView('deposits')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                view === 'deposits'
                  ? 'border-gold-600 text-gold-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              💸 Boletas de Depósito
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'dashboard' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Bienvenido, {currentUser.username}</h2>
            <p className="text-gray-600">
              Sistema de gestión de clientes y boletas de depósito para sucursales de inversión en oro.
            </p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gold-50 border border-gold-200 rounded-lg p-4">
                <h3 className="font-semibold text-gold-900">Clientes</h3>
                <p className="text-sm text-gold-700 mt-1">Gestiona tu cartera de clientes</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900">Boletas</h3>
                <p className="text-sm text-blue-700 mt-1">Registra depósitos con validación anti-fraude</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900">Reportes</h3>
                <p className="text-sm text-green-700 mt-1">Visualiza estadísticas en tiempo real</p>
              </div>
            </div>
          </div>
        )}

        {view === 'clients' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Gestión de Clientes</h2>
            <p className="text-gray-600">Módulo de clientes en construcción...</p>
          </div>
        )}

        {view === 'deposits' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Boletas de Depósito</h2>
            <p className="text-gray-600">Módulo de boletas en construcción...</p>
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900 font-medium">
                ⚠️ Este módulo incluye validación automática de números de operación duplicados por banco.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
