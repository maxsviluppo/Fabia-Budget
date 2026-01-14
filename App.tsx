
import React, { useState, useEffect, useMemo } from 'react';
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
  ArrowDownCircle,
  List,
  Bell,
  Info,
  Loader2
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

import { Transaction, CategoryConfig, DefaultCategoryIds, FixedExpense } from './types';
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
  { id: 'ade-26-05', label: 'AdE Maggio 26', amount: 222.11, icon: '🏛️', colorName: 'red', paidMonths: [], group: 'alternata', dueDate: '2026-05-31' },
];

const DEFAULT_CATEGORIES: CategoryConfig[] = [
  { id: DefaultCategoryIds.KRISTIAN, label: 'Kristian', type: 'expense', icon: '👦', colorClass: 'bg-blue-500', colorName: 'blue' },
  { id: DefaultCategoryIds.MEGAN, label: 'Megan', type: 'expense', icon: '👧', colorClass: 'bg-pink-500', colorName: 'pink' },
  { id: DefaultCategoryIds.ZARA, label: 'Zara', type: 'expense', icon: '🐶', colorClass: 'bg-amber-600', colorName: 'amber' },
  { id: DefaultCategoryIds.CASA, label: 'Casa', type: 'expense', icon: 'purple-600', colorClass: 'bg-purple-600', colorName: 'purple' },
  { id: DefaultCategoryIds.MACCHINA, label: 'Macchina', type: 'expense', icon: '🚗', colorClass: 'bg-red-500', colorName: 'red' },
  { id: DefaultCategoryIds.SPESA, label: 'Spesa', type: 'expense', icon: '🛒', colorClass: 'bg-green-500', colorName: 'green' },
  { id: DefaultCategoryIds.USCITE_ALTRO, label: 'Altro', type: 'expense', icon: '💸', colorClass: 'bg-gray-500', colorName: 'gray' },
  { id: DefaultCategoryIds.STIPENDIO, label: 'Stipendio', type: 'income', icon: '💼', colorClass: 'bg-emerald-500', colorName: 'emerald' },
  { id: DefaultCategoryIds.LEZIONI, label: 'Lezioni', type: 'income', icon: '📚', colorClass: 'bg-teal-500', colorName: 'teal' },
];

const STORAGE_KEY = 'lillabudget_transactions_v2';
const FIXED_EXPENSES_KEY = 'lillabudget_fixed_expenses_v2';

// --- UI Constants and Helpers ---

// Fix for error: Cannot find name 'COLORS'
const COLORS = ['#8B5CF6', '#3B82F6', '#EC4899', '#F59E0B', '#EF4444', '#10B981', '#14B8A6', '#06B6D4', '#64748B'];

