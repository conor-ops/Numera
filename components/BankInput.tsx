import React from 'react';
import { Plus, Trash2, Building2 } from 'lucide-react';
import { BankAccount, AccountType } from '../types';

interface BankInputProps {
  accounts: BankAccount[];
  onUpdate: (accounts: BankAccount[]) => void;
}

const BankInput: React.FC<BankInputProps> = ({ accounts, onUpdate }) => {
  const addAccount = () => {
    onUpdate([
      ...accounts, 
      { 
        id: crypto.randomUUID(), 
        name: 'Bank 1', 
        bankName: 'Bank 1',
        type: AccountType.CHECKING, 
        amount: 0 
      }
    ]);
  };

  const updateAccount = (id: string, field: keyof BankAccount, value: string | number | AccountType) => {
    const newAccounts = accounts.map(acc => {
      if (acc.id === id) {
        return { ...acc, [field]: value };
      }
      return acc;
    });
    onUpdate(newAccounts);
  };

  const removeAccount = (id: string) => {
    onUpdate(accounts.filter(acc => acc.id !== id));
  };

  const total = accounts.reduce((acc, item) => acc + (item.amount || 0), 0);

  return (
    <div className="p-6 rounded-xl shadow-sm border border-slate-200 bg-white col-span-1 md:col-span-2 lg:col-span-1">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 text-blue-700">
          <Building2 size={24} />
          <h3 className="text-lg font-bold">Bank Accounts</h3>
        </div>
        <span className="text-xl font-mono font-bold text-slate-700">
          ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>

      <div className="space-y-4">
        {accounts.map((acc) => (
          <div key={acc.id} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="flex flex-col gap-2 flex-grow w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Bank Name (e.g. Bank 1)"
                  value={acc.bankName}
                  onChange={(e) => updateAccount(acc.id, 'bankName', e.target.value)}
                  className="p-2 text-sm font-semibold border-b border-slate-200 focus:border-accent outline-none bg-transparent"
                />
                <div className="flex gap-2">
                    <select
                        value={acc.type}
                        onChange={(e) => updateAccount(acc.id, 'type', e.target.value as AccountType)}
                        className="p-1 text-xs border border-slate-200 rounded bg-white text-slate-600"
                    >
                        <option value={AccountType.CHECKING}>Checking</option>
                        <option value={AccountType.SAVINGS}>Savings</option>
                    </select>
                </div>
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                <div className="relative flex-grow sm:w-32">
                <span className="absolute left-3 top-2 text-slate-400">$</span>
                <input
                    type="number"
                    placeholder="0.00"
                    value={acc.amount || ''}
                    onChange={(e) => updateAccount(acc.id, 'amount', parseFloat(e.target.value))}
                    onWheel={(e) => e.currentTarget.blur()}
                    className="w-full p-2 pl-6 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-accent outline-none text-right"
                />
                </div>
                <button
                onClick={() => removeAccount(acc.id)}
                className="p-2 text-slate-400 hover:text-danger transition-colors"
                >
                <Trash2 size={18} />
                </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addAccount}
        className="mt-4 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-accent transition-colors"
      >
        <Plus size={16} />
        Add Bank Account
      </button>
    </div>
  );
};

export default BankInput;
