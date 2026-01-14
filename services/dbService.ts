
import { neon } from '@neondatabase/serverless';
import { Transaction, FixedExpense } from '../types';

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

export const initDb = async () => {
  if (!sql) return;
  try {
    // Usiamo TEXT per ID per supportare ID deterministici (es. pay-mutuo-...)
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
    const txs = await sql`SELECT * FROM transactions ORDER BY date DESC LIMIT 1000`;
    const fxs = await sql`SELECT * FROM fixed_expenses`;
    
    return {
      transactions: (txs || []).map(t => ({
        id: String(t.id),
        type: t.type as any,
        category: String(t.category),
        amount: t.amount ? parseFloat(t.amount.toString()) : 0,
        description: t.description || '',
        date: t.date ? new Date(t.date).toISOString() : new Date().toISOString()
      })) as Transaction[],
      fixedExpenses: (fxs || []).map(f => ({
        id: String(f.id),
        label: String(f.label),
        amount: f.amount ? parseFloat(f.amount.toString()) : 0,
        icon: f.icon || '💰',
        colorName: f.color_name as any,
        paidMonths: Array.isArray(f.paid_months) ? f.paid_months : [],
        group: f.group_type as any,
        dueDate: f.due_date ? new Date(f.due_date).toISOString().split('T')[0] : undefined
      })) as FixedExpense[]
    };
  } catch (err) {
    console.error("Errore fetchAllData:", err);
    return null;
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
    console.error("Errore saveTransactionDb:", err);
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
    console.error("Errore saveFixedExpenseDb:", err);
  }
};

export const deleteTransactionDb = async (id: string) => {
  if (!sql) return;
  try {
    await sql`DELETE FROM transactions WHERE id = ${id}`;
  } catch (err) {
    console.error("Errore deleteTransactionDb:", err);
  }
};

export const deleteFixedExpenseDb = async (id: string) => {
  if (!sql) return;
  try {
    await sql`DELETE FROM fixed_expenses WHERE id = ${id}`;
  } catch (err) {
    console.error("Errore deleteFixedExpenseDb:", err);
  }
};
