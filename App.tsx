import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowRightLeft, 
  Wallet, 
  CreditCard, 
  PiggyBank, 
  TrendingUp, 
  BrainCircuit, 
  RefreshCcw 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

import { FinancialItem, BusinessData, CalculationResult, BankAccount, AccountType } from './types';
import FinancialInput from './components/FinancialInput';
import BankInput from './components/BankInput';
import { generateFinancialInsight } from './services/geminiService';

const INITIAL_DATA: BusinessData = {
  accountsReceivable: [],
  accountsPayable: [],
  creditCards: [],
  bankAccounts: [
    { id: '1', name: 'Main', bankName: 'Bank 1', type: AccountType.SAVINGS, amount: 0 },
    { id: '2', name: 'Main', bankName: 'Bank 1', type: AccountType.CHECKING, amount: 0 },
  ],
};

function App() {
  // State initialization
  const [data, setData] = useState<BusinessData>(() => {
    const saved = localStorage.getItem('bizbalance_data');
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });

  const [aiInsight, setAiInsight] = useState<string>('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [useStrictFormula, setUseStrictFormula] = useState(false); // Toggle for user's specific requested formula logic

  // Persistence
  useEffect(() => {
    localStorage.setItem('bizbalance_data', JSON.stringify(data));
  }, [data]);

  // Calculations
  const calculations: CalculationResult = useMemo(() => {
    const totalAR = data.accountsReceivable.reduce((acc, i) => acc + (i.amount || 0), 0);
    const totalAP = data.accountsPayable.reduce((acc, i) => acc + (i.amount || 0), 0);
    const totalCredit = data.creditCards.reduce((acc, i) => acc + (i.amount || 0), 0);
    const totalBank = data.bankAccounts.reduce((acc, i) => acc + (i.amount || 0), 0);

    // Grouping for "B1", "B2" etc based on bankName
    const bankBreakdown: Record<string, number> = {};
    data.bankAccounts.forEach(acc => {
      const name = acc.bankName || 'Other';
      bankBreakdown[name] = (bankBreakdown[name] || 0) + (acc.amount || 0);
    });

    const netReceivables = totalAR - totalAP; // (AR - AP)
    const netBank = totalBank - totalCredit;   // (B - C)
    
    // Logic decision: User asked for (AR - AP) - (B - C).
    // However, mathematically (AR-AP) + (B-C) represents Equity/Net Worth.
    // We will support both via a toggle, but default to the Addition one for better UX initial experience,
    // or stick to strict if they prefer.
    
    // Formula 1 (Strict Request): (AR - AP) - (B - C)
    const bneStrict = netReceivables - netBank;
    
    // Formula 2 (Standard Equity): (AR - AP) + (B - C) => (AR + B) - (AP + C)
    const bneEquity = netReceivables + netBank;

    const bne = useStrictFormula ? bneStrict : bneEquity;
    const operator = useStrictFormula ? '-' : '+';
    const bneFormulaStr = `(AR - AP) ${operator} (B - C)`;

    return {
      totalAR,
      totalAP,
      totalCredit,
      totalBank,
      bankBreakdown,
      netReceivables,
      netBank,
      bne,
      bneFormulaStr
    };
  }, [data, useStrictFormula]);

  // Handlers
  const handleUpdate = (key: keyof BusinessData, items: FinancialItem[] | BankAccount[]) => {
    setData(prev => ({ ...prev, [key]: items }));
  };

  const handleAiGenerate = async () => {
    if (!process.env.API_KEY) {
        alert("Please set a valid API_KEY in your environment to use this feature.");
        return;
    }
    setIsGeneratingAi(true);
    const bankDetails = Object.entries(calculations.bankBreakdown)
        .map(([name, amount]) => `${name}: $${amount.toFixed(2)}`)
        .join(', ');
        
    const result = await generateFinancialInsight(calculations, bankDetails);
    setAiInsight(result);
    setIsGeneratingAi(false);
  };

  const chartData = [
    { name: 'Assets', value: calculations.totalAR + calculations.totalBank, fill: '#10b981' },
    { name: 'Liabilities', value: calculations.totalAP + calculations.totalCredit, fill: '#ef4444' },
    { name: 'Net (BNE)', value: calculations.bne, fill: '#3b82f6' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 pb-32">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="text-accent" />
              BizBalance
            </h1>
            <p className="text-slate-500 mt-1">Real-time Business Net Exact (BNE) Calculator</p>
          </div>
          <div className="flex items-center gap-4 bg-white p-2 rounded-lg shadow-sm border border-slate-200">
             <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2">Formula Mode</span>
             <div className="flex bg-slate-100 rounded p-1">
                <button 
                  onClick={() => setUseStrictFormula(false)}
                  className={`px-3 py-1 text-xs font-medium rounded transition-all ${!useStrictFormula ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
                >
                    Standard (Add)
                </button>
                <button 
                  onClick={() => setUseStrictFormula(true)}
                  className={`px-3 py-1 text-xs font-medium rounded transition-all ${useStrictFormula ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
                >
                    Strict (Subtract)
                </button>
             </div>
          </div>
        </header>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          
          {/* Main BNE Card */}
          <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
             <div className="absolute top-0 right-0 p-32 bg-accent opacity-10 rounded-full translate-x-10 -translate-y-10 blur-3xl"></div>
             <h2 className="text-slate-300 font-medium mb-1 flex items-center gap-2">
               Business Net Exact (BNE)
               <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 font-mono">
                 {calculations.bneFormulaStr}
               </span>
             </h2>
             <div className="text-4xl md:text-5xl font-bold font-mono tracking-tight my-4">
               ${calculations.bne.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
             </div>
             <div className="flex gap-6 text-sm text-slate-400">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wider mb-1">Net Receivables (AR-AP)</span>
                  <span className={calculations.netReceivables >= 0 ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                    ${calculations.netReceivables.toLocaleString()}
                  </span>
                </div>
                <div className="w-px bg-slate-700 h-10"></div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wider mb-1">Net Cash (B-C)</span>
                  <span className={calculations.netBank >= 0 ? "text-blue-400 font-bold" : "text-rose-400 font-bold"}>
                    ${calculations.netBank.toLocaleString()}
                  </span>
                </div>
             </div>
          </div>

          {/* Breakdown Cards */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-center">
            <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wide mb-2">Liquid Assets (B)</h3>
            <div className="text-2xl font-bold text-slate-800 mb-2">
              ${calculations.totalBank.toLocaleString()}
            </div>
             <div className="space-y-1">
                {Object.entries(calculations.bankBreakdown).map(([name, amount]) => (
                    <div key={name} className="flex justify-between text-xs text-slate-500">
                        <span>{name} Total</span>
                        <span>${amount.toLocaleString()}</span>
                    </div>
                ))}
             </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-center">
             <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wide mb-2">Quick Stats</h3>
             <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Total AP</span>
                    <span className="text-sm font-bold text-rose-600">${calculations.totalAP.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Total Credit</span>
                    <span className="text-sm font-bold text-rose-600">${calculations.totalCredit.toLocaleString()}</span>
                </div>
                <div className="h-px bg-slate-100 my-2"></div>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Total AR</span>
                    <span className="text-sm font-bold text-emerald-600">${calculations.totalAR.toLocaleString()}</span>
                </div>
             </div>
          </div>

        </div>

        {/* Input Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="space-y-6">
            <BankInput 
              accounts={data.bankAccounts} 
              onUpdate={(items) => handleUpdate('bankAccounts', items)} 
            />
            <FinancialInput
              title="Credit Cards (C)"
              items={data.creditCards}
              onUpdate={(items) => handleUpdate('creditCards', items)}
              colorClass="bg-rose-50 border-rose-100"
              icon={<CreditCard className="text-rose-600" size={24} />}
            />
          </div>

          <div className="space-y-6">
            <FinancialInput
              title="Accounts Receivable (AR)"
              items={data.accountsReceivable}
              onUpdate={(items) => handleUpdate('accountsReceivable', items)}
              colorClass="bg-emerald-50 border-emerald-100"
              icon={<ArrowRightLeft className="text-emerald-600" size={24} />}
            />
             <FinancialInput
              title="Accounts Payable (AP)"
              items={data.accountsPayable}
              onUpdate={(items) => handleUpdate('accountsPayable', items)}
              colorClass="bg-amber-50 border-amber-100"
              icon={<Wallet className="text-amber-600" size={24} />}
            />
          </div>

          {/* Analytics & AI */}
          <div className="space-y-6">
             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-80">
                <h3 className="text-slate-800 font-bold mb-4 flex items-center gap-2">
                    <PiggyBank size={20} className="text-slate-500" />
                    Distribution
                </h3>
                <ResponsiveContainer width="100%" height="90%">
                    <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                        <YAxis hide />
                        <Tooltip 
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
             </div>

             <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-xl border border-indigo-100">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-indigo-900 font-bold flex items-center gap-2">
                        <BrainCircuit size={20} />
                        AI Financial Insight
                    </h3>
                    <button 
                        onClick={handleAiGenerate}
                        disabled={isGeneratingAi}
                        className="p-2 bg-white text-indigo-600 rounded-full hover:bg-indigo-50 shadow-sm border border-indigo-100 disabled:opacity-50 transition-all"
                    >
                        {isGeneratingAi ? <RefreshCcw className="animate-spin" size={16}/> : <BrainCircuit size={16}/>}
                    </button>
                </div>
                
                <div className="min-h-[100px] text-sm text-indigo-800 leading-relaxed">
                    {isGeneratingAi ? (
                        <div className="flex items-center gap-2 text-indigo-400">
                            <span className="animate-pulse">Analyzing financial data...</span>
                        </div>
                    ) : aiInsight ? (
                        <div className="prose prose-sm prose-indigo">
                            {aiInsight}
                        </div>
                    ) : (
                        <p className="text-indigo-400 italic">
                            Click the brain icon to generate a liquidity and solvency analysis based on your current inputs.
                        </p>
                    )}
                </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;
