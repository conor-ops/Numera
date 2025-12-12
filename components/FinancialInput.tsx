import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { FinancialItem } from '../types';

interface FinancialInputProps {
  title: string;
  items: FinancialItem[];
  onUpdate: (items: FinancialItem[]) => void;
  colorClass?: string;
  icon?: React.ReactNode;
}

const FinancialInput: React.FC<FinancialInputProps> = ({ 
  title, 
  items, 
  onUpdate, 
  colorClass = "bg-white",
  icon
}) => {
  const addItem = () => {
    onUpdate([...items, { id: crypto.randomUUID(), name: '', amount: 0 }]);
  };

  const updateItem = (id: string, field: keyof FinancialItem, value: string | number) => {
    const newItems = items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    onUpdate(newItems);
  };

  const removeItem = (id: string) => {
    onUpdate(items.filter(item => item.id !== id));
  };

  const total = items.reduce((acc, item) => acc + (item.amount || 0), 0);

  return (
    <div className={`p-6 rounded-xl shadow-sm border border-slate-200 ${colorClass}`}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
        </div>
        <span className="text-xl font-mono font-bold text-slate-700">
          ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Description"
              value={item.name}
              onChange={(e) => updateItem(item.id, 'name', e.target.value)}
              className="flex-grow p-2 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-accent outline-none bg-transparent"
            />
            <div className="relative w-32 md:w-40">
              <span className="absolute left-3 top-2 text-slate-400">$</span>
              <input
                type="number"
                placeholder="0.00"
                value={item.amount || ''}
                onChange={(e) => updateItem(item.id, 'amount', parseFloat(e.target.value))}
                onWheel={(e) => e.currentTarget.blur()}
                className="w-full p-2 pl-6 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-accent outline-none text-right bg-transparent"
              />
            </div>
            <button
              onClick={() => removeItem(item.id)}
              className="p-2 text-slate-400 hover:text-danger transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={addItem}
        className="mt-4 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-accent transition-colors"
      >
        <Plus size={16} />
        Add Item
      </button>
    </div>
  );
};

export default FinancialInput;
