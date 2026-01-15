
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
  Loader2,
  Sparkles
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

import { Transaction, CategoryConfig, DefaultCategoryIds, FixedExpense } from './types';
import NeonButton from './components/NeonButton';
import { initDb, fetchAllData, saveTransactionDb, saveFixedExpenseDb, deleteTransactionDb, deleteFixedExpenseDb } from './services/dbService';
import { getFinancialAdvice } from './services/geminiService';

// --- Costanti ---

const DEFAULT_FIXED_EXPENSES: FixedExpense[] = [
  { id: 'mutuo', label: 'Mutuo', amount: 520, icon: '🏠', colorName: 'blue', paidMonths: [], group: 'mensile' },
  { id: 'findomestic', label: 'Findomestic', amount: 209, icon: '💳', colorName: 'red', paidMonths: [], group: 'mensile' },
  { id: 'cibo-zara', label: 'Cibo Zara', amount: 55, icon: '🐶', colorName: 'amber', paidMonths: [], group: 'mensile' },
  { id: 'tel-megan', label: 'Telefono Megan', amount: 36, icon: '📱', colorName: 'pink', paidMonths: [], group: 'mensile' },
  { id: 'tel-casa', label: 'Telefono Casa', amount: 45, icon: '☎️', colorName: 'cyan', paidMonths: [], group: 'mensile' },
    { id: 'condo-gero', label: 'Condo Gerolimini', amount: 32, icon: '🏢', colorName: 'purple', paidMonths: [], group: 'mensile' },
  { id: 'condo-bagno', label: 'Condo Bagnoli', amount: 30, icon: '🏘️', colorName: 'purple', paidMonths: [], group: 'mensile' },
  { id: 'tel-mio-meg', label: 'Cell Io & Meg', amount: 20, icon: '📲', colorName: 'emerald', paidMonths: [], group: 'mensile' },
  { id: 'gest-line', label: 'Gest Lina', amount: 220, icon: '📉', colorName: 'gray', paidMonths: [], group: 'alternata' },
  { id: 'pegno', label: 'Pegno', amount: 200, icon: '💍', colorName: 'amber', paidMonths: [], group: 'alternata' },
  { id: 'ass-auto', label: 'Assicurazione Auto', amount: 570, icon: '🛡️', colorName: 'blue', paidMonths: [], group: 'alternata' },
  { id: 'bollo-auto', label: 'Bollo Auto', amount: 150, icon: '🚗', colorName: 'red', paidMonths: [], group: 'alternata' },
  // Rate AdE 2026/2027
  { id: 'ade-26-05', label: 'AdE Maggio 26', amount: 222.11, icon: '🏛️', colorName: 'red', paidMonths: [], group: 'alternata', dueDate: '2026-05-31' },
  { id: 'ade-26-07', label: 'AdE Luglio 26', amount: 222.11, icon: '🏛️', colorName: 'red', paidMonths: [], group: 'alternata', dueDate: '2026-07-31' },
  { id: 'ade-26-11', label: 'AdE Nov 26', amount: 222.11, icon: '🏛️', colorName: 'red', paidMonths: [], group: 'alternata', dueDate: '2026-11-30' },
  { id: 'ade-27-02', label: 'AdE Feb 27', amount: 222.11, icon: '🏛️', colorName: 'red', paidMonths: [], group: 'alternata', dueDate: '2027-02-28' },
  { id: 'ade-27-05', label: 'AdE Mag 27', amount: 222.11, icon: '🏛️', colorName: 'red', paidMonths: [], group: 'alternata', dueDate: '2027-05-31' },
  { id: 'ade-27-07', label: 'AdE Lug 27', amount: 222.11, icon: '🏛️', colorName: 'red', paidMonths: [], group: 'alternata', dueDate: '2027-07-31' },
  { id: 'ade-27-11', label: 'AdE Nov 27', amount: 222.11, icon: '🏛️', colorName: 'red', paidMonths: [], group: 'alternata', dueDate: '2027-11-30' },
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

const COLORS = ['#8B5CF6', '#3B82F6', '#EC4899', '#F59E0B', '#EF4444', '#10B981', '#14B8A6', '#06B6D4', '#64748B'];
const STORAGE_KEY = 'fabia_budget_tx_v4';
const FIXED_KEY = 'fabia_budget_fx_v4';

const StatCard = ({ title, amount, type, isVisible, subtitle, highlight }: { 
  title: string; 
  amount: number; 
  type: 'income' | 'expense' | 'total'; 
  isVisible: boolean;
  subtitle?: string;
  highlight?: boolean;
}) => (
  <div className={`relative overflow-hidden p-5 rounded-3xl border transition-all duration-300 ${highlight ? 'bg-gradient-to-br from-lilla-600/20 to-purple-600/10 border-lilla-500/30 shadow-neon' : 'bg-[#1a1625] border-white/5 shadow-xl'}`}>
    <div className="flex flex-col relative z-10">
      <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">{title}</span>
      <span className={`text-2xl font-black ${type === 'income' ? 'text-emerald-400' : type === 'expense' ? 'text-rose-400' : amount < 0 ? 'text-rose-400' : 'text-white'}`}>
        {isVisible ? `${amount.toFixed(2)}€` : '****'}
      </span>
      {subtitle && <span className="text-[10px] text-gray-500 font-bold mt-1 uppercase">{subtitle}</span>}
    </div>
  </div>
);

export default function App() {
  const [view, setView] = useState<'home' | 'reports' | 'settings'>('home');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>(DEFAULT_FIXED_EXPENSES);
  const [dbStatus, setDbStatus] = useState<'connected' | 'syncing' | 'error' | 'idle'>('idle');
  const [isLoading, setIsLoading] = useState(true);
  const [advice, setAdvice] = useState<string>('');


  const [txModalOpen, setTxModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryConfig | null>(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [deleteFixedModalOpen, setDeleteFixedModalOpen] = useState(false);
  const [fixedToDelete, setFixedToDelete] = useState<string | null>(null);
  const [notifPanelOpen, setNotifPanelOpen] = useState(false);


  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      const localTx = localStorage.getItem(STORAGE_KEY);
      const localFx = localStorage.getItem(FIXED_KEY);
      if (localTx) setTransactions(JSON.parse(localTx));
      if (localFx) setFixedExpenses(JSON.parse(localFx));
      
      await syncWithCloud();
      setIsLoading(false);
    };
    init();
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
        if (cloudData.transactions) {
          setTransactions(cloudData.transactions);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudData.transactions));
        }
        const dbEx = cloudData.fixedExpenses || [];
        const missing = DEFAULT_FIXED_EXPENSES.filter(d => !dbEx.some(e => e.id === d.id));
        if (missing.length > 0) {
          await Promise.all(missing.map(m => saveFixedExpenseDb(m)));
          const updated = await fetchAllData();
          setFixedExpenses(updated.fixedExpenses);
          localStorage.setItem(FIXED_KEY, JSON.stringify(updated.fixedExpenses));
        } else {
          setFixedExpenses(dbEx);
          localStorage.setItem(FIXED_KEY, JSON.stringify(dbEx));
        }
        setDbStatus('connected');
      }
    } catch (err) {
      console.error(err);
      setDbStatus('error');
    }
  };


  const currentMonthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  const getMonthName = (d: Date) => new Intl.DateTimeFormat('it-IT', { month: 'long', year: 'numeric' }).format(d);
  const changeMonth = (inc: number) => { const n = new Date(currentDate); n.setMonth(n.getMonth() + inc); setCurrentDate(n); };


  const safeTransactions = useMemo(() => Array.isArray(transactions) ? transactions : [], [transactions]);
  const safeFixedExpenses = useMemo(() => Array.isArray(fixedExpenses) ? fixedExpenses : [], [fixedExpenses]);


  const handleSaveTransaction = async () => {
    if (!amount || !selectedCategory) return;
    const v = parseFloat(amount);
    if (isNaN(v)) return;
    const newTx: Transaction = { id: crypto.randomUUID(), type: selectedCategory.type, category: selectedCategory.id, amount: v, description, date: new Date(date).toISOString() };
    const updated = [newTx, ...safeTransactions];
    setTransactions(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setTxModalOpen(false); setAmount(''); setDescription('');
    setDbStatus('syncing');
    await saveTransactionDb(newTx);
    setDbStatus('connected');
  };

