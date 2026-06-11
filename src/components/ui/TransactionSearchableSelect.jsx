import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/axios';
import { formatDate } from '@/utils/formatters';

const TransactionSearchableSelect = ({ value, onChange, statusFilter = null, placeholder = 'Pilih Transaksi...' }) => {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['transactionSearch', search, statusFilter],
    queryFn: async () => {
      const params = { all: true };
      if (search) params.search = search;
      if (statusFilter !== null) params.status = statusFilter;
      const response = await api.get('/sales-transactions', { params });
      return response.data?.sales_transactions || [];
    },
    enabled: isOpen,
  });

  useEffect(() => {
    if (value && !selectedTransaction) {
      const fetchTransaction = async () => {
        try {
          const response = await api.get(`/sales-transactions/${value}`);
          setSelectedTransaction(response.data);
        } catch (error) {
          console.error('Failed to fetch transaction', error);
        }
      };
      fetchTransaction();
    }
  }, [value, selectedTransaction]);

  const handleSelect = (transaction) => {
    setSelectedTransaction(transaction);
    onChange(transaction.id);
    setIsOpen(false);
    setSearch('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setSelectedTransaction(null);
    onChange(null);
    setSearch('');
  };

  return (
    <div className="relative">
      <div
        className="flex items-center justify-between border border-slate-300 rounded-md px-3 py-2 cursor-pointer bg-white hover:border-slate-400"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`text-sm ${selectedTransaction ? 'text-slate-900' : 'text-slate-400'}`}>
          {selectedTransaction
            ? `${selectedTransaction.no_invoice} - ${formatDate(selectedTransaction.transaction_date)}`
            : placeholder}
        </span>
        <div className="flex items-center gap-2">
          {selectedTransaction && (
            <button
              type="button"
              onClick={handleClear}
              className="text-slate-400 hover:text-slate-600"
            >
              ×
            </button>
          )}
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-300 rounded-md shadow-lg max-h-60 overflow-auto">
          <div className="p-2 border-b">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari no faktur..."
              className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:border-blue-500"
              autoFocus
            />
          </div>
          {isLoading ? (
            <div className="p-4 text-center text-sm text-slate-500">Loading...</div>
          ) : data && data.length > 0 ? (
            <div>
              {data.map((transaction) => (
                <div
                  key={transaction.id}
                  className="px-3 py-2 text-sm hover:bg-slate-100 cursor-pointer"
                  onClick={() => handleSelect(transaction)}
                >
                  <div className="font-medium">{transaction.no_invoice}</div>
                  <div className="text-xs text-slate-500">
                    {formatDate(transaction.transaction_date)} - {transaction.sales_associate?.name}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-slate-500">Tidak ada transaksi</div>
          )}
        </div>
      )}
    </div>
  );
};

export default TransactionSearchableSelect;
