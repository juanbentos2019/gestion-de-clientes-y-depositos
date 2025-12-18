'use client';

import React, { useState, useEffect } from 'react';
import { DepositReceipt, User, CurrencyType } from '@/types';
import { Button } from '../ui/Button';
import { depositReceiptService } from '@/lib/services/depositReceiptService';
import { branchService } from '@/lib/services/branchService';

interface DepositReceiptListProps {
  currentUser: User;
  onAdd?: () => void;
}

const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  ARS: '$',
  BRL: 'R$',
  OTHER: ''
};

export const DepositReceiptList: React.FC<DepositReceiptListProps> = ({ currentUser, onAdd }) => {
  const [receipts, setReceipts] = useState<DepositReceipt[]>([]);
  const [filteredReceipts, setFilteredReceipts] = useState<DepositReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [bankFilter, setBankFilter] = useState('ALL');
  const [branchNames, setBranchNames] = useState<Record<string, string>>({});
  const [banks, setBanks] = useState<string[]>([]);

  useEffect(() => {
    loadReceipts();
    loadBranches();
  }, [currentUser]);

  useEffect(() => {
    filterReceipts();
  }, [receipts, searchTerm, bankFilter]);

  const loadReceipts = async () => {
    try {
      setLoading(true);
      let data: DepositReceipt[];
      
      if (currentUser.role === 'MASTER') {
        data = await depositReceiptService.getAllDepositReceipts();
      } else if (currentUser.branchId) {
        data = await depositReceiptService.getDepositReceiptsByBranch(currentUser.branchId);
      } else {
        data = [];
      }
      
      setReceipts(data);
      
      // Extract unique banks
      const uniqueBanks = Array.from(new Set(data.map(r => r.bank))).sort();
      setBanks(uniqueBanks);
    } catch (error) {
      console.error('Error loading receipts:', error);
      alert('Error al cargar boletas');
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

  const filterReceipts = () => {
    let filtered = [...receipts];

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(receipt =>
        receipt.clientName.toLowerCase().includes(term) ||
        receipt.operationNumber.toLowerCase().includes(term) ||
        receipt.bank.toLowerCase().includes(term)
      );
    }

    // Filter by bank
    if (bankFilter !== 'ALL') {
      filtered = filtered.filter(receipt => receipt.bank === bankFilter);
    }

    setFilteredReceipts(filtered);
  };

  const handleDelete = async (receipt: DepositReceipt) => {
    if (!window.confirm(`¿Eliminar boleta de ${receipt.clientName}?`)) return;

    try {
      await depositReceiptService.deleteDepositReceipt(receipt.id);
      await loadReceipts();
    } catch (error) {
      console.error('Error deleting receipt:', error);
      alert('Error al eliminar boleta');
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Boletas de Depósito</h2>
          <p className="text-sm text-gray-600 mt-1">
            Sistema con validación anti-fraude automática
          </p>
        </div>
        <Button onClick={onAdd || (() => {})} className="bg-gold-600 hover:bg-gold-700 text-white px-6 py-2">
          ➕ Nueva Boleta
        </Button>
      </div>

      {/* Alert */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-blue-800">
              ⚠️ <strong>Validación activa:</strong> El sistema detecta automáticamente números de operación duplicados por banco.
            </p>
          </div>
        </div>
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
              placeholder="Cliente, número de operación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gold-500 focus:border-gold-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Banco
            </label>
            <select
              value={bankFilter}
              onChange={(e) => setBankFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gold-500 focus:border-gold-500"
            >
              <option value="ALL">Todos los bancos</option>
              {banks.map(bank => (
                <option key={bank} value={bank}>{bank}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600">
        Mostrando {filteredReceipts.length} de {receipts.length} boletas
      </div>

      {/* Receipt List */}
      {filteredReceipts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">💸</div>
          <p className="text-gray-500 text-lg mb-4">No hay boletas para mostrar</p>
          <Button onClick={onAdd || (() => {})} className="bg-gold-600 hover:bg-gold-700 text-white px-6 py-3">
            ➕ Agregar la primera boleta
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReceipts.map(receipt => (
            <div
              key={receipt.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {receipt.clientName}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {branchNames[receipt.branchId] || 'Sin sucursal'}
                  </p>
                </div>
              </div>

              {/* Bank Info */}
              <div className="bg-gray-50 rounded p-3 mb-3">
                <div className="text-xs text-gray-500 mb-1">Banco</div>
                <div className="font-medium text-gray-900">{receipt.bank}</div>
                <div className="text-xs text-gray-600 mt-2">
                  Op. #{receipt.operationNumber}
                </div>
              </div>

              {/* Transaction Details */}
              <div className="space-y-2 mb-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Depositó:</span>
                  <span className="font-semibold text-green-600">
                    {CURRENCY_SYMBOLS[receipt.depositCurrency]}
                    {receipt.depositAmount.toLocaleString()} {receipt.depositCurrency}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Compró:</span>
                  <span className="font-semibold text-blue-600">
                    {receipt.counterpartyCurrency}
                  </span>
                </div>
              </div>

              {/* Date */}
              <div className="text-xs text-gray-500 mb-3">
                📅 {formatDate(receipt.createdAt)}
              </div>

              {/* Notes */}
              {receipt.notes && (
                <div className="text-xs text-gray-600 bg-yellow-50 p-2 rounded mb-3">
                  📝 {receipt.notes}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <Button
                  variant="danger"
                  onClick={() => handleDelete(receipt)}
                  className="text-xs px-3 py-1 flex-1"
                >
                  🗑️ Eliminar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
