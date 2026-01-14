
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Eye, 
  EyeOff, 
  Home, 
  PieChart as PieChartIcon, 
  Trash2, 
  ArrowUpCircle,
  ArrowDownCircle, 
  X, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Settings, 
  Download, 
  Upload, 
  UserCircle, 
  CheckCircle2, 
  Pencil, 
  Plus, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  CreditCard,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

import { Transaction, CategoryConfig, DefaultCategoryIds, ButtonColor, FixedExpense } from './types';
import NeonButton from './components/NeonButton';

// --- Constants ---

const DEFAULT_FIXED_EXPENSES: FixedExpense[] = [
  // Mensili
  { id: 'mutuo', label: 'Mutuo', amount: 520, icon: '🏠', colorName: 'blue', paidMonths: [], group: 'mensile' },
  { id: 'findomestic', label: 'Findomestic', amount: 209, icon: '💳', colorName: 'red', paidMonths: [], group: 'mensile' },
  { id: 'cibo-zara', label: 'Cibo Zara', amount: 55, icon: '🐶', colorName: 'amber', paidMonths: [], group: 'mensile' },
  { id: 'tel-megan', label: 'Telefono Megan', amount: 36, icon: '📱', colorName: 'pink', paidMonths: [], group: 'mensile' },
  { id: 'tel-casa', label: 'Telefono Casa', amount: 46, icon: '☎️', colorName: 'cyan', paidMonths: [], group: 'mensile' },
  { id: 'condo-gero', label: 'Condo Gerolomini', amount: 32, icon: '🏢', colorName: 'purple', paidMonths: [], group: 'mensile' },
  { id: 'condo-bagno', label: 'Condo Bagnoli', amount: 30, icon: '🏘️', colorName: 'purple', paidMonths: [], group: 'mensile' },
  { id: 'tel-mio-meg', label: 'Cell Io & Meg', amount: 20, icon: '📲', colorName: 'emerald', paidMonths: [], group: 'mensile' },
  
  // Alternate Standard
  { id: 'gest-line', label: 'Gest Line', amount: 220, icon: '📉', colorName: 'gray', paidMonths: [], group: 'alternata' },
  { id: 'pegno', label: 'Pegno', amount: 300, icon: '💍', colorName: 'amber', paidMonths: [], group: 'alternata' },
  { id: 'ass-auto', label: 'Assicurazione Auto', amount: 570, icon: '🛡️', colorName: 'blue', paidMonths: [], group: 'alternata' },
  { id: 'tassa-uni', label: 'Tassa Universitaria', amount: 170, icon: '🎓', colorName: 'pink', paidMonths: [], group: 'alternata' },
  { id: 'pass-pozz', label: 'Pass Pozzuoli', amount: 50, icon: '🎟️', colorName: 'teal', paidMonths: [], group: 'alternata' },
  { id: 'bollo-auto', label: 'Bollo Auto', amount: 150, icon: '🚗', colorName: 'red', paidMonths: [], group: 'alternata' },

  // Rate Agenzia Entrate (Scadenze Future)
  { id: 'ade-1', label: 'Agenzia Entrate', amount: 222.11, icon: '🏛️', colorName: 'red', paidMonths: [], group: 'alternata', dueDate: '2026-05-31' },
  { id: 'ade-2', label: 'Agenzia Entrate', amount: 222.11, icon: '🏛️', colorName: 'red', paidMonths: [], group: 'alternata', dueDate: '2026-07-31' },
  { id: 'ade-3', label: 'Agenzia Entrate', amount: 222.11, icon: '🏛️', colorName: 'red', paidMonths: [], group: 'alternata', dueDate: '2026-11-30' },
  { id: 'ade-4', label: 'Agenzia Entrate', amount: 222.11, icon: '🏛️', colorName: 'red', paidMonths: [], group: 'alternata', dueDate: '2027-02-28' },
  { id: 'ade-5', label: 'Agenzia Entrate', amount: 222.11, icon: '🏛️', colorName: 'red', paidMonths: [], group: 'alternata', dueDate: '2027-05-31' },
  { id: 'ade-6', label: 'Agenzia Entrate', amount: 222.11, icon: '🏛️', colorName: 'red', paidMonths: [], group: 'alternata', dueDate: '2027-07-31' },
  { id: 'ade-7', label: 'Agenzia Entrate', amount: 222.11, icon: '🏛️', colorName: 'red', paidMonths: [], group: 'alternata', dueDate: '2027-11-30' },
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
  { id: DefaultCategoryIds.ENTRATE_ALTRO, label: 'Altro', type: 'income', icon: '💰', colorClass: 'bg-cyan-500', colorName: 'cyan' },
];

