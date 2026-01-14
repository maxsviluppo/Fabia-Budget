
import { neon } from '@neondatabase/serverless';
import { Transaction, FixedExpense } from '../types';

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

export const initDb = async () => {
  if (!sql) return;
  try {
    // Cambiato ID in TEXT per supportare sia UUID che stringhe custom come "pay-mutuo-..."
    await sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        type VARCHAR(10) NOT NULL,
        category TEXT NOT NULL,
        amount DECIMAL(12,2) NOT NULL,
        description TEXT,
        date TIMESTAMP NOT NULL
      );
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS fixed_expenses (
        id TEXT PRIMARY KEY,
        label TEXT NOT NULL,
        amount DECIMAL(12,2) NOT NULL,
        icon TEXT,
        color_name TEXT,
        paid_months TEXT[],
        group_type TEXT,
        due_date DATE
      );
    `;
  } catch (err) {
    console.error("Errore inizializzazione DB:", err);
  }
};

export const fetchAllData = async () => {
  if (!sql) return null;
  try {
    const txs = await sql`SELECT * FROM transactions ORDER BY date DESC`;
    const fxs = await sql`SELECT * FROM fixed_expenses`;
    
    return {
      transactions: (txs || []).map(t => ({
        ...t,
        amount: t.amount ? parseFloat(t.amount.toString()) : 0,
        date: t.date ? new Date(t.date).toISOString() : new Date().toISOString()
      })) as Transaction[],
      fixedExpenses: (fxs || []).map(f => ({
        ...f,
        amount: f.amount ? parseFloat(f.amount.toString()) : 0,
        group: f.group_type,
        dueDate: f.due_date ? new Date(f.due_date).toISOString().split('T')[0] : undefined
      })) as FixedExpense[]
    };
  } catch (err) {
    console.error("Errore fetching dati:", err);
    throw err; // Rilanciamo per permettere all'app di gestire l'errore
  }
};

export const saveTransactionDb = async (t: Transaction) => {
  if (!sql) return;
  try {
    await sql`
      INSERT INTO transactions (id, type, category, amount, description, date)
      VALUES (${t.id}, ${t.type}, ${t.category}, ${t.amount}, ${t.description || ''}, ${t.date})
      ON CONFLICT (id) DO UPDATE SET
        type = EXCLUDED.type,
        category = EXCLUDED.category,
        amount = EXCLUDED.amount,
        description = EXCLUDED.description,
        date = EXCLUDED.date
    `;
  } catch (err) {
    console.error("Errore salvataggio transazione:", err);
  }
};

export const saveFixedExpenseDb = async (f: FixedExpense) => {
  if (!sql) return;
  try {
    await sql`
      INSERT INTO fixed_expenses (id, label, amount, icon, color_name, paid_months, group_type, due_date)
      VALUES (${f.id}, ${f.label}, ${f.amount}, ${f.icon}, ${f.colorName}, ${f.paidMonths}, ${f.group || 'mensile'}, ${f.dueDate || null})
      ON CONFLICT (id) DO UPDATE SET
        label = EXCLUDED.label,
        amount = EXCLUDED.amount,
        icon = EXCLUDED.icon,
        color_name = EXCLUDED.color_name,
        paid_months = EXCLUDED.paid_months,
        group_type = EXCLUDED.group_type,
        due_date = EXCLUDED.due_date
    `;
  } catch (err) {
    console.error("Errore salvataggio spesa fissa:", err);
  }
};

export const deleteTransactionDb = async (id: string) => {
  if (!sql) return;
  try {
    await sql`DELETE FROM transactions WHERE id = ${id}`;
  } catch (err) {
    console.error("Errore eliminazione transazione:", err);
  }
};

export const deleteFixedExpenseDb = async (id: string) => {
  if (!sql) return;
  try {
    await sql`DELETE FROM fixed_expenses WHERE id = ${id}`;
  } catch (err) {
    console.error("Errore eliminazione spesa fissa:", err);
  }
};
