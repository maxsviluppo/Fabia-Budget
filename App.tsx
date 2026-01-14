
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Home, 
  PieChart as PieChartIcon, 
  Trash2, 
  X, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Settings, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  CreditCard,
  AlertCircle,
  Cloud,
  CloudOff,
  RefreshCw,
  ArrowDownCircle
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

import { Transaction, CategoryConfig, DefaultCategoryIds, ButtonColor, FixedExpense } from './types';
import NeonButton from './components/NeonButton';
import { initDb, fetchAllData, saveTransactionDb, saveFixedExpenseDb, deleteTransactionDb, deleteFixedExpenseDb } from './services/dbService';

// --- Costanti ---

const DEFAULT_FIXED_EXPENSES: FixedExpense[] = [
  { id: 'mutuo', label: 'Mutuo', amount: 520, icon: '🏠', colorName: 'blue', paidMonths: [], group: 'mensile' },
  { id: 'findomestic', label: 'Findomestic', amount: 209, icon: '💳', colorName: 'red', paidMonths: [], group: 'mensile' },
  { id: 'cibo-zara', label: 'Cibo Zara', amount: 55, icon: '🐶', colorName: 'amber', paidMonths: [], group: 'mensile' },
  { id: 'tel-megan', label: 'Telefono Megan', amount: 36, icon: '📱', colorName: 'pink', paidMonths: [], group: 'mensile' },
  { id: 'tel-casa', label: 'Telefono Casa', amount: 46, icon: '☎️', colorName: 'cyan', paidMonths: [], group: 'mensile' },
  { id: 'condo-gero', label: 'Condo Gerolomini', amount: 32, icon: '🏢', colorName: 'purple', paidMonths: [], group: 'mensile' },
  { id: 'condo-bagno', label: 'Condo Bagnoli', amount: 30, icon: '🏘️', colorName: 'purple', paidMonths: [], group: 'mensile' },
  { id: 'tel-mio-meg', label: 'Cell Io & Meg', amount: 20, icon: '📲', colorName: 'emerald', paidMonths: [], group: 'mensile' },
  { id: 'gest-line', label: 'Gest Line', amount: 220, icon: '📉', colorName: 'gray', paidMonths: [], group: 'alternata' },
  { id: 'pegno', label: 'Pegno', amount: 300, icon: '💍', colorName: 'amber', paidMonths: [], group: 'alternata' },
  { id: 'ass-auto', label: 'Assicurazione Auto', amount: 570, icon: '🛡️', colorName: 'blue', paidMonths: [], group: 'alternata' },
  { id: 'bollo-auto', label: 'Bollo Auto', amount: 150, icon: '🚗', colorName: 'red', paidMonths: [], group: 'alternata' },
  { id: 'ade-26-05', label: 'Agenzia Entrate', amount: 222.11, icon: '🏛️', colorName: 'red', paidMonths: [], group: 'alternata', dueDate: '2026-05-31' },
  { id: 'ade-26-07', label: 'Agenzia Entrate', amount: 222.11, icon: '🏛️', colorName: 'red', paidMonths: [], group: 'alternata', dueDate: '2026-07-31' },
  { id: 'ade-26-11', label: 'Agenzia Entrate', amount: 222.11, icon: '🏛️', colorName: 'red', paidMonths: [], group: 'alternata', dueDate: '2026-11-30' },
  { id: 'ade-27-02', label: 'Agenzia Entrate', amount: 222.11, icon: '🏛️', colorName: 'red', paidMonths: [], group: 'alternata', dueDate: '2027-02-28' },
  { id: 'ade-27-05', label: 'Agenzia Entrate', amount: 222.11, icon: '🏛️', colorName: 'red', paidMonths: [], group: 'alternata', dueDate: '2027-05-31' },
  { id: 'ade-27-07', label: 'Agenzia Entrate', amount: 222.11, icon: '🏛️', colorName: 'red', paidMonths: [], group: 'alternata', dueDate: '2027-07-31' },
  { id: 'ade-27-11', label: 'Agenzia Entrate', amount: 222.11, icon: '🏛️', colorName: 'red', paidMonths: [], group: 'alternata', dueDate: '2027-11-30' },
];

