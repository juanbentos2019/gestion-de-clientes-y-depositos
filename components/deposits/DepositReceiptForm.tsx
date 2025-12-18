'use client';

import React, { useState, useEffect } from 'react';
import { DepositReceipt, DepositReceiptFormData, CurrencyType, User, Client } from '@/types';
import { Button } from '../ui/Button';
import { depositReceiptService } from '@/lib/services/depositReceiptService';
import { clientService } from '@/lib/services/clientService';

interface DepositReceiptFormProps {
  initialData?: DepositReceipt;
  currentUser: User;
  onSave: (receipt: Omit<DepositReceipt, 'id'>) => Promise<void>;
  onCancel: () => void;
}

const CURRENCIES: CurrencyType[] = ['USD', 'EUR', 'ARS', 'BRL', 'OTHER'];

const CURRENCY_LABELS = {
  USD: '🇺🇸 Dólar (USD)',
  EUR: '🇪🇺 Euro (EUR)',
  ARS: '🇦🇷 Peso Argentino (ARS)',
  BRL: '🇧🇷 Real Brasileño (BRL)',
  OTHER: '🌎 Otra moneda'
};

const COMMON_BANKS = [
  'Banco Nación',
  'Banco Santander',
  'Banco BBVA',
  'Banco Galicia',
  'Banco Macro',
  'Banco Ciudad',
  'HSBC',
  'Banco Patagonia',
  'Banco Supervielle',
  'Otro'
];