const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#6b7280'];
const AVAILABLE_COLORS: {name: ButtonColor, class: string}[] = [
  { name: 'purple', class: 'bg-purple-600' }, { name: 'blue', class: 'bg-blue-500' }, { name: 'pink', class: 'bg-pink-500' },
  { name: 'amber', class: 'bg-amber-600' }, { name: 'red', class: 'bg-red-500' }, { name: 'green', class: 'bg-green-500' },
  { name: 'emerald', class: 'bg-emerald-500' }, { name: 'teal', class: 'bg-teal-500' }, { name: 'cyan', class: 'bg-cyan-500' },
  { name: 'gray', class: 'bg-gray-500' },
];

const STORAGE_KEY = 'lillabudget_transactions';
const USER_NAME_KEY = 'lillabudget_username';
const CATEGORIES_KEY = 'lillabudget_categories';
const FIXED_EXPENSES_KEY = 'lillabudget_fixed_expenses';

const StatCard = ({ title, amount, type, isVisible, subtitle, highlight }: { title: string, amount: number, type: 'income' | 'expense' | 'total', isVisible: boolean, subtitle?: string, highlight?: boolean }) => {
  const formatted = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(amount);
  let textColor = 'text-white';
  let icon = null;
  let bgGradient = 'from-slate-800 to-slate-900';
  let borderColor = 'border-white/10';

  if (type === 'income') { textColor = 'text-emerald-400'; icon = <TrendingUp className="text-emerald-500" size={20} />; bgGradient = 'from-emerald-900/10 to-slate-900'; borderColor = 'border-emerald-500/20'; }
  if (type === 'expense') { textColor = 'text-rose-400'; icon = <TrendingDown className="text-rose-500" size={20} />; bgGradient = 'from-rose-900/10 to-slate-900'; borderColor = 'border-rose-500/20'; }
  if (type === 'total') { textColor = 'text-lilla-300'; bgGradient = highlight ? 'from-lilla-600/20 to-slate-900' : 'from-lilla-900/10 to-slate-900'; borderColor = highlight ? 'border-lilla-500/50' : 'border-lilla-500/20'; }

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
  const [categories, setCategories] = useState<CategoryConfig[]>(DEFAULT_CATEGORIES);
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>(DEFAULT_FIXED_EXPENSES);
  const [userName, setUserName] = useState('Famiglia');
  const [showTotals, setShowTotals] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  const [txModalOpen, setTxModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryConfig | null>(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingTxId, setEditingTxId] = useState<string | null>(null);
  
  const [fixedModalOpen, setFixedModalOpen] = useState(false);
  const [editingFixedId, setEditingFixedId] = useState<string | null>(null);
  const [fixedName, setFixedName] = useState('');
  const [fixedAmount, setFixedAmount] = useState('');
  const [fixedIcon, setFixedIcon] = useState('⚡');
  const [fixedColor, setFixedColor] = useState<ButtonColor>('blue');
  const [fixedGroup, setFixedGroup] = useState<'mensile' | 'alternata'>('mensile');
  const [fixedDueDate, setFixedDueDate] = useState('');

  const [deleteFixedModalOpen, setDeleteFixedModalOpen] = useState(false);
  const [fixedToDelete, setFixedToDelete] = useState<string | null>(null);
  const [resetModalOpen, setResetModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const sTx = localStorage.getItem(STORAGE_KEY);
    const sUs = localStorage.getItem(USER_NAME_KEY);
    const sCt = localStorage.getItem(CATEGORIES_KEY);
    const sFx = localStorage.getItem(FIXED_EXPENSES_KEY);
    
    if (sTx) setTransactions(JSON.parse(sTx));
    if (sUs) setUserName(sUs);
    if (sCt) setCategories(JSON.parse(sCt));
    
    // Per le fisse, se carichiamo da locale, assicuriamoci di mantenere le nuove scadenze Agenzia Entrate se non esistono
    if (sFx) {
      const stored = JSON.parse(sFx) as FixedExpense[];
      const missingAde = DEFAULT_FIXED_EXPENSES.filter(df => df.id.startsWith('ade-') && !stored.some(s => s.id === df.id));
      setFixedExpenses([...stored, ...missingAde]);
    } else {
      setFixedExpenses(DEFAULT_FIXED_EXPENSES);
    }
  }, []);

  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions)), [transactions]);
  useEffect(() => localStorage.setItem(USER_NAME_KEY, userName), [userName]);
  useEffect(() => localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories)), [categories]);
  useEffect(() => localStorage.setItem(FIXED_EXPENSES_KEY, JSON.stringify(fixedExpenses)), [fixedExpenses]);

  const currentMonthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  const getMonthName = (d: Date) => new Intl.DateTimeFormat('it-IT', { month: 'long', year: 'numeric' }).format(d);
  const changeMonth = (inc: number) => { const n = new Date(currentDate); n.setMonth(n.getMonth() + inc); setCurrentDate(n); };

  const handleSaveTransaction = () => {
    if (!amount || !selectedCategory) return;
    const v = parseFloat(amount); if (isNaN(v)) return;
    if (editingTxId) setTransactions(prev => prev.map(t => t.id === editingTxId ? { ...t, amount: v, description, date, type: selectedCategory.type, category: selectedCategory.id } : t));
    else setTransactions(prev => [{ id: crypto.randomUUID(), type: selectedCategory.type, category: selectedCategory.id, amount: v, description, date }, ...prev]);
    setTxModalOpen(false);
  };

  const togglePaidFixed = (id: string) => {
    setFixedExpenses(prev => prev.map(fe => {
      if (fe.id === id) {
        const isPaid = fe.paidMonths.includes(currentMonthKey);
        return { ...fe, paidMonths: isPaid ? fe.paidMonths.filter(m => m !== currentMonthKey) : [...fe.paidMonths, currentMonthKey] };
      } return fe;
    }));
  };

  const handleSaveFixed = () => {
    const v = parseFloat(fixedAmount); if (isNaN(v)) return;
    const data = { id: editingFixedId || crypto.randomUUID(), label: fixedName, amount: v, icon: fixedIcon, colorName: fixedColor, group: fixedGroup, dueDate: fixedDueDate || undefined };
    if (editingFixedId) setFixedExpenses(prev => prev.map(f => f.id === editingFixedId ? { ...f, ...data } : f));
    else setFixedExpenses(prev => [...prev, { ...data, paidMonths: [] }]);
    setFixedModalOpen(false);
  };

  const executeDeleteFixed = () => {
    if (fixedToDelete) {
      setFixedExpenses(prev => prev.filter(f => f.id !== fixedToDelete));
      setDeleteFixedModalOpen(false);
      setFixedToDelete(null);
    }
  };

  // --- LOGICA CALCOLI ---
  const residue = useMemo(() => {
    const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const pastManual = transactions.filter(t => new Date(t.date) < start).reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc - t.amount, 0);
    let pastFixed = 0;
    fixedExpenses.forEach(fe => fe.paidMonths.forEach(m => {
      const [y, mm] = m.split('-').map(Number); if (new Date(y, mm - 1, 1) < start) pastFixed += fe.amount;
    }));
    return pastManual - pastFixed;
  }, [transactions, fixedExpenses, currentDate]);

  const monthlyTrans = useMemo(() => transactions.filter(t => {
    const d = new Date(t.date); return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
  }), [transactions, currentDate]);

  const monthlyInc = monthlyTrans.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0);
  const monthlyManExp = monthlyTrans.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0);
  const monthlyFixPaid = useMemo(() => fixedExpenses.filter(fe => fe.paidMonths.includes(currentMonthKey)).reduce((a, b) => a + b.amount, 0), [fixedExpenses, currentMonthKey]);
  
  const totalAvail = residue + monthlyInc;
  const actualSpent = monthlyManExp + monthlyFixPaid;
  const currentBal = totalAvail - actualSpent;

  // Fix: Calculate category totals for the PieChart and summary data for the BarChart
  const expensesByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    
    // Manual expenses for current month
    monthlyTrans.forEach(tx => {
      if (tx.type === 'expense') {
        const cat = categories.find(c => c.id === tx.category);
        const label = cat ? cat.label : 'Altro';
        counts[label] = (counts[label] || 0) + tx.amount;
      }
    });

    // Fixed expenses paid in current month
    fixedExpenses.forEach(fe => {
      if (fe.paidMonths.includes(currentMonthKey)) {
        counts[fe.label] = (counts[fe.label] || 0) + fe.amount;
      }
    });

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [monthlyTrans, fixedExpenses, currentMonthKey, categories]);

  // Fix: Prepare data for the Available vs Spent BarChart
  const monthlyData = useMemo(() => [
    { name: 'Disponibile', amount: totalAvail },
    { name: 'Speso', amount: actualSpent }
  ], [totalAvail, actualSpent]);

  // Filtro Spese Fisse per Visualizzazione
  const visibleFixed = useMemo(() => {
    return fixedExpenses.filter(fe => {
      if (!fe.dueDate) return true; // Le spese mensili/ricorrenti si vedono sempre
      // Le spese con data specifica si vedono solo nel loro mese
      const [y, m] = fe.dueDate.split('-').map(Number);
      return y === currentDate.getFullYear() && (m - 1) === currentDate.getMonth();
    });
  }, [fixedExpenses, currentDate]);

  const hasUrgentDeadline = useMemo(() => {
    return visibleFixed.some(f => f.dueDate && !f.paidMonths.includes(currentMonthKey));
  }, [visibleFixed, currentMonthKey]);

  const renderHome = () => (
    <div className="space-y-8 animate-in fade-in pb-10">
      {/* Navigator Mese */}
      <div className="flex items-center justify-between bg-white/5 backdrop-blur-md rounded-2xl p-2 mb-6 border border-white/10 shadow-lg mx-1">
        <button onClick={() => changeMonth(-1)} className="p-2 text-lilla-400 hover:text-white"><ChevronLeft size={24} /></button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Periodo Gestione</span>
          <span className="text-lg font-black text-white capitalize">{getMonthName(currentDate)}</span>
        </div>
        <button onClick={() => changeMonth(1)} className="p-2 text-lilla-400 hover:text-white"><ChevronRight size={24} /></button>
      </div>

      {/* Alert Scadenze Fiscali Imminenti */}
      {hasUrgentDeadline && (
        <div className="mx-1 bg-red-600/20 border border-red-500/50 rounded-2xl p-4 flex items-center gap-4 animate-pulse">
           <AlertCircle className="text-red-500 shrink-0" size={32} />
           <div>
             <p className="text-red-100 font-black uppercase text-xs tracking-tighter">Attenzione: Scadenze Agenzia Entrate</p>
             <p className="text-red-200/70 text-[10px] font-bold">Hai una o più rate fiscali da pagare questo mese. Controlla il monitor fisse.</p>
           </div>
        </div>
      )}

      {/* Dashboard Bilancio */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Entrate + Residuo" amount={totalAvail} type="income" isVisible={showTotals} subtitle={`Residuo Mesi Passati: ${residue.toFixed(2)}€`} />
        <StatCard title="Speso nel Mese" amount={actualSpent} type="expense" isVisible={showTotals} subtitle="Somma spuntate + manuali" />
        <StatCard title="Budget Residuo" amount={currentBal} type="total" isVisible={showTotals} highlight subtitle="Disponibilità reale attuale" />
      </section>

      {/* Monitor Spese Fisse e Scadenze */}
      <section className="bg-[#1a1625] border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <h2 className="text-lilla-100 text-lg uppercase tracking-widest font-black flex items-center gap-3">
             <CheckCircle2 className="text-lilla-400" size={20}/> Monitor Fisse & Scadenze
          </h2>
          <div className="flex flex-col text-right">
             <span className="text-[10px] text-gray-500 font-black uppercase">Spunte questo mese</span>
             <span className="text-sm font-black text-emerald-400">{monthlyFixPaid.toFixed(2)}€</span>
          </div>
        </div>

        {/* Mensili */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3 border-b border-white/5 pb-1">
            <span className="text-[10px] font-black uppercase text-lilla-400 tracking-widest">Fisse Ricorrenti</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {visibleFixed.filter(f => f.group === 'mensile').map(fe => {
              const p = fe.paidMonths.includes(currentMonthKey);
              return (
                <button key={fe.id} onClick={() => togglePaidFixed(fe.id)} className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${p ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-white/5 border-white/10 hover:border-lilla-500/30'}`}>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xl">{fe.icon}</span>
                    <div className="text-left"><p className={`font-bold text-xs truncate ${p ? 'text-emerald-300' : 'text-gray-200'}`}>{fe.label}</p><p className="text-[10px] text-gray-500 font-black">{fe.amount.toFixed(2)}€</p></div>
                  </div>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${p ? 'bg-emerald-500 text-white' : 'bg-white/10 text-gray-600'}`}>{p && <Check size={12} strokeWidth={4} />}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Alternate e Scadenze Fiscali */}
        <div>
          <div className="flex justify-between items-center mb-3 border-b border-white/5 pb-1">
            <span className="text-[10px] font-black uppercase text-amber-500 tracking-widest">Scadenze & Straordinarie</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {visibleFixed.filter(f => f.group === 'alternata' || !f.group).map(fe => {
              const p = fe.paidMonths.includes(currentMonthKey);
              const isFiscal = !!fe.dueDate;
              return (
                <button key={fe.id} onClick={() => togglePaidFixed(fe.id)} className={`flex items-center justify-between p-3 rounded-2xl border transition-all relative ${isFiscal ? (p ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-red-600/10 border-red-500/60 shadow-[0_0_10px_rgba(239,68,68,0.2)]') : (p ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-white/5 border-white/10 hover:border-lilla-500/30'}`}>
                  {isFiscal && !p && <span className="absolute -top-2 -right-1 bg-red-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase shadow-lg">Scadenza</span>}
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xl">{fe.icon}</span>
                    <div className="text-left">
                        <p className={`font-bold text-xs truncate ${p ? 'text-emerald-300' : (isFiscal ? 'text-red-400' : 'text-gray-200')}`}>{fe.label}</p>
                        <p className="text-[10px] text-gray-500 font-black">{fe.amount.toFixed(2)}€</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${p ? 'bg-emerald-500 text-white' : (isFiscal ? 'bg-red-950/40 text-red-900 border border-red-900/20' : 'bg-white/10 text-gray-600')}`}>{p && <Check size={12} strokeWidth={4} />}</div>
                </button>
              );
            })}
            {visibleFixed.filter(f => f.group === 'alternata' || !f.group).length === 0 && <p className="text-[10px] text-gray-600 italic py-2 col-span-full">Nessuna scadenza prevista per questo mese.</p>}
          </div>
        </div>
      </section>

      {/* Registrazione Uscite/Entrate Extra */}
      <section className="space-y-12">
          <div>
            <h2 className="text-lilla-100 text-lg uppercase tracking-widest font-black mb-6 flex items-center gap-3"><ArrowDownCircle className="text-rose-400" size={24}/> Nuova Uscita</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {categories.filter(c => c.type === 'expense').map(cat => (
                <NeonButton key={cat.id} onClick={() => openTxModal(cat)} color={cat.colorName} square>
                    <span className="text-4xl">{cat.icon}</span><span className="text-xs font-bold mt-2 uppercase text-center leading-tight">{cat.label}</span>
                </NeonButton>
                ))}
            </div>
          </div>
          <div>
            <h2 className="text-lilla-100 text-lg uppercase tracking-widest font-black mb-6 flex items-center gap-3"><ArrowUpCircle className="text-emerald-400" size={24}/> Nuova Entrata</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {categories.filter(c => c.type === 'income').map(cat => (
                <NeonButton key={cat.id} onClick={() => openTxModal(cat)} color={cat.colorName} square>
                    <span className="text-4xl">{cat.icon}</span><span className="text-xs font-bold mt-2 uppercase text-center leading-tight">{cat.label}</span>
                </NeonButton>
                ))}
            </div>
          </div>
      </section>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-8 max-w-2xl mx-auto pb-10 px-1">
      {/* Gestione Profilo */}
      <section className="bg-[#1a1625] rounded-3xl p-8 shadow-xl border border-white/5">
         <h2 className="text-xl font-black text-white mb-6 flex items-center gap-3 uppercase tracking-tight"><UserCircle className="text-lilla-400" /> Nome Famiglia</h2>
         <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-5 py-4 text-xl font-black text-white focus:outline-none focus:border-lilla-500 transition-all"/>
      </section>

      {/* Gestione Spese Fisse */}
      <section className="bg-[#1a1625] rounded-3xl p-8 shadow-xl border border-white/5">
         <div className="flex items-center justify-between mb-6">
           <h2 className="text-xl font-black text-white flex items-center gap-3 uppercase tracking-tight"><CreditCard className="text-blue-600" /> Archivio Fisse & Scadenze</h2>
           <button onClick={() => { setEditingFixedId(null); setFixedName(''); setFixedAmount(''); setFixedDueDate(''); setFixedModalOpen(true); }} className="bg-lilla-600/10 text-lilla-400 p-2 rounded-full border border-lilla-500/20"><Plus size={24} /></button>
         </div>
         <div className="space-y-3">
            {fixedExpenses.sort((a,b) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999')).map(fe => (
              <div key={fe.id} className={`flex items-center justify-between bg-white/5 p-4 rounded-xl border transition-colors group ${fe.dueDate ? 'border-red-500/20' : 'border-white/5'}`}>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{fe.icon}</span>
                  <div>
                    <span className="font-black text-gray-100 block text-sm">
                        {fe.label} 
                        {fe.dueDate && <span className="text-[8px] bg-red-600/20 text-red-400 px-1.5 py-0.5 rounded-full uppercase ml-1">Scad. {fe.dueDate.split('-').reverse().join('/')}</span>}
                        {fe.group === 'alternata' && !fe.dueDate && <span className="text-[8px] bg-amber-600/20 text-amber-400 px-1.5 py-0.5 rounded-full uppercase ml-1">Alt</span>}
                    </span>
                    <span className="text-[10px] text-gray-500 font-black uppercase">{fe.amount.toFixed(2)}€</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditingFixedId(fe.id); setFixedName(fe.label); setFixedAmount(fe.amount.toString()); setFixedIcon(fe.icon); setFixedColor(fe.colorName); setFixedGroup(fe.group || 'mensile'); setFixedDueDate(fe.dueDate || ''); setFixedModalOpen(true); }} className="text-gray-500 hover:text-white p-2 transition-colors"><Pencil size={18} /></button>
                  <button onClick={() => { setFixedToDelete(fe.id); setDeleteFixedModalOpen(true); }} className="text-gray-500 hover:text-rose-500 p-2 transition-colors"><Trash2 size={18} /></button>
                </div>
              </div>
            ))}
         </div>
      </section>

      {/* Backup & Reset */}
      <section className="bg-red-950/10 border border-red-500/20 rounded-3xl p-8 shadow-xl">
        <h2 className="text-lg font-black text-white mb-6 flex items-center gap-3 uppercase tracking-tight"><AlertTriangle className="text-red-500" size={20} /> Area Pericolosa</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
            <button onClick={handleExportData} className="flex items-center justify-center gap-2 bg-blue-600/10 border border-blue-500/30 text-blue-300 font-black py-4 rounded-xl text-xs uppercase"><Download size={16} /> Backup</button>
            <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-2 bg-purple-600/10 border border-purple-500/30 text-purple-300 font-black py-4 rounded-xl text-xs uppercase"><Upload size={16} /> Carica</button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="application/json" className="hidden" />
        </div>
        <button onClick={() => setResetModalOpen(true)} className="w-full bg-red-600/20 border border-red-500/30 hover:bg-red-600 text-red-100 font-black py-4 rounded-xl uppercase text-xs tracking-widest shadow-lg shadow-red-500/10 transition-all">Svuota Dati App</button>
      </section>
    </div>
  );

  const openTxModal = (cat: CategoryConfig) => {
    setSelectedCategory(cat); setEditingTxId(null); setAmount(''); setDescription(''); setDate(new Date().toISOString().split('T')[0]); setTxModalOpen(true);
  };

  const handleExportData = () => {
    const data = { transactions, categories, fixedExpenses, userName };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `fabia_budget_backup.json`; link.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader(); reader.onload = (ev) => {
      try { const d = JSON.parse(ev.target?.result as string); if (d.transactions) setTransactions(d.transactions); if (d.fixedExpenses) setFixedExpenses(d.fixedExpenses); alert('Backup Importato!'); } catch { alert('Errore File!'); }
    }; reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-darksoft text-gray-100 font-sans pb-10 relative overflow-x-hidden">
       <div className="fixed inset-0 pointer-events-none z-0"><div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px]"></div><div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-lilla-600/5 rounded-full blur-[140px]"></div></div>

       <div className="relative z-10 max-w-6xl mx-auto px-4 py-6">
          <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
            <div className="cursor-pointer group flex items-center gap-4" onClick={() => setView('home')}>
              <div className="bg-gradient-to-br from-lilla-500 to-purple-600 p-2.5 rounded-2xl text-white shadow-neon transform group-hover:scale-110 transition-all"><Wallet size={28} strokeWidth={2.5} /></div>
              <div className="flex flex-col"><h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-lilla-300 leading-none">Fabia Budget</h1><p className="text-[10px] text-lilla-400 font-black uppercase tracking-[0.25em] mt-1">Gestione Spese</p></div>
            </div>
            <nav className="flex bg-[#1a1625]/80 backdrop-blur-md rounded-2xl p-1.5 border border-white/10 shadow-xl overflow-x-auto">
               <button onClick={() => setView('home')} className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${view === 'home' ? 'bg-lilla-600 text-white shadow-md' : 'text-gray-500 hover:text-white'}`}><Home size={16} /> Home</button>
               <button onClick={() => setView('reports')} className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${view === 'reports' ? 'bg-lilla-600 text-white shadow-md' : 'text-gray-500 hover:text-white'}`}><PieChartIcon size={16} /> Analisi</button>
               <button onClick={() => setView('settings')} className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${view === 'settings' ? 'bg-lilla-600 text-white shadow-md' : 'text-gray-500 hover:text-white'}`}><Settings size={16} /> Archivio</button>
            </nav>
          </header>
          <main className="max-w-5xl mx-auto">
              {view === 'home' && renderHome()} 
              {view === 'reports' && (
                  <div className="space-y-8 animate-in slide-in-from-right px-1">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-[#1a1625] rounded-3xl p-6 shadow-xl border border-white/5"><h3 className="text-lilla-200 mb-4 font-black uppercase text-xs tracking-widest text-center">Categorie Spesa</h3><div className="h-64 w-full"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={expensesByCategory} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">{expensesByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></div></div>
                        <div className="bg-[#1a1625] rounded-3xl p-6 shadow-xl border border-white/5"><h3 className="text-lilla-200 mb-4 font-black uppercase text-xs tracking-widest text-center">Disponibile vs Speso</h3><div className="h-64 w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={monthlyData}><CartesianGrid stroke="#ffffff05" vertical={false}/><XAxis dataKey="name" stroke="#a78bfa"/><YAxis stroke="#a78bfa"/><Tooltip/><Bar dataKey="amount" radius={[8, 8, 0, 0]}>{monthlyData.map((e, i) => <Cell key={i} fill={e.name === 'Disponibile' ? '#10b981' : '#f43f5e'} />)}</Bar></BarChart></ResponsiveContainer></div></div>
                    </div>
                  </div>
              )} 
              {view === 'settings' && renderSettings()}
          </main>
       </div>

       {/* Modals Conferma Eliminazione Fisse */}
       {deleteFixedModalOpen && (
         <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
            <div className="bg-[#13111C] border border-white/10 w-full max-w-sm rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95 text-center">
                <div className="bg-rose-500/20 p-5 rounded-full text-rose-500 mx-auto mb-6 w-fit animate-pulse"><AlertTriangle size={40} /></div>
                <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Eliminare Voce?</h3>
                <p className="text-gray-500 text-sm mb-8 font-medium italic leading-tight">Verrà rimossa definitivamente dal bilancio pianificato.</p>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setDeleteFixedModalOpen(false)} className="bg-white/5 hover:bg-white/10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all">No</button>
                  <button onClick={executeDeleteFixed} className="bg-rose-600 hover:bg-rose-700 py-4 rounded-2xl font-black uppercase text-xs tracking-widest text-white shadow-lg shadow-rose-600/20 transition-all">Sì, Elimina</button>
                </div>
            </div>
         </div>
       )}

       {/* Modal Gestione Spesa Fissa / Scadenza */}
       {fixedModalOpen && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in">
           <div className="bg-[#13111C] border border-white/10 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative animate-in zoom-in-95">
             <button onClick={() => setFixedModalOpen(false)} className="absolute top-5 right-5 text-gray-500 hover:text-white bg-white/5 p-2 rounded-full"><X size={20} /></button>
             <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3 uppercase tracking-tight"><CreditCard className="text-blue-400" /> {editingFixedId ? 'Modifica' : 'Nuova'} Voce</h2>
             <div className="space-y-6">
               <div className="space-y-2"><label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Nome Spesa / Rata</label><input type="text" value={fixedName} onChange={(e) => setFixedName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold focus:outline-none focus:border-blue-500"/></div>
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2"><label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Importo (€)</label><input type="number" value={fixedAmount} onChange={(e) => setFixedAmount(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold focus:outline-none focus:border-blue-500"/></div>
                 <div className="space-y-2"><label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Tipologia</label><select value={fixedGroup} onChange={(e) => setFixedGroup(e.target.value as any)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold focus:outline-none appearance-none bg-transparent"><option value="mensile">Mensile</option><option value="alternata">Una Tantum / Alt</option></select></div>
               </div>
               <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Data Scadenza Specifica (Facoltativo)</label>
                   <input type="date" value={fixedDueDate} onChange={(e) => setFixedDueDate(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold focus:outline-none [color-scheme:dark]"/>
                   <p className="text-[8px] text-gray-600 mt-1 uppercase font-black">Lascia vuoto se è una spesa che si ripete ogni mese.</p>
               </div>
               <div className="space-y-2"><label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Icona (Emoji)</label><input type="text" value={fixedIcon} onChange={(e) => setFixedIcon(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-center text-3xl focus:outline-none"/></div>
               <div className="pt-4"><NeonButton onClick={handleSaveFixed} fullWidth color={fixedColor}>Salva Voce</NeonButton></div>
             </div>
           </div>
         </div>
       )}

       {/* Modal Registrazione Transazione Extra */}
       {txModalOpen && selectedCategory && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in">
           <div className="bg-[#13111C] border border-white/10 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative animate-in zoom-in-95">
             <button onClick={() => setTxModalOpen(false)} className="absolute top-5 right-5 text-gray-500 hover:text-white bg-white/5 p-2 rounded-full"><X size={20} /></button>
             <div className="text-center mb-8">
                <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center text-5xl mb-4 shadow-xl ${selectedCategory.colorClass} text-white`}>{selectedCategory.icon}</div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Registra {selectedCategory.label}</h2>
             </div>
             <div className="space-y-6">
                <div className="space-y-2"><label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Importo Uscita (€)</label><input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-4xl font-black text-white focus:outline-none text-center shadow-inner"/></div>
                <div className="space-y-2"><label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Causale / Nota</label><input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Es. Regalo, Spesa extra..." className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold focus:outline-none transition-all"/></div>
                <div className="space-y-2"><label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Data Movimento</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold focus:outline-none [color-scheme:dark]"/></div>
                <div className="pt-6"><NeonButton onClick={handleSaveTransaction} fullWidth color={selectedCategory.colorName}>Conferma Registrazione</NeonButton></div>
             </div>
           </div>
         </div>
       )}

       {/* Modal Reset Totale */}
       {resetModalOpen && (
         <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl animate-in fade-in">
            <div className="bg-red-950/20 border border-red-500/40 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 text-center">
                <div className="bg-red-600 p-6 rounded-full text-white mx-auto mb-8 w-fit shadow-neon animate-pulse"><AlertTriangle size={48} /></div>
                <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">RESET TOTALE?</h3>
                <p className="text-red-200/60 text-sm mb-10 font-medium">Questa azione cancellerà tutte le transazioni, le spese fisse e i residui. L'app tornerà allo stato iniziale.</p>
                <div className="flex flex-col gap-3">
                  <button onClick={() => setResetModalOpen(false)} className="w-full bg-white/5 hover:bg-white/10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all">Annulla Reset</button>
                  <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="w-full bg-red-600 hover:bg-red-700 py-5 rounded-2xl font-black uppercase tracking-widest text-xs text-white shadow-xl shadow-red-600/30 transition-all">Sì, Svuota Tutto</button>
                </div>
            </div>
         </div>
       )}
    </div>
  );
}