const DEFAULT_CATEGORIES: CategoryConfig[] = [
  { id: DefaultCategoryIds.KRISTIAN, label: 'Kristian', type: 'expense', icon: '👦', colorClass: 'bg-blue-500', colorName: 'blue' },
  { id: DefaultCategoryIds.MEGAN, label: 'Megan', type: 'expense', icon: '👧', colorClass: 'bg-pink-500', colorName: 'pink' },
  { id: DefaultCategoryIds.ZARA, label: 'Zara', type: 'expense', icon: '🐶', colorClass: 'bg-amber-600', colorName: 'amber' },
  { id: DefaultCategoryIds.CASA, label: 'Casa', type: 'expense', icon: '🏠', colorClass: 'bg-purple-600', colorName: 'purple' },
  { id: DefaultCategoryIds.MACCHINA, label: 'Macchina', type: 'expense', icon: '🚗', colorClass: 'bg-red-500', colorName: 'red' },
  { id: DefaultCategoryIds.SPESA, label: 'Spesa', type: 'expense', icon: '🛒', colorClass: 'bg-green-500', colorName: 'green' },
  { id: DefaultCategoryIds.USCITE_ALTRO, label: 'Altro', type: 'expense', icon: '💸', colorClass: 'bg-gray-500', colorName: 'gray' },
  { id: DefaultCategoryIds.STIPENDIO, label: 'Stipendio', type: 'income', icon: '💼', colorClass: 'bg-emerald-500', colorName: 'emerald' },
  { id: DefaultCategoryIds.LEZIONI, label: 'Lezioni', type: 'income', icon: '📚', colorClass: 'bg-teal-500', colorName: 'teal' },
];

const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#6b7280'];

const STORAGE_KEY = 'lillabudget_transactions';
const FIXED_EXPENSES_KEY = 'lillabudget_fixed_expenses';

const StatCard = ({ title, amount, type, isVisible, subtitle, highlight }: { 
  title: string, 
  amount: number, 
  type: 'income' | 'expense' | 'total', 
  isVisible: boolean, 
  subtitle?: string, 
  highlight?: boolean 
}) => {
  const formatted = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(amount);
  let textColor = 'text-white';
  let icon = null;
  let bgGradient = 'from-slate-800 to-slate-900';
  let borderColor = 'border-white/10';

  if (type === 'income') { 
    textColor = 'text-emerald-400'; 
    icon = <TrendingUp className="text-emerald-500" size={20} />; 
    bgGradient = 'from-emerald-900/10 to-slate-900'; 
    borderColor = 'border-emerald-500/20'; 
  }
  if (type === 'expense') { 
    textColor = 'text-rose-400'; 
    icon = <TrendingDown className="text-rose-500" size={20} />; 
    bgGradient = 'from-rose-900/10 to-slate-900'; 
    borderColor = 'border-rose-500/20'; 
  }
  if (type === 'total') { 
    textColor = 'text-lilla-300'; 
    bgGradient = highlight ? 'from-lilla-600/20 to-slate-900' : 'from-lilla-900/10 to-slate-900'; 
    borderColor = highlight ? 'border-lilla-500/50' : 'border-lilla-500/20'; 
  }

  return (
    <div className={`bg-gradient-to-br ${bgGradient} backdrop-blur-md border ${borderColor} rounded-2xl p-5 flex flex-col items-center justify-center shadow-lg relative overflow-hidden transition-all ${highlight ? 'ring-1 ring-lilla-500/20 shadow-lilla-500/10' : ''}`}>
      <div className="absolute top-0 right-0 p-3 opacity-20">{icon}</div>
      <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">{title}</span>
      <span className={`text-xl md:text-2xl font-black ${textColor} drop-shadow-sm`}>{isVisible ? formatted : '••••••'}</span>
      {subtitle && <span className="text-[10px] text-gray-500 mt-1 uppercase font-bold text-center leading-tight">{subtitle}</span>}
    </div>
  );
};

