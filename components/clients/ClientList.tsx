'use client';

import React, { useState, useEffect } from 'react';
import { Client, User, ClientStatus } from '@/types';
import { Button } from '../ui/Button';
import { clientService } from '@/lib/services/clientService';
import { branchService } from '@/lib/services/branchService';

interface ClientListProps {
  currentUser: User;
  onEdit?: (client: Client) => void;
  onAdd?: () => void;
}

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  CONTACTED: 'bg-blue-100 text-blue-800 border-blue-200',
  COMPLETED: 'bg-green-100 text-green-800 border-green-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200'
};

const STATUS_LABELS = {
  PENDING: '🟡 Pendiente',
  CONTACTED: '🔵 Contactado',
  COMPLETED: '🟢 Completado',
  CANCELLED: '🔴 Cancelado'
};

export const ClientList: React.FC<ClientListProps> = ({ currentUser, onEdit, onAdd }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ClientStatus | 'ALL'>('ALL');
  const [branchNames, setBranchNames] = useState<Record<string, string>>({});

  useEffect(() => {
    loadClients();
    loadBranches();
  }, [currentUser]);

  useEffect(() => {
    filterClients();
  }, [clients, searchTerm, statusFilter]);

  const loadClients = async () => {
    try {
      setLoading(true);
      let data: Client[];
      
      if (currentUser.role === 'MASTER') {
        data = await clientService.getAllClients();
      } else if (currentUser.branchId) {
        data = await clientService.getClientsByBranch(currentUser.branchId);
      } else {
        data = [];
      }
      
      setClients(data);
    } catch (error) {
      console.error('Error loading clients:', error);
      alert('Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  const loadBranches = async () => {
    try {
      const branches = await branchService.getAllBranches();
      const namesMap: Record<string, string> = {};
      branches.forEach(b => {
        namesMap[b.id] = b.name;
      });
      setBranchNames(namesMap);
    } catch (error) {
      console.error('Error loading branches:', error);
    }
  };

  const filterClients = () => {
    let filtered = [...clients];

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(client =>
        client.firstName.toLowerCase().includes(term) ||
        client.lastName.toLowerCase().includes(term) ||
        client.mobile.includes(term) ||
        (client.email && client.email.toLowerCase().includes(term))
      );
    }

    // Filter by status
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(client => client.status === statusFilter);
    }

    setFilteredClients(filtered);
  };

  const handleDelete = async (client: Client) => {
    if (!window.confirm(`¿Eliminar a ${client.firstName} ${client.lastName}?`)) return;

    try {
      await clientService.deleteClient(client.id);
      await loadClients();
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('Error al eliminar cliente');
    }
  };

  const handleStatusChange = async (client: Client, newStatus: ClientStatus) => {
    try {
      await clientService.updateClient(client.id, { status: newStatus });
      await loadClients();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error al actualizar estado');
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Clientes</h2>
        <Button onClick={onAdd || (() => {})} className="bg-gold-600 hover:bg-gold-700 text-white px-6 py-2">
          ➕ Nuevo Cliente
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <input
              type="text"
              placeholder="Nombre, teléfono, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gold-500 focus:border-gold-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ClientStatus | 'ALL')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gold-500 focus:border-gold-500"
            >
              <option value="ALL">Todos</option>
              <option value="PENDING">🟡 Pendiente</option>
              <option value="CONTACTED">🔵 Contactado</option>
              <option value="COMPLETED">🟢 Completado</option>
              <option value="CANCELLED">🔴 Cancelado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600">
        Mostrando {filteredClients.length} de {clients.length} clientes
      </div>

      {/* Client List */}
      {filteredClients.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">📄</div>
          <p className="text-gray-500 text-lg mb-4">No hay clientes para mostrar</p>
          <Button onClick={onAdd || (() => {})} className="bg-gold-600 hover:bg-gold-700 text-white px-6 py-3">
            ➕ Agregar el primer cliente
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map(client => (
            <div
              key={client.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {client.firstName} {client.lastName}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {branchNames[client.branchId] || 'Sin sucursal'}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded text-xs border ${STATUS_COLORS[client.status]}`}>
                  {STATUS_LABELS[client.status]}
                </span>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500">📱</span>
                  <a href={`tel:${client.mobile}`} className="text-gold-600 hover:underline">
                    {client.mobile}
                  </a>
                </div>
                {client.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500">✉️</span>
                    <a href={`mailto:${client.email}`} className="text-gold-600 hover:underline truncate">
                      {client.email}
                    </a>
                  </div>
                )}
                {client.investmentAmount && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500">💰</span>
                    <span className="font-medium text-gray-900">
                      ${client.investmentAmount.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <select
                  value={client.status}
                  onChange={(e) => handleStatusChange(client, e.target.value as ClientStatus)}
                  className="flex-1 text-xs px-2 py-1 border border-gray-300 rounded"
                >
                  <option value="PENDING">🟡 Pendiente</option>
                  <option value="CONTACTED">🔵 Contactado</option>
                  <option value="COMPLETED">🟢 Completado</option>
                  <option value="CANCELLED">🔴 Cancelado</option>
                </select>
                {onEdit && (
                  <Button
                    variant="secondary"
                    onClick={() => onEdit(client)}
                    className="text-xs px-3 py-1"
                  >
                    Editar
                  </Button>
                )}
                <Button
                  variant="danger"
                  onClick={() => handleDelete(client)}
                  className="text-xs px-3 py-1"
                >
                  🗑️
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
