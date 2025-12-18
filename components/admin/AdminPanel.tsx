'use client';

import React, { useState, useEffect } from 'react';
import { User, Branch, UserRole } from '@/types';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { userService } from '@/lib/services/userService';
import { branchService } from '@/lib/services/branchService';
import { authService } from '@/lib/services/authService';

interface AdminPanelProps {
  currentUser: User;
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ currentUser, onClose }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'branches'>('branches');
  const [users, setUsers] = useState<User[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  
  // New branch form
  const [newBranchName, setNewBranchName] = useState('');
  const [editingBranch, setEditingBranch] = useState<{ id: string; name: string } | null>(null);
  
  // New user form
  const [newUser, setNewUser] = useState({
    email: '',
    username: '',
    password: '',
    role: 'USER' as UserRole,
    branchId: ''
  });
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Modal states
  const [modal, setModal] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title?: string;
    message: string;
  }>({ isOpen: false, type: 'info', message: '' });

  const showModal = (type: 'success' | 'error' | 'warning' | 'info', message: string, title?: string) => {
    setModal({ isOpen: true, type, message, title });
  };

  const canManageBranches = currentUser.role === 'MASTER' || currentUser.role === 'ADMIN';
  const canCreateUsers = currentUser.role === 'MASTER';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, branchesData] = await Promise.all([
        userService.getAllUsers(),
        branchService.getAllBranches()
      ]);
      setUsers(usersData);
      setBranches(branchesData);
      if (branchesData.length > 0 && !newUser.branchId) {
        setNewUser(prev => ({ ...prev, branchId: branchesData[0].id }));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchName.trim()) return;

    try {
      await branchService.addBranch({
        name: newBranchName,
        createdAt: Date.now()
      });
      setNewBranchName('');
      await loadData();
      showModal('success', `Sucursal "${newBranchName}" creada exitosamente`, '¡Éxito!');
    } catch (error) {
      console.error('Error adding branch:', error);
      showModal('error', 'Error al crear sucursal', 'Error');
    }
  };

  const handleEditBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBranch || !editingBranch.name.trim()) return;

    try {
      await branchService.updateBranch(editingBranch.id, { name: editingBranch.name });
      setEditingBranch(null);
      await loadData();
      showModal('success', 'Sucursal actualizada correctamente', '¡Éxito!');
    } catch (error) {
      console.error('Error updating branch:', error);
      showModal('error', 'Error al actualizar sucursal', 'Error');
    }
  };

  const handleDeleteBranch = async (id: string) => {
    if (!window.confirm('¿Eliminar sucursal? Los usuarios asociados quedarán sin sucursal.')) return;

    try {
      await branchService.deleteBranch(id);
      await loadData();
      showModal('success', 'Sucursal eliminada correctamente', 'Eliminado');
    } catch (error) {
      console.error('Error deleting branch:', error);
      showModal('error', 'Error al eliminar sucursal', 'Error');
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.email || !newUser.password || !newUser.username) {
      showModal('warning', 'Complete todos los campos requeridos', 'Campos Incompletos');
      return;
    }

    try {
      await authService.createUser(newUser.email, newUser.password, {
        email: newUser.email,
        username: newUser.username,
        role: newUser.role,
        branchId: newUser.branchId,
        createdAt: Date.now()
      });
      
      setNewUser({
        email: '',
        username: '',
        password: '',
        role: 'USER',
        branchId: branches[0]?.id || ''
      });
      
      await loadData();
      showModal('success', `Usuario "${newUser.username}" creado exitosamente`, '¡Éxito!');
    } catch (error: any) {
      console.error('Error adding user:', error);
      // Mensajes más claros para errores comunes de Firebase Auth
      let msg = 'Error desconocido';
      if (error?.code === 'auth/email-already-in-use') {
        msg = 'El email ya está registrado.\nUse otro email o recupere la contraseña.';
      } else if (error?.code === 'auth/invalid-email') {
        msg = 'Email inválido';
      } else if (error?.code === 'auth/weak-password') {
        msg = 'La contraseña debe tener al menos 6 caracteres';
      } else if (typeof error?.message === 'string') {
        msg = error.message;
      }
      showModal('error', msg, 'Error al crear usuario');
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      await userService.updateUser(editingUser.id, {
        username: editingUser.username,
        role: editingUser.role,
        branchId: editingUser.branchId
      });
      setEditingUser(null);
      await loadData();
      showModal('success', 'Usuario actualizado correctamente', '¡Éxito!');
    } catch (error) {
      console.error('Error updating user:', error);
      showModal('error', 'Error al actualizar usuario', 'Error');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('¿Eliminar usuario? Esta acción no se puede deshacer.')) return;

    try {
      await userService.deleteUser(id);
      await loadData();
      showModal('success', 'Usuario eliminado correctamente', 'Eliminado');
    } catch (error) {
      console.error('Error deleting user:', error);
      showModal('error', 'Error al eliminar usuario', 'Error');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <h2 className="text-lg font-bold text-gray-900">Panel de Administración</h2>
        <Button variant="ghost" onClick={onClose}>
          ✕ Cerrar
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('branches')}
          className={`flex-1 py-3 px-4 text-sm font-medium ${
            activeTab === 'branches'
              ? 'text-gold-600 border-b-2 border-gold-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Sucursales
        </button>
        {canCreateUsers && (
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-3 px-4 text-sm font-medium ${
              activeTab === 'users'
                ? 'text-gold-600 border-b-2 border-gold-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Usuarios
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'branches' && (
          <div className="space-y-6">
            {canManageBranches ? (
              <form onSubmit={handleAddBranch} className="flex gap-4">
                <input
                  required
                  placeholder="Nombre de Sucursal"
                  className="flex-1 p-2 border rounded focus:ring-gold-500 focus:border-gold-500"
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                />
                <Button type="submit">Agregar</Button>
              </form>
            ) : (
              <p className="text-sm text-gray-500 italic">
                Solo Admins y Master pueden gestionar sucursales.
              </p>
            )}

            {editingBranch && (
              <form onSubmit={handleEditBranch} className="bg-blue-50 p-4 rounded-lg space-y-3">
                <h4 className="font-medium text-gray-900">Editar Sucursal</h4>
                <div className="flex gap-3">
                  <input
                    required
                    placeholder="Nombre de Sucursal"
                    className="flex-1 p-2 border rounded"
                    value={editingBranch.name}
                    onChange={(e) => setEditingBranch({ ...editingBranch, name: e.target.value })}
                  />
                  <Button type="submit" variant="primary">Guardar</Button>
                  <Button type="button" variant="ghost" onClick={() => setEditingBranch(null)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            )}

            <ul className="space-y-2">
              {branches.map((b) => (
                <li key={b.id} className="py-3 px-3 bg-white hover:bg-gray-50 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <span className="text-gray-900 font-semibold text-base">{b.name}</span>
                  {canManageBranches && (
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button
                        variant="ghost"
                        onClick={() => setEditingBranch({ id: b.id, name: b.name })}
                        className="flex-1 sm:flex-none text-sm px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"
                      >
                        ✏️ Editar
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleDeleteBranch(b.id)}
                        className="flex-1 sm:flex-none text-sm px-4 py-2"
                      >
                        🗑️ Eliminar
                      </Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === 'users' && canCreateUsers && (
          <div className="space-y-6">
            <form onSubmit={handleAddUser} className="bg-gradient-to-r from-gold-50 to-gold-100 border border-gold-200 p-6 rounded-lg space-y-4">
              <h3 className="font-semibold text-gray-900 text-lg">Crear Usuario</h3>
              <div className="grid grid-cols-1 gap-4">
                <input
                  required
                  type="email"
                  placeholder="Email"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
                <input
                  required
                  type="text"
                  placeholder="Usuario"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                />
                <input
                  required
                  type="password"
                  placeholder="Contraseña"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                />
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                >
                  <option value="USER">Usuario</option>
                  <option value="ADMIN">Admin</option>
                  <option value="MASTER">Master</option>
                </select>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                  value={newUser.branchId}
                  onChange={(e) => setNewUser({ ...newUser, branchId: e.target.value })}
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
              <Button type="submit" className="w-full py-3 text-base font-semibold">
                ➕ Crear Usuario
              </Button>
            </form>

            {editingUser && (
              <form onSubmit={handleEditUser} className="bg-blue-50 p-4 rounded-lg space-y-4">
                <h4 className="font-medium text-gray-900">Editar Usuario</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    required
                    type="text"
                    placeholder="Usuario"
                    className="p-2 border rounded"
                    value={editingUser.username}
                    onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                  />
                  <select
                    className="p-2 border rounded"
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                  >
                    <option value="USER">Usuario</option>
                    <option value="ADMIN">Admin</option>
                    <option value="MASTER">Master</option>
                  </select>
                  <select
                    className="p-2 border rounded sm:col-span-2"
                    value={editingUser.branchId}
                    onChange={(e) => setEditingUser({ ...editingUser, branchId: e.target.value })}
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3">
                  <Button type="submit" variant="primary">Guardar</Button>
                  <Button type="button" variant="ghost" onClick={() => setEditingUser(null)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            )}

            <div>
              <h3 className="font-semibold text-gray-900 mb-4 text-lg">Usuarios Existentes</h3>
              <ul className="divide-y divide-gray-200">
                {users.map((u) => (
                  <li key={u.id} className="py-4 bg-white hover:bg-gray-50 rounded-lg mb-2 px-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 text-base">{u.username}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          {u.email}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              u.role === 'MASTER'
                                ? 'bg-purple-100 text-purple-800'
                                : u.role === 'ADMIN'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {u.role}
                          </span>
                          <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                            {branches.find(b => b.id === u.branchId)?.name || 'Sin sucursal'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Button
                          variant="ghost"
                          onClick={() => setEditingUser(u)}
                          className="flex-1 sm:flex-none text-sm px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"
                        >
                          ✏️ Editar
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => handleDeleteUser(u.id)}
                          className="flex-1 sm:flex-none text-sm px-4 py-2"
                        >
                          🗑️ Eliminar
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Modal de notificaciones */}
      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        type={modal.type}
        title={modal.title}
        message={modal.message}
      />
    </div>
  );
};