export default function App() {
  const [view, setView] = useState<'home' | 'reports' | 'settings'>('home');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>(DEFAULT_FIXED_EXPENSES);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dbStatus, setDbStatus] = useState<'connected' | 'syncing' | 'error' | 'idle'>('idle');

  const [txModalOpen, setTxModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryConfig | null>(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [deleteFixedModalOpen, setDeleteFixedModalOpen] = useState(false);
  const [fixedToDelete, setFixedToDelete] = useState<string | null>(null);

  // --- Inizializzazione e Sincronizzazione Cloud ---
  useEffect(() => {
    const loadInitialData = async () => {
      // 1. Carica da localStorage per velocità
      const sTx = localStorage.getItem(STORAGE_KEY);
      const sFx = localStorage.getItem(FIXED_EXPENSES_KEY);
      if (sTx) setTransactions(JSON.parse(sTx));
      if (sFx) setFixedExpenses(JSON.parse(sFx));

      // 2. Prova a inizializzare e scaricare da Neon
      if (process.env.DATABASE_URL) {
        setDbStatus('syncing');
        await initDb();
        const cloudData = await fetchAllData();
        if (cloudData) {
          setTransactions(cloudData.transactions);
          setFixedExpenses(cloudData.fixedExpenses);
          setDbStatus('connected');
        } else {
          setDbStatus('error');
        }
      }
    };

    loadInitialData();
  }, []);

  // --- Persistenza locale ---
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    localStorage.setItem(FIXED_EXPENSES_KEY, JSON.stringify(fixedExpenses));
  }, [transactions, fixedExpenses]);

  const currentMonthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  const getMonthName = (d: Date) => new Intl.DateTimeFormat('it-IT', { month: 'long', year: 'numeric' }).format(d);
  
  const changeMonth = (inc: number) => { 
    const n = new Date(currentDate); 
    n.setMonth(n.getMonth() + inc); 
    setCurrentDate(n); 
  };

  const handleSaveTransaction = async () => {
    if (!amount || !selectedCategory) return;
    const v = parseFloat(amount);
    if (isNaN(v)) return;

    const newTx: Transaction = { 
      id: crypto.randomUUID(), 
      type: selectedCategory.type, 
      category: selectedCategory.id, 
      amount: v, 
      description, 
      date 
    };

    setTransactions(prev => [newTx, ...prev]);
    setTxModalOpen(false);

    // Salva su Cloud
    setDbStatus('syncing');
    await saveTransactionDb(newTx);
    setDbStatus('connected');
  };

  const togglePaidFixed = async (id: string) => {
    let updatedExpense: FixedExpense | null = null;

    setFixedExpenses(prev => prev.map(fe => {
      if (fe.id === id) {
        const isPaid = fe.paidMonths.includes(currentMonthKey);
        updatedExpense = { 
          ...fe, 
          paidMonths: isPaid 
            ? fe.paidMonths.filter(m => m !== currentMonthKey) 
            : [...fe.paidMonths, currentMonthKey] 
        };
        return updatedExpense;
      } 
      return fe;
    }));

    // Salva su Cloud
    if (updatedExpense) {
      setDbStatus('syncing');
      await saveFixedExpenseDb(updatedExpense);
      setDbStatus('connected');
    }
  };

  const residue = useMemo(() => {
    const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const pastManual = transactions
      .filter(t => new Date(t.date) < start)
      .reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc - t.amount, 0);
    
    let pastFixed = 0;
    fixedExpenses.forEach(fe => fe.paidMonths.forEach(m => {
      const [y, mm] = m.split('-').map(Number); 
      if (new Date(y, mm - 1, 1) < start) pastFixed += fe.amount;
    }));
    return pastManual - pastFixed;
  }, [transactions, fixedExpenses, currentDate]);

  const monthlyTrans = useMemo(() => transactions.filter(t => {
    const d = new Date(t.date); 
    return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
  }), [transactions, currentDate]);

  const monthlyInc = monthlyTrans.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0);
  const monthlyManExp = monthlyTrans.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0);
  const monthlyFixPaid = fixedExpenses
    .filter(fe => fe.paidMonths.includes(currentMonthKey))
    .reduce((a, b) => a + b.amount, 0);
  
  const totalAvail = residue + monthlyInc;
  const actualSpent = monthlyManExp + monthlyFixPaid;
  const currentBal = totalAvail - actualSpent;

  const expensesByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    monthlyTrans.forEach(tx => {
      if (tx.type === 'expense') {
        const cat = DEFAULT_CATEGORIES.find(c => c.id === tx.category);
        const label = cat ? cat.label : 'Altro';
        counts[label] = (counts[label] || 0) + tx.amount;
      }
    });
    fixedExpenses.forEach(fe => {
      if (fe.paidMonths.includes(currentMonthKey)) {
        counts[fe.label] = (counts[fe.label] || 0) + fe.amount;
      }
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [monthlyTrans, fixedExpenses, currentMonthKey]);

  const monthlyData = useMemo(() => [
    { name: 'Disponibile', amount: totalAvail },
    { name: 'Speso', amount: actualSpent }
  ], [totalAvail, actualSpent]);

  const visibleFixed = useMemo(() => {
    return fixedExpenses.filter(fe => {
      if (!fe.dueDate) return true;
      const [y, m] = fe.dueDate.split('-').map(Number);
      return y === currentDate.getFullYear() && (m - 1) === currentDate.getMonth();
    });
  }, [fixedExpenses, currentDate]);

  const hasUrgentDeadline = useMemo(() => {
    return visibleFixed.some(f => f.dueDate && !f.paidMonths.includes(currentMonthKey));
  }, [visibleFixed, currentMonthKey]);

  const renderHome = () => (
    <div className="space-y-8 animate-in fade-in pb-10">
      <div className="flex items-center justify-between bg-white/5 backdrop-blur-md rounded-2xl p-2 border border-white/10 shadow-lg mx-1">
        <button onClick={() => changeMonth(-1)} className="p-2 text-lilla-400 hover:text-white">
          <ChevronLeft size={24} />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Periodo Gestione</span>
          <span className="text-lg font-black text-white capitalize">{getMonthName(currentDate)}</span>
        </div>
        <button onClick={() => changeMonth(1)} className="p-2 text-lilla-400 hover:text-white">
          <ChevronRight size={24} />
        </button>
      </div>

      {hasUrgentDeadline && (
        <div className="mx-1 bg-red-600/20 border border-red-500/50 rounded-2xl p-4 flex items-center gap-4 animate-pulse">
           <AlertCircle className="text-red-500 shrink-0" size={32} />
           <div>
             <p className="text-red-100 font-black uppercase text-xs tracking-tighter">Scadenza Agenzia Entrate!</p>
             <p className="text-red-200/70 text-[10px] font-bold">Hai una rata fiscale in sospeso questo mese.</p>
           </div>
        </div>
      )}

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Entrate + Residuo" amount={totalAvail} type="income" isVisible={true} subtitle={`Residuo Precedente: ${residue.toFixed(2)}€`} />
        <StatCard title="Speso nel Mese" amount={actualSpent} type="expense" isVisible={true} subtitle="Somma spunte + extra" />
        <StatCard title="Budget Attuale" amount={currentBal} type="total" isVisible={true} highlight subtitle="Soldi rimasti oggi" />
      </section>

      <section className="bg-[#1a1625] border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <h2 className="text-lilla-100 text-lg uppercase tracking-widest font-black flex items-center gap-3 mb-6">
           <CheckCircle2 className="text-lilla-400" size={20}/> Monitor Fisse & Scadenze
        </h2>
        
        <div className="space-y-8">
          <div>
            <span className="text-[10px] font-black uppercase text-lilla-400 tracking-widest border-b border-white/5 block mb-4 pb-1">Fisse Ricorrenti</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {visibleFixed.filter(f => f.group === 'mensile').map(fe => {
                const p = fe.paidMonths.includes(currentMonthKey);
                return (
                  <button 
                    key={fe.id} 
                    onClick={() => togglePaidFixed(fe.id)} 
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${p ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-white/5 border-white/10 hover:border-lilla-500/30'}`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xl">{fe.icon}</span>
                      <div className="text-left">
                        <p className={`font-bold text-xs truncate ${p ? 'text-emerald-300' : 'text-gray-200'}`}>{fe.label}</p>
                        <p className="text-[10px] text-gray-500 font-black">{fe.amount.toFixed(2)}€</p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${p ? 'bg-emerald-500 text-white' : 'bg-white/10 text-gray-600'}`}>
                      {p && <Check size={12} strokeWidth={4} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-black uppercase text-amber-500 tracking-widest border-b border-white/5 block mb-4 pb-1">Scadenze Straordinarie</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {visibleFixed.filter(f => f.group === 'alternata' || !f.group).map(fe => {
                const p = fe.paidMonths.includes(currentMonthKey);
                const isFiscal = !!fe.dueDate;
                return (
                  <button 
                    key={fe.id} 
                    onClick={() => togglePaidFixed(fe.id)} 
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all relative ${isFiscal ? (p ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-red-600/10 border-red-500/60 shadow-lg shadow-red-500/10') : (p ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-white/5 border-white/10 hover:border-lilla-500/30'}`}
                  >
                    {isFiscal && !p && <span className="absolute -top-2 -right-1 bg-red-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase">Rata Fiscali</span>}
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xl">{fe.icon}</span>
                      <div className="text-left">
                          <p className={`font-bold text-xs truncate ${p ? 'text-emerald-300' : (isFiscal ? 'text-red-400' : 'text-gray-200')}`}>{fe.label}</p>
                          <p className="text-[10px] text-gray-500 font-black">{fe.amount.toFixed(2)}€</p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${p ? 'bg-emerald-500 text-white' : 'bg-white/10'}`}>
                      {p && <Check size={12} strokeWidth={4} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
          <h2 className="text-lilla-100 text-lg uppercase tracking-widest font-black mb-4 flex items-center gap-3">
            <ArrowDownCircle className="text-rose-400" /> Movimenti Extra
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {DEFAULT_CATEGORIES.map(cat => (
                <NeonButton key={cat.id} onClick={() => { setSelectedCategory(cat); setTxModalOpen(true); }} color={cat.colorName} square>
                  <span className="text-4xl">{cat.icon}</span>
                  <span className="text-xs font-bold mt-2 uppercase">{cat.label}</span>
                </NeonButton>
              ))}
          </div>
      </section>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-8 animate-in slide-in-from-right px-1">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#1a1625] rounded-3xl p-6 shadow-xl border border-white/5">
            <h3 className="text-lilla-200 mb-4 font-black uppercase text-xs tracking-widest text-center">Analisi Categorie</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={expensesByCategory} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {expensesByCategory.map((_, i) => <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-[#1a1625] rounded-3xl p-6 shadow-xl border border-white/5">
            <h3 className="text-lilla-200 mb-4 font-black uppercase text-xs tracking-widest text-center">Riepilogo Mensile</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid stroke="#ffffff05" vertical={false}/>
                  <XAxis dataKey="name" stroke="#a78bfa" fontSize={10}/>
                  <YAxis stroke="#a78bfa" fontSize={10}/>
                  <Tooltip/>
                  <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                    {monthlyData.map((e, i) => <Cell key={`bar-${i}`} fill={e.name === 'Disponibile' ? '#10b981' : '#f43f5e'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-8 max-w-2xl mx-auto pb-10 px-1">
      <section className="bg-[#1a1625] rounded-3xl p-8 shadow-xl border border-white/5">
         <h2 className="text-xl font-black text-white mb-6 flex items-center gap-3 uppercase tracking-tight">
           <CreditCard className="text-blue-600" /> Archivio Fisse & Scadenze
         </h2>
         <div className="space-y-3">
            {fixedExpenses.sort((a,b) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999')).map(fe => (
              <div key={fe.id} className={`flex items-center justify-between bg-white/5 p-4 rounded-xl border transition-colors group ${fe.dueDate ? 'border-red-500/20' : 'border-white/5'}`}>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{fe.icon}</span>
                  <div>
                    <span className="font-black text-gray-100 block text-sm">
                        {fe.label} 
                        {fe.dueDate && <span className="text-[8px] bg-red-600 text-white px-1.5 py-0.5 rounded-full uppercase ml-1">{fe.dueDate.split('-').reverse().join('/')}</span>}
                    </span>
                    <span className="text-[10px] text-gray-500 font-black uppercase">{fe.amount.toFixed(2)}€</span>
                  </div>
                </div>
                <button onClick={() => { setFixedToDelete(fe.id); setDeleteFixedModalOpen(true); }} className="text-gray-500 hover:text-rose-500 p-2 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
         </div>
      </section>

      <section className="bg-red-950/10 border border-red-500/20 rounded-3xl p-8 shadow-xl text-center">
        <h2 className="text-lg font-black text-white mb-6 uppercase tracking-tight">Manutenzione Dati</h2>
        <div className="grid grid-cols-2 gap-4">
            <button onClick={() => setResetModalOpen(true)} className="w-full bg-red-600/20 border border-red-500/30 text-red-100 font-black py-4 rounded-xl uppercase text-xs">Reset App</button>
            <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="w-full bg-white/5 border border-white/10 text-gray-400 font-black py-4 rounded-xl uppercase text-xs">Svuota Cache</button>
        </div>
      </section>
    </div>
  );

  return (
    <div className="min-h-screen bg-darksoft text-gray-100 font-sans pb-10 relative overflow-x-hidden">
       <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px]"></div>
         <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-lilla-600/5 rounded-full blur-[140px]"></div>
       </div>

       <div className="relative z-10 max-w-6xl mx-auto px-4 py-6">
          <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
            <div className="cursor-pointer group flex items-center gap-4" onClick={() => setView('home')}>
              <div className="bg-gradient-to-br from-lilla-500 to-purple-600 p-2.5 rounded-2xl text-white shadow-neon transform group-hover:scale-110 transition-all">
                <Wallet size={28} />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-lilla-300 leading-none">Fabia Budget</h1>
                  {dbStatus === 'connected' && <Cloud className="text-emerald-400 animate-pulse" size={18} />}
                  {dbStatus === 'syncing' && <RefreshCw className="text-amber-400 animate-spin" size={18} />}
                  {dbStatus === 'error' && <CloudOff className="text-rose-500" size={18} />}
                </div>
                <p className="text-[10px] text-lilla-400 font-black uppercase tracking-[0.25em] mt-1">Gestione Casa</p>
              </div>
            </div>
            <nav className="flex bg-[#1a1625]/80 backdrop-blur-md rounded-2xl p-1.5 border border-white/10 shadow-xl">
               <button onClick={() => setView('home')} className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${view === 'home' ? 'bg-lilla-600 text-white shadow-md' : 'text-gray-500 hover:text-white'}`}>
                 <Home size={16} /> Home
               </button>
               <button onClick={() => setView('reports')} className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${view === 'reports' ? 'bg-lilla-600 text-white shadow-md' : 'text-gray-500 hover:text-white'}`}>
                 <PieChartIcon size={16} /> Analisi
               </button>
               <button onClick={() => setView('settings')} className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${view === 'settings' ? 'bg-lilla-600 text-white shadow-md' : 'text-gray-500 hover:text-white'}`}>
                 <Settings size={16} /> Archivio
               </button>
            </nav>
          </header>

          <main className="max-w-5xl mx-auto">
            {view === 'home' && renderHome()}
            {view === 'reports' && renderReports()}
            {view === 'settings' && renderSettings()}
          </main>
       </div>

       {txModalOpen && selectedCategory && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in">
           <div className="bg-[#13111C] border border-white/10 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative animate-in zoom-in-95">
             <button onClick={() => setTxModalOpen(false)} className="absolute top-5 right-5 text-gray-500 hover:text-white bg-white/5 p-2 rounded-full">
               <X size={20} />
             </button>
             <div className="text-center mb-8">
                <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center text-5xl mb-4 shadow-xl ${selectedCategory.colorClass} text-white`}>
                  {selectedCategory.icon}
                </div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Registra {selectedCategory.label}</h2>
             </div>
             <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Importo (€)</label>
                  <input 
                    type="number" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                    placeholder="0.00" 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-4xl font-black text-white focus:outline-none text-center"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Nota</label>
                  <input 
                    type="text" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold focus:outline-none"
                  />
                </div>
                <div className="pt-6">
                  <NeonButton onClick={handleSaveTransaction} fullWidth color={selectedCategory.colorName}>Conferma</NeonButton>
                </div>
             </div>
           </div>
         </div>
       )}

       {resetModalOpen && (
         <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl animate-in fade-in">
            <div className="bg-red-950/20 border border-red-500/40 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl text-center">
                <div className="bg-red-600 p-6 rounded-full text-white mx-auto mb-8 w-fit animate-pulse">
                  <AlertTriangle size={48} />
                </div>
                <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">RESET TOTALE?</h3>
                <p className="text-red-200/60 text-sm mb-10">Tutte le transazioni e le rate verranno cancellate.</p>
                <div className="flex flex-col gap-3">
                  <button onClick={() => setResetModalOpen(false)} className="w-full bg-white/5 hover:bg-white/10 py-5 rounded-2xl font-black uppercase text-xs transition-all">
                    Annulla
                  </button>
                  <button 
                    onClick={async () => { 
                      localStorage.clear(); 
                      // Potrebbe essere utile un comando di pulizia DB qui
                      window.location.reload(); 
                    }} 
                    className="w-full bg-red-600 hover:bg-red-700 py-5 rounded-2xl font-black uppercase text-xs text-white shadow-xl shadow-red-600/30 transition-all"
                  >
                    Sì, Svuota Tutto
                  </button>
                </div>
            </div>
         </div>
       )}

       {deleteFixedModalOpen && (
         <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
            <div className="bg-[#13111C] border border-white/10 w-full max-w-sm rounded-[2rem] p-8 shadow-2xl text-center">
                <div className="bg-rose-500/20 p-5 rounded-full text-rose-500 mx-auto mb-6 w-fit">
                  <AlertTriangle size={40} />
                </div>
                <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Eliminare Voce?</h3>
                <p className="text-gray-500 text-sm mb-8 font-medium italic leading-tight">Verrà rimossa definitivamente dal bilancio pianificato.</p>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setDeleteFixedModalOpen(false)} className="bg-white/5 hover:bg-white/10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all">No</button>
                  <button 
                    onClick={async () => {
                      if (fixedToDelete) {
                        setFixedExpenses(prev => prev.filter(f => f.id !== fixedToDelete));
                        await deleteFixedExpenseDb(fixedToDelete);
                        setDeleteFixedModalOpen(false);
                        setFixedToDelete(null);
                      }
                    }} 
                    className="bg-rose-600 hover:bg-rose-700 py-4 rounded-2xl font-black uppercase text-xs tracking-widest text-white shadow-lg shadow-rose-600/20 transition-all"
                  >
                    Sì, Elimina
                  </button>
                </div>
            </div>
         </div>
       )}
    </div>
  );
}
