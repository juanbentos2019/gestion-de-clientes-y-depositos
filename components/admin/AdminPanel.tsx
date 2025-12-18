'use client';

import React, { useState, useEffect } from 'react';
import { User, Branch, UserRole } from '@/types';
import { Button } from '../ui/Button';
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
      alert('Sucursal creada exitosamente');
    } catch (error) {
      console.error('Error adding branch:', error);
      alert('Error al crear sucursal');
    }
  };

  const handleEditBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBranch || !editingBranch.name.trim()) return;

    try {
      await branchService.updateBranch(editingBranch.id, { name: editingBranch.name });
      setEditingBranch(null);
      await loadData();
      alert('Sucursal actualizada');
    } catch (error) {
      console.error('Error updating branch:', error);
      alert('Error al actualizar sucursal');
    }
  };

  const handleDeleteBranch = async (id: string) => {
    if (!window.confirm('¿Eliminar sucursal? Los usuarios asociados quedarán sin sucursal.')) return;

    try {
      await branchService.deleteBranch(id);
      await loadData();
      alert('Sucursal eliminada');
    } catch (error) {
      console.error('Error deleting branch:', error);
      alert('Error al eliminar sucursal');
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.email || !newUser.password || !newUser.username) {
      alert('Complete todos los campos requeridos');
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
      alert('Usuario creado exitosamente');
    } catch (error: any) {
      console.error('Error adding user:', error);
      alert(`Error al crear usuario: ${error.message || 'Error desconocido'}`);
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
      alert('Usuario actualizado');
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error al actualizar usuario');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('¿Eliminar usuario? Esta acción no se puede deshacer.')) return;

    try {
      await userService.deleteUser(id);
      await loadData();
      alert('Usuario eliminado');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error al eliminar usuario');
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

            <ul className="divide-y divide-gray-200">
              {branches.map((b) => (
                <li key={b.id} className="py-3 flex justify-between items-center">
                  <span className="text-gray-900 font-medium">{b.name}</span>
                  {canManageBranches && (
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        onClick={() => setEditingBranch({ id: b.id, name: b.name })}
                        className="text-sm px-3 py-1"
                      >
                        Editar
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleDeleteBranch(b.id)}
                        className="text-sm px-3 py-1"
                      >
                        Eliminar
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
            <form onSubmit={handleAddUser} className="bg-gray-50 p-4 rounded-lg space-y-4">
              <h3 className="font-medium text-gray-900">Crear Usuario</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  required
                  type="email"
                  placeholder="Email"
                  className="p-2 border rounded"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
                <input
                  required
                  type="text"
                  placeholder="Usuario"
                  className="p-2 border rounded"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                />
                <input
                  required
                  type="password"
                  placeholder="Contraseña"
                  className="p-2 border rounded"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                />
                <select
                  className="p-2 border rounded"
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                >
                  <option value="USER">Usuario</option>
                  <option value="ADMIN">Admin</option>
                  <option value="MASTER">Master</option>
                </select>
                <select
                  className="p-2 border rounded sm:col-span-2"
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
              <Button type="submit">Crear Usuario</Button>
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
              <h3 className="font-medium text-gray-900 mb-4">Usuarios Existentes</h3>
              <ul className="divide-y divide-gray-200">
                {users.map((u) => (
                  <li key={u.id} className="py-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{u.username}</div>
                        <div className="text-sm text-gray-500">
                          {u.email}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              u.role === 'MASTER'
                                ? 'bg-purple-100 text-purple-800'
                                : u.role === 'ADMIN'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {u.role}
                          </span>
                          <span className="text-xs text-gray-500">
                            {branches.find(b => b.id === u.branchId)?.name || 'Sin sucursal'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          onClick={() => setEditingUser(u)}
                          className="text-sm px-3 py-1"
                        >
                          Editar
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => handleDeleteUser(u.id)}
                          className="text-sm px-3 py-1"
                        >
                          Eliminar
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
    </div>
  );
};
