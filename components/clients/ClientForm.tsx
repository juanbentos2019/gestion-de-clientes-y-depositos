'use client';

import React, { useState, useEffect } from 'react';
import { Client, ClientFormData, User, Branch, ClientStatus } from '@/types';
import { Button } from '../ui/Button';
import { branchService } from '@/lib/services/branchService';

interface ClientFormProps {
  initialData?: Client;
  currentUser: User;
  onSave: (client: Omit<Client, 'id'>) => Promise<void>;
  onCancel: () => void;
}

export const ClientForm: React.FC<ClientFormProps> = ({
  initialData,
  currentUser,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<ClientFormData>({
    firstName: '',
    lastName: '',
    landline: '',
    mobile: '',
    address: '',
    email: '',
    interestType: '',
    investmentAmount: '',
    branchId: currentUser.branchId || '',
    status: 'PENDING',
  });

  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadBranches();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        firstName: initialData.firstName,
        lastName: initialData.lastName,
        landline: initialData.landline || '',
        mobile: initialData.mobile,
        address: initialData.address || '',
        email: initialData.email || '',
        interestType: initialData.interestType || '',
        investmentAmount: initialData.investmentAmount?.toString() || '',
        branchId: initialData.branchId,
        status: initialData.status,
      });
    }
  }, [initialData]);

  const loadBranches = async () => {
    try {
      const data = await branchService.getAllBranches();
      setBranches(data);
      if (!initialData && !currentUser.branchId && data.length > 0) {
        setFormData(prev => ({ ...prev, branchId: data[0].id }));
      }
    } catch (error) {
      console.error('Error loading branches:', error);
    }
  };

  const validate = (): boolean => {
    setError('');
    
    if (!formData.firstName.trim()) {
      setError('El nombre es requerido');
      return false;
    }
    
    if (!formData.lastName.trim()) {
      setError('El apellido es requerido');
      return false;
    }
    
    if (!formData.mobile.trim()) {
      setError('El celular es requerido');
      return false;
    }
    
    if (!formData.branchId) {
      setError('Debe seleccionar una sucursal');
      return false;
    }
    
    if (!formData.interestType.trim() && !formData.investmentAmount.trim()) {
      setError('Debe especificar qué busca o el monto a invertir');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const client: Omit<Client, 'id'> = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        landline: formData.landline || undefined,
        mobile: formData.mobile,
        address: formData.address || undefined,
        email: formData.email || undefined,
        interestType: formData.interestType || undefined,
        investmentAmount: formData.investmentAmount ? parseFloat(formData.investmentAmount) : undefined,
        branchId: formData.branchId,
        status: formData.status,
        createdBy: currentUser.id,
        createdAt: initialData?.createdAt || Date.now(),
        updatedAt: Date.now()
      };
      
      await onSave(client);
    } catch (err: any) {
      setError(err.message || 'Error al guardar el cliente');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const canSelectBranch = currentUser.role === 'MASTER' || currentUser.role === 'ADMIN';
  const inputClass = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gold-500 focus:ring-gold-500 sm:text-sm p-2 border";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">
          Datos Personales
        </h3>
        
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              Nombre *
            </label>
            <input
              type="text"
              name="firstName"
              id="firstName"
              required
              value={formData.firstName}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
              Apellido *
            </label>
            <input
              type="text"
              name="lastName"
              id="lastName"
              required
              value={formData.lastName}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">
              Celular *
            </label>
            <input
              type="tel"
              name="mobile"
              id="mobile"
              required
              value={formData.mobile}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="landline" className="block text-sm font-medium text-gray-700">
              Teléfono Fijo
            </label>
            <input
              type="tel"
              name="landline"
              id="landline"
              value={formData.landline}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Dirección
            </label>
            <input
              type="text"
              name="address"
              id="address"
              value={formData.address}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="branchId" className="block text-sm font-medium text-gray-700">
              Sucursal *
            </label>
            <select
              name="branchId"
              id="branchId"
              required
              value={formData.branchId}
              onChange={handleChange}
              disabled={!canSelectBranch}
              className={`${inputClass} ${!canSelectBranch ? 'bg-gray-100' : ''}`}
            >
              <option value="">Seleccionar...</option>
              {branches.map(branch => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
            {!canSelectBranch && (
              <p className="text-xs text-gray-500 mt-1">
                Tu usuario está asociado a esta sucursal
              </p>
            )}
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Estado
            </label>
            <select
              name="status"
              id="status"
              value={formData.status}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="PENDING">🟡 Pendiente</option>
              <option value="CONTACTED">🔵 Contactado</option>
              <option value="COMPLETED">🟢 Completado</option>
              <option value="CANCELLED">🔴 Cancelado</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-gold-50 p-6 rounded-lg shadow-sm border border-gold-200">
        <h3 className="text-lg font-medium text-gold-900 mb-4 border-b border-gold-200 pb-2">
          Perfil de Inversión
        </h3>
        
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
          <div>
            <label htmlFor="interestType" className="block text-sm font-medium text-gold-800">
              Moneda / Lingote Buscado
            </label>
            <input
              type="text"
              name="interestType"
              id="interestType"
              placeholder="Ej. Krugerrand, Lingote 50g"
              value={formData.interestType}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="investmentAmount" className="block text-sm font-medium text-gold-800">
              Monto a Invertir (Estimado)
            </label>
            <div className="relative mt-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                name="investmentAmount"
                id="investmentAmount"
                className={`${inputClass} pl-7`}
                placeholder="0.00"
                value={formData.investmentAmount}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
        
        <p className="mt-3 text-xs text-gold-600">
          * Debe completar al menos uno de estos dos campos
        </p>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : initialData ? 'Actualizar' : 'Guardar Cliente'}
        </Button>
      </div>
    </form>
  );
};