export const DepositReceiptForm: React.FC<DepositReceiptFormProps> = ({
  initialData,
  currentUser,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<DepositReceiptFormData>({
    clientName: '',
    clientId: '',
    bank: '',
    depositAmount: '',
    depositCurrency: 'ARS',
    operationNumber: '',
    counterpartyCurrency: 'USD',
    notes: ''
  });

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState('');

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        clientName: initialData.clientName,
        clientId: initialData.clientId || '',
        bank: initialData.bank,
        depositAmount: initialData.depositAmount.toString(),
        depositCurrency: initialData.depositCurrency,
        operationNumber: initialData.operationNumber,
        counterpartyCurrency: initialData.counterpartyCurrency,
        notes: initialData.notes || ''
      });
    }
  }, [initialData]);

  const loadClients = async () => {
    try {
      // Load clients based on user role
      let clientList: Client[] = [];
      if (currentUser.role === 'MASTER') {
        clientList = await clientService.getAllClients();
      } else if (currentUser.branchId) {
        clientList = await clientService.getClientsByBranch(currentUser.branchId);
      }
      setClients(clientList);
    } catch (err) {
      console.error('Error loading clients:', err);
    }
  };

  const handleClientSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const clientId = e.target.value;
    setFormData(prev => ({ ...prev, clientId }));
    
    if (clientId) {
      const selectedClient = clients.find(c => c.id === clientId);
      if (selectedClient) {
        setFormData(prev => ({
          ...prev,
          clientName: `${selectedClient.firstName} ${selectedClient.lastName}`
        }));
      }
    }
  };

  const checkDuplicate = async () => {
    if (!formData.bank || !formData.operationNumber) return;
    
    setCheckingDuplicate(true);
    setDuplicateWarning('');
    
    try {
      const result = await depositReceiptService.checkDuplicateOperation(
        formData.bank,
        formData.operationNumber,
        initialData?.id
      );
      
      if (result.isDuplicate && result.existingReceipt) {
        setDuplicateWarning(
          `⚠️ ALERTA: Este número de operación ya existe para ${formData.bank}. ` +
          `Registrado el ${new Date(result.existingReceipt.createdAt).toLocaleString()} ` +
          `por ${result.existingReceipt.clientName}.`
        );
      }
    } catch (err) {
      console.error('Error checking duplicate:', err);
    } finally {
      setCheckingDuplicate(false);
    }
  };

  useEffect(() => {
    // Debounce duplicate check
    const timer = setTimeout(() => {
      if (formData.bank && formData.operationNumber) {
        checkDuplicate();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.bank, formData.operationNumber]);

  const validate = (): boolean => {
    setError('');
    
    if (!formData.clientName.trim()) {
      setError('El nombre del cliente es requerido.');
      return false;
    }
    
    if (!formData.bank.trim()) {
      setError('El banco es requerido.');
      return false;
    }
    
    if (!formData.depositAmount || parseFloat(formData.depositAmount) <= 0) {
      setError('El monto debe ser mayor a 0.');
      return false;
    }
    
    if (!formData.operationNumber.trim()) {
      setError('El número de operación es requerido.');
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
      const receipt: Omit<DepositReceipt, 'id'> = {
        clientName: formData.clientName,
        clientId: formData.clientId || undefined,
        bank: formData.bank,
        depositAmount: parseFloat(formData.depositAmount),
        depositCurrency: formData.depositCurrency,
        operationNumber: formData.operationNumber,
        counterpartyCurrency: formData.counterpartyCurrency,
        branchId: currentUser.branchId || '',
        createdBy: currentUser.id,
        createdAt: Date.now(),
        notes: formData.notes || undefined
      };
      
      await onSave(receipt);
    } catch (err: any) {
      setError(err.message || 'Error al guardar la boleta.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const inputClass = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gold-500 focus:ring-gold-500 sm:text-sm p-2 border";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Duplicate Warning */}
      {duplicateWarning && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
          <p className="text-sm text-yellow-800 font-medium">{duplicateWarning}</p>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Información del Cliente</h3>
        
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="clientId" className="block text-sm font-medium text-gray-700">
              Seleccionar Cliente (Opcional)
            </label>
            <select
              name="clientId"
              id="clientId"
              value={formData.clientId}
              onChange={handleClientSelect}
              className={inputClass}
            >
              <option value="">-- Ingresar manualmente --</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.firstName} {client.lastName} - {client.mobile}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="clientName" className="block text-sm font-medium text-gray-700">
              Nombre del Cliente *
            </label>
            <input
              type="text"
              name="clientName"
              id="clientName"
              required
              value={formData.clientName}
              onChange={handleChange}
              className={inputClass}
              placeholder="Nombre completo del cliente"
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Información del Depósito</h3>
        
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="bank" className="block text-sm font-medium text-gray-700">
              Banco *
            </label>
            <select
              name="bank"
              id="bank"
              required
              value={formData.bank}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Seleccionar banco...</option>
              {COMMON_BANKS.map(bank => (
                <option key={bank} value={bank}>{bank}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="depositAmount" className="block text-sm font-medium text-gray-700">
              Monto Depositado *
            </label>
            <input
              type="number"
              name="depositAmount"
              id="depositAmount"
              required
              step="0.01"
              min="0"
              value={formData.depositAmount}
              onChange={handleChange}
              className={inputClass}
              placeholder="0.00"
            />
          </div>

          <div>
            <label htmlFor="depositCurrency" className="block text-sm font-medium text-gray-700">
              Moneda Depositada *
            </label>
            <select
              name="depositCurrency"
              id="depositCurrency"
              required
              value={formData.depositCurrency}
              onChange={handleChange}
              className={inputClass}
            >
              {CURRENCIES.map(currency => (
                <option key={currency} value={currency}>
                  {CURRENCY_LABELS[currency]}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="operationNumber" className="block text-sm font-medium text-gray-700">
              Número de Operación * 
              {checkingDuplicate && <span className="ml-2 text-xs text-gray-500">Verificando...</span>}
            </label>
            <input
              type="text"
              name="operationNumber"
              id="operationNumber"
              required
              value={formData.operationNumber}
              onChange={handleChange}
              className={`${inputClass} ${duplicateWarning ? 'border-yellow-500' : ''}`}
              placeholder="Número de operación del banco"
            />
            <p className="mt-1 text-xs text-gray-500">
              Este número debe ser único por banco. El sistema detectará automáticamente duplicados.
            </p>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="counterpartyCurrency" className="block text-sm font-medium text-gray-700">
              Moneda de Contraparte * 
            </label>
            <select
              name="counterpartyCurrency"
              id="counterpartyCurrency"
              required
              value={formData.counterpartyCurrency}
              onChange={handleChange}
              className={inputClass}
            >
              {CURRENCIES.map(currency => (
                <option key={currency} value={currency}>
                  {CURRENCY_LABELS[currency]}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Por ejemplo: Si el cliente depositó ARS y compró USD, selecciona USD aquí.
            </p>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Notas Adicionales
            </label>
            <textarea
              name="notes"
              id="notes"
              rows={3}
              value={formData.notes}
              onChange={handleChange}
              className={inputClass}
              placeholder="Información adicional sobre el depósito..."
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" disabled={loading || checkingDuplicate}>
          {loading ? 'Guardando...' : initialData ? 'Actualizar Boleta' : 'Guardar Boleta'}
        </Button>
      </div>
    </form>
  );
};