// Fix for error: Cannot find name 'StatCard'
const StatCard = ({ title, amount, type, isVisible, subtitle, highlight }: { 
  title: string; 
  amount: number; 
  type: 'income' | 'expense' | 'total'; 
  isVisible: boolean;
  subtitle?: string;
  highlight?: boolean;
}) => {
  return (
    <div className={`
      relative overflow-hidden p-6 rounded-3xl border transition-all duration-300
      ${highlight ? 'bg-gradient-to-br from-lilla-600/20 to-purple-600/10 border-lilla-500/30 shadow-lg' : 'bg-[#1a1625] border-white/5 shadow-xl'}
    `}>
      <div className="flex flex-col relative z-10">
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">{title}</span>
        <div className="flex items-baseline gap-1">
          <span className={`text-2xl font-black ${
            type === 'income' ? 'text-emerald-400' : 
            type === 'expense' ? 'text-rose-400' : 
            amount < 0 ? 'text-rose-400' : 'text-white'
          }`}>
            {isVisible ? `${amount.toFixed(2)}€` : '****'}
          </span>
        </div>
        {subtitle && <span className="text-[10px] text-gray-500 font-bold mt-1 uppercase">{subtitle}</span>}
      </div>
      {highlight && (
        <div className="absolute -right-4 -bottom-4 opacity-[0.03]">
          <TrendingUp size={100} />
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [view, setView] = useState<'home' | 'reports' | 'settings'>('home');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>(DEFAULT_FIXED_EXPENSES);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dbStatus, setDbStatus] = useState<'connected' | 'syncing' | 'error' | 'idle'>('idle');
  const [isLoading, setIsLoading] = useState(true);

  const [txModalOpen, setTxModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryConfig | null>(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [deleteFixedModalOpen, setDeleteFixedModalOpen] = useState(false);
  const [fixedToDelete, setFixedToDelete] = useState<string | null>(null);
  const [notifPanelOpen, setNotifPanelOpen] = useState(false);

  // Forza il caricamento sicuro
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const localTx = localStorage.getItem(STORAGE_KEY);
        const localFx = localStorage.getItem(FIXED_EXPENSES_KEY);
        
        if (localTx) {
          const parsed = JSON.parse(localTx);
          if (Array.isArray(parsed)) setTransactions(parsed);
        }
        
        if (localFx) {
          const parsed = JSON.parse(localFx);
          if (Array.isArray(parsed) && parsed.length > 0) setFixedExpenses(parsed);
        }
        
        await syncWithCloud();
      } catch (e) {
        console.error("Errore caricamento iniziale:", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, []);

  const syncWithCloud = async () => {
    if (!process.env.DATABASE_URL) {
      setDbStatus('error');
      return;
    }
    setDbStatus('syncing');
    try {
      await initDb();
      const cloudData = await fetchAllData();
      if (cloudData) {
        if (Array.isArray(cloudData.transactions)) {
          setTransactions(cloudData.transactions);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudData.transactions));
        }
        if (Array.isArray(cloudData.fixedExpenses) && cloudData.fixedExpenses.length > 0) {
          setFixedExpenses(cloudData.fixedExpenses);
          localStorage.setItem(FIXED_EXPENSES_KEY, JSON.stringify(cloudData.fixedExpenses));
        }
        setDbStatus('connected');
      }
    } catch (err) {
      console.error("Errore sincronizzazione cloud:", err);
      setDbStatus('error');
    }
  };

  // Memoizzazione sicura per prevenire crash se i dati non sono array
  const safeTransactions = useMemo(() => Array.isArray(transactions) ? transactions : [], [transactions]);
  const safeFixedExpenses = useMemo(() => Array.isArray(fixedExpenses) ? fixedExpenses : [], [fixedExpenses]);

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
      date: new Date(date).toISOString()
    };

    const updated = [newTx, ...safeTransactions];
    setTransactions(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setTxModalOpen(false);
    setAmount('');
    setDescription('');

    setDbStatus('syncing');
    await saveTransactionDb(newTx);
    setDbStatus('connected');
  };

  const handleDeleteTransaction = async (id: string) => {
    const updated = safeTransactions.filter(t => t.id !== id);
    setTransactions(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setDbStatus('syncing');
    await deleteTransactionDb(id);
    setDbStatus('connected');
  };

  const togglePaidFixed = async (id: string) => {
    const expense = safeFixedExpenses.find(fe => fe.id === id);
    if (!expense) return;

    const isCurrentlyPaid = expense.paidMonths.includes(currentMonthKey);
    const transactionId = `pay-${id}-${currentMonthKey}`;
    
    let updatedExpense: FixedExpense | null = null;
    const newFixed = safeFixedExpenses.map(fe => {
      if (fe.id === id) {
        updatedExpense = { 
          ...fe, 
          paidMonths: isCurrentlyPaid 
            ? fe.paidMonths.filter(m => m !== currentMonthKey) 
            : [...fe.paidMonths, currentMonthKey] 
        };
        return updatedExpense;
      } 
      return fe;
    });

    setFixedExpenses(newFixed);
    localStorage.setItem(FIXED_EXPENSES_KEY, JSON.stringify(newFixed));

    setDbStatus('syncing');
    try {
      if (!isCurrentlyPaid) {
        const newTx: Transaction = {
          id: transactionId,
          type: 'expense',
          category: expense.label,
          amount: expense.amount,
          description: `Pagamento ${expense.label}`,
          date: new Date().toISOString()
        };
        const updatedTxs = [newTx, ...safeTransactions];
        setTransactions(updatedTxs);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTxs));
        await saveTransactionDb(newTx);
      } else {
        const updatedTxs = safeTransactions.filter(t => t.id !== transactionId);
        setTransactions(updatedTxs);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTxs));
        await deleteTransactionDb(transactionId);
      }
      if (updatedExpense) await saveFixedExpenseDb(updatedExpense);
      setDbStatus('connected');
    } catch (err) {
      console.error("Errore togglePaidFixed:", err);
      setDbStatus('error');
    }
  };

  const notifications = useMemo(() => {
    const alerts: any[] = [];
    const today = new Date();
    today.setHours(0,0,0,0);

    safeFixedExpenses.forEach(fe => {
      const isPaid = fe.paidMonths.includes(currentMonthKey);
      if (fe.dueDate) {
        const dDate = new Date(fe.dueDate);
        dDate.setHours(0,0,0,0);
        const diffDays = Math.ceil((dDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (!isPaid) {
          if (diffDays < 0) alerts.push({ id: `a-${fe.id}`, title: 'SCADUTO', text: `${fe.label} non pagato!`, type: 'critical' });
          else if (diffDays <= 7) alerts.push({ id: `a-${fe.id}`, title: 'SCADENZA', text: `${fe.label} scade tra ${diffDays}gg`, type: 'warning' });
        }
      }
    });
    return alerts;
  }, [safeFixedExpenses, currentMonthKey]);

  const residue = useMemo(() => {
    const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    return safeTransactions
      .filter(t => new Date(t.date) < start)
      .reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc - t.amount, 0);
  }, [safeTransactions, currentDate]);

  const monthlyTrans = useMemo(() => {
    return safeTransactions.filter(t => {
      const d = new Date(t.date); 
      return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
    }).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [safeTransactions, currentDate]);

  const monthlyExp = useMemo(() => monthlyTrans.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0), [monthlyTrans]);
  const monthlyInc = useMemo(() => monthlyTrans.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0), [monthlyTrans]);
  const totalAvail = residue + monthlyInc;
  const currentBal = totalAvail - monthlyExp;

  const expensesByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    monthlyTrans.forEach(tx => {
      if (tx.type === 'expense') {
        const cat = DEFAULT_CATEGORIES.find(c => c.id === tx.category);
        const label = cat ? cat.label : tx.category;
        counts[label] = (counts[label] || 0) + tx.amount;
      }
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [monthlyTrans]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-darksoft flex flex-col items-center justify-center space-y-4">
        <Loader2 className="text-lilla-500 animate-spin" size={48} />
        <p className="text-lilla-200 font-black uppercase text-xs tracking-widest animate-pulse">Sincronizzazione Cloud...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-darksoft text-gray-100 font-sans pb-10 relative overflow-x-hidden">
       {/* Background decorative elements */}
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
                  <div className="flex items-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); syncWithCloud(); }} className="hover:scale-110 transition-transform">
                      {dbStatus === 'connected' && <Cloud className="text-emerald-400" size={18} />}
                      {dbStatus === 'syncing' && <RefreshCw className="text-amber-400 animate-spin" size={18} />}
                      {dbStatus === 'error' && <CloudOff className="text-rose-500" size={18} />}
                    </button>
                    <button onClick={() => setNotifPanelOpen(!notifPanelOpen)} className="relative hover:scale-110 transition-transform">
                      <Bell className={`${notifications.length > 0 ? 'text-amber-400 animate-pulse' : 'text-gray-500'}`} size={20} />
                      {notifications.length > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full border-2 border-darksoft">
                          {notifications.length}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-lilla-400 font-black uppercase tracking-[0.25em] mt-1">Gestione Familiare</p>
              </div>
            </div>
            <nav className="flex bg-[#1a1625]/80 backdrop-blur-md rounded-2xl p-1.5 border border-white/10 shadow-xl">
               <button onClick={() => setView('home')} className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${view === 'home' ? 'bg-lilla-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>
                 <Home size={16} /> Home
               </button>
               <button onClick={() => setView('reports')} className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${view === 'reports' ? 'bg-lilla-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>
                 <PieChartIcon size={16} /> Analisi
               </button>
               <button onClick={() => setView('settings')} className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${view === 'settings' ? 'bg-lilla-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>
                 <Settings size={16} /> Archivio
               </button>
            </nav>
          </header>

          {notifPanelOpen && (
            <div className="absolute right-4 top-24 z-[90] w-full max-w-xs animate-in slide-in-from-top-4 fade-in duration-300">
               <div className="bg-[#1a1625]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-lilla-300 flex items-center gap-2">
                       <Bell size={14} /> Centro Notifiche
                    </h3>
                    <button onClick={() => setNotifPanelOpen(false)} className="text-gray-500 hover:text-white"><X size={16} /></button>
                  </div>
                  <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="text-center py-6">
                        <CheckCircle2 className="mx-auto text-emerald-500/30 mb-2" size={32} />
                        <p className="text-[10px] text-gray-500 font-bold uppercase">Tutto in regola!</p>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className={`p-3 rounded-xl border flex gap-3 items-start ${n.type === 'critical' ? 'bg-rose-500/10 border-rose-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
                           <div>
                             <p className={`text-[10px] font-black uppercase leading-none mb-1 ${n.type === 'critical' ? 'text-rose-400' : 'text-amber-400'}`}>{n.title}</p>
                             <p className="text-[11px] font-bold text-gray-300 leading-tight">{n.text}</p>
                           </div>
                        </div>
                      ))
                    )}
                  </div>
               </div>
            </div>
          )}

          <main className="max-w-5xl mx-auto">
            {view === 'home' && (
              <div className="space-y-8 animate-in fade-in pb-10">
                <div className="flex items-center justify-between bg-white/5 backdrop-blur-md rounded-2xl p-2 border border-white/10 shadow-lg mx-1">
                  <button onClick={() => changeMonth(-1)} className="p-2 text-lilla-400 hover:text-white transition-colors"><ChevronLeft size={24} /></button>
                  <div className="flex flex-col items-center text-center">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Mese</span>
                    <span className="text-lg font-black text-white capitalize leading-none">{getMonthName(currentDate)}</span>
                  </div>
                  <button onClick={() => changeMonth(1)} className="p-2 text-lilla-400 hover:text-white transition-colors"><ChevronRight size={24} /></button>
                </div>

                <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatCard title="Entrate + Residuo" amount={totalAvail} type="income" isVisible={true} subtitle={`Residuo: ${residue.toFixed(2)}€`} />
                  <StatCard title="Uscite Totali" amount={monthlyExp} type="expense" isVisible={true} />
                  <StatCard title="Budget Attuale" amount={currentBal} type="total" isVisible={true} highlight />
                </section>

                <section className="bg-[#1a1625] border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                  <h2 className="text-lilla-100 text-lg uppercase tracking-widest font-black flex items-center gap-3 mb-6">
                     <CheckCircle2 className="text-lilla-400" size={20}/> Monitor Fisse & Scadenze
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {safeFixedExpenses.filter(fe => !fe.dueDate || (new Date(fe.dueDate).getMonth() === currentDate.getMonth())).map(fe => {
                      const p = fe.paidMonths.includes(currentMonthKey);
                      return (
                        <button key={fe.id} onClick={() => togglePaidFixed(fe.id)} className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${p ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-white/5 border-white/10'}`}>
                          <div className="flex items-center gap-2 truncate">
                            <span className="text-xl">{fe.icon}</span>
                            <div className="text-left truncate">
                              <p className={`font-bold text-xs truncate ${p ? 'text-emerald-300' : 'text-gray-200'}`}>{fe.label}</p>
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
                </section>

                <section className="bg-[#1a1625] border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                  <h2 className="text-lilla-100 text-lg uppercase tracking-widest font-black flex items-center gap-3 mb-6">
                     <List className="text-lilla-400" size={20}/> Registro Movimenti
                  </h2>
                  <div className="overflow-x-auto custom-scrollbar max-h-[400px]">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead className="sticky top-0 bg-[#1a1625] z-10 border-b border-white/10">
                        <tr>
                          <th className="py-3 px-4 text-[10px] font-black text-gray-500 uppercase">Data</th>
                          <th className="py-3 px-4 text-[10px] font-black text-gray-500 uppercase">Operazione</th>
                          <th className="py-3 px-4 text-[10px] font-black text-gray-500 uppercase text-right">Importo</th>
                          <th className="py-3 px-4 w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {monthlyTrans.map(tx => {
                          const cat = DEFAULT_CATEGORIES.find(c => c.id === tx.category);
                          return (
                            <tr key={tx.id} className="hover:bg-white/5 transition-colors group">
                              <td className="py-4 px-4 text-xs font-bold text-gray-400">
                                {new Date(tx.date).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })}
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{cat?.icon || '✅'}</span>
                                  <span className="font-bold text-gray-200 truncate">{cat?.label || tx.category}</span>
                                </div>
                              </td>
                              <td className={`py-4 px-4 text-right font-black ${tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {tx.type === 'income' ? '+' : '-'}{tx.amount.toFixed(2)}€
                              </td>
                              <td className="py-4 px-4 text-right">
                                <button onClick={() => handleDeleteTransaction(tx.id)} className="p-2 text-gray-600 hover:text-rose-500"><Trash2 size={16} /></button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="space-y-6">
                    <h2 className="text-lilla-100 text-lg uppercase tracking-widest font-black mb-4 flex items-center gap-3"><ArrowDownCircle className="text-rose-400" /> Movimento Extra</h2>
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
            )}
            
            {view === 'reports' && (
              <div className="space-y-8 animate-in slide-in-from-right px-1">
                 <div className="bg-[#1a1625] rounded-3xl p-6 shadow-xl border border-white/5">
                    <h3 className="text-lilla-200 mb-4 font-black uppercase text-xs tracking-widest text-center">Spese per Voce</h3>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={expensesByCategory} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                            {expensesByCategory.map((_, i) => <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />)}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: '#1a1625', border: '1px solid #ffffff10', borderRadius: '12px' }} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                 </div>
              </div>
            )}

            {view === 'settings' && (
              <div className="space-y-8 max-w-2xl mx-auto px-1">
                <section className="bg-[#1a1625] rounded-3xl p-8 border border-white/5">
                   <h2 className="text-xl font-black text-white mb-6 uppercase tracking-tight">Manutenzione Dati</h2>
                   <div className="grid grid-cols-1 gap-4">
                      <button onClick={() => setResetModalOpen(true)} className="w-full bg-rose-600/20 border border-rose-500/30 text-rose-100 font-black py-4 rounded-xl uppercase text-xs">Svuota Archivio</button>
                      <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="w-full bg-white/5 border border-white/10 text-gray-400 font-black py-4 rounded-xl uppercase text-xs">Reset Cache</button>
                   </div>
                </section>
              </div>
            )}
          </main>
       </div>

       {/* Modal Registrazione */}
       {txModalOpen && selectedCategory && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
           <div className="bg-[#13111C] border border-white/10 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative">
             <button onClick={() => setTxModalOpen(false)} className="absolute top-5 right-5 text-gray-500"><X size={20} /></button>
             <div className="text-center mb-8">
                <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center text-5xl mb-4 ${selectedCategory.colorClass} text-white`}>{selectedCategory.icon}</div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Registra {selectedCategory.label}</h2>
             </div>
             <div className="space-y-6">
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold" />
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Importo €" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-4xl font-black text-white text-center" />
                <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Nota..." className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold" />
                <NeonButton onClick={handleSaveTransaction} fullWidth color={selectedCategory.colorName}>Conferma</NeonButton>
             </div>
           </div>
         </div>
       )}

       {resetModalOpen && (
         <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl">
            <div className="bg-rose-950/20 border border-rose-500/40 w-full max-w-md rounded-[2.5rem] p-10 text-center">
                <AlertTriangle className="text-rose-600 mx-auto mb-8" size={64} />
                <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">CANCELLARE TUTTO?</h3>
                <div className="flex flex-col gap-3">
                  <button onClick={() => setResetModalOpen(false)} className="w-full bg-white/5 py-5 rounded-2xl font-black uppercase text-xs">Annulla</button>
                  <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="w-full bg-rose-600 py-5 rounded-2xl font-black uppercase text-xs text-white">Conferma Reset</button>
                </div>
            </div>
         </div>
       )}
    </div>
  );
}
