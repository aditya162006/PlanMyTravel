import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PieChart, AlertTriangle, CheckCircle2, Plus, Wallet as WalletIcon,
  CreditCard, ArrowUpRight, Calendar, Tag, Trash2,
  TrendingUp, ShieldAlert, Sparkles, RefreshCw, X, ChevronRight, AlertCircle
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Expense, ExpenseSummary } from '../types';

export const ExpenseTrackerPage: React.FC = () => {
  const { user, isAuthenticated, walletBalance, refreshWallet, openAuthModal } = useAuth();

  const [summary, setSummary] = useState<ExpenseSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Add Expense Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState('Dining');
  const [notes, setNotes] = useState('');
  const [payWithWallet, setPayWithWallet] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [payingExpenseId, setPayingExpenseId] = useState<number | null>(null);

  const categories = [
    'Dining',
    'Accommodations',
    'Flights & Transit',
    'Activities & Tickets',
    'Shopping',
    'Guide Services',
    'Miscellaneous',
  ];

  const fetchExpenses = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError('');
      const data = await api.getExpenses();
      setSummary(data);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve journey expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [isAuthenticated]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount) return;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please provide a valid expense amount in ₹');
      return;
    }

    setSubmitting(true);
    setError('');
    setActionSuccess('');

    try {
      await api.addExpense({
        title: title.trim(),
        amount: parsedAmount,
        category,
        notes: notes.trim(),
        pay_with_wallet: payWithWallet,
      });

      setActionSuccess(
        payWithWallet
          ? `₹${parsedAmount.toLocaleString('en-IN')} paid directly from your Trip Wallet for "${title}".`
          : `Expense "${title}" logged successfully.`
      );

      // Reset modal inputs
      setTitle('');
      setAmount('');
      setCategory('Dining');
      setNotes('');
      setPayWithWallet(true);
      setIsModalOpen(false);

      // Refresh data & wallet balance
      await fetchExpenses();
      await refreshWallet();
    } catch (err: any) {
      setError(err.message || 'Failed to record journey expense');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayExpenseWithWallet = async (expenseId: number) => {
    setPayingExpenseId(expenseId);
    setError('');
    setActionSuccess('');

    try {
      const res = await api.payExpenseWithWallet(expenseId);
      setActionSuccess(res?.message || 'Expense settled directly via Trip Wallet!');
      await fetchExpenses();
      await refreshWallet();
    } catch (err: any) {
      setError(err.message || 'Failed to settle expense with wallet');
    } finally {
      setPayingExpenseId(null);
    }
  };

  const handleDeleteExpense = async (expenseId: number) => {
    if (!window.confirm('Are you sure you want to delete this expense record?')) return;
    try {
      await api.deleteExpense(expenseId);
      setActionSuccess('Expense record removed.');
      await fetchExpenses();
    } catch (err: any) {
      setError(err.message || 'Failed to delete expense');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-forest-900 text-sage-300 flex items-center justify-center mx-auto shadow-soft">
          <PieChart className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-3xl font-medium text-charcoal-900">
          Journey Expense Tracker
        </h2>
        <p className="text-sm text-charcoal-600 max-w-md mx-auto font-light">
          Track your overall journey expenses in real-time, get instant overexpense alerts, and pay directly using your zero-fee Trip Wallet.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="px-6 py-3 rounded-full bg-forest-800 hover:bg-forest-900 text-white text-xs font-semibold shadow-soft transition-all"
        >
          Sign In to Access Expense Tracker
        </button>
      </div>
    );
  }

  const budget = summary?.budget || 100000;
  const totalSpent = summary?.total_spent || 0;
  const remainingBudget = summary?.remaining_budget || 0;
  const spentPct = summary?.spent_percentage || 0;
  const isOverBudget = summary?.is_over_budget || totalSpent > budget;
  const overBy = summary?.over_budget_by || (isOverBudget ? totalSpent - budget : 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-forest-800 mb-1 block">
            Financial Transparency
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-medium text-charcoal-900">
            Journey Expense Tracker
          </h1>
          <p className="text-xs text-charcoal-500 mt-1 font-light">
            Monitor real-time spending across your entire itinerary, manage category budgets, and settle expenses via your Trip Wallet.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-forest-800 hover:bg-forest-900 text-white text-xs font-semibold shadow-soft transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Journey Expense</span>
          </button>

          <Link
            to="/wallet"
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white text-charcoal-800 hover:bg-ivory-100 border border-charcoal-200 text-xs font-semibold shadow-soft-sm transition-all"
          >
            <WalletIcon className="w-4 h-4 text-forest-800" />
            <span>Wallet: ₹{(walletBalance || 0).toLocaleString('en-IN')}</span>
          </Link>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess('')} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-rose-700 hover:text-rose-900">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* OVEREXPENSE ALERT BANNER (High Visibility) */}
      {isOverBudget && (
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-rose-500/5 border-2 border-rose-500/40 shadow-soft-sm space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-rose-600 text-white flex items-center justify-center flex-shrink-0 shadow-soft">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-rose-950">
                Overexpense Alert: Planned Journey Budget Exceeded!
              </h3>
              <p className="text-xs text-rose-800 font-medium">
                You have exceeded your total journey allocation of ₹{budget.toLocaleString('en-IN')} by{' '}
                <span className="font-bold underline">₹{overBy.toLocaleString('en-IN')}</span> ({spentPct}% of allocated budget utilized).
              </p>
            </div>
          </div>
          <p className="text-[11px] text-charcoal-600 pl-11 font-light">
            Recommendation: Consider optimizing upcoming leisure dining and shopping expenses, or increase your allocated journey budget in AI Concierge.
          </p>
        </div>
      )}

      {/* APPROACHING LIMIT WARNING */}
      {!isOverBudget && spentPct >= 85 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-medium flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div>
            <span className="font-bold">Budget Notice:</span> You have utilized {spentPct}% of your planned journey budget. You have ₹{remainingBudget.toLocaleString('en-IN')} remaining before exceeding your target.
          </div>
        </div>
      )}

      {/* Key Financial Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Total Spent */}
        <div className="p-6 rounded-3xl bg-white border border-charcoal-100 shadow-soft-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-charcoal-400 font-bold uppercase tracking-wider">
            <span>Total Spent</span>
            <TrendingUp className="w-4 h-4 text-forest-800" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-charcoal-900">
            ₹{totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-charcoal-500 font-light">
            Across {summary?.expenses.length || 0} journey transaction(s)
          </p>
        </div>

        {/* Journey Budget Target */}
        <div className="p-6 rounded-3xl bg-white border border-charcoal-100 shadow-soft-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-charcoal-400 font-bold uppercase tracking-wider">
            <span>Journey Budget</span>
            <PieChart className="w-4 h-4 text-sage-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-charcoal-900">
            ₹{budget.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-charcoal-500 font-light">
            Target allocated itinerary budget
          </p>
        </div>

        {/* Remaining Budget */}
        <div className="p-6 rounded-3xl bg-white border border-charcoal-100 shadow-soft-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-charcoal-400 font-bold uppercase tracking-wider">
            <span>Remaining Target</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className={`text-2xl sm:text-3xl font-serif font-bold ${isOverBudget ? 'text-rose-600' : 'text-forest-900'}`}>
            ₹{remainingBudget.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-charcoal-500 font-light">
            {isOverBudget ? `Overspent by ₹${overBy.toLocaleString('en-IN')}` : 'Available within planned limits'}
          </p>
        </div>

        {/* Trip Wallet Balance */}
        <div className="p-6 rounded-3xl bg-forest-900 text-white shadow-soft-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-sage-300 font-bold uppercase tracking-wider">
            <span>Trip Wallet</span>
            <WalletIcon className="w-4 h-4 text-sage-300" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-white">
            ₹{(walletBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="pt-1 flex items-center justify-between">
            <span className="text-[10px] text-sage-300">Zero-fee 1-click settlement</span>
            <Link to="/wallet" className="text-[11px] font-bold text-sage-200 hover:text-white underline">
              Top up →
            </Link>
          </div>
        </div>

      </div>

      {/* Progress Bar of Budget Utilization */}
      <div className="bg-white p-6 rounded-3xl border border-charcoal-100 shadow-soft-sm space-y-3">
        <div className="flex justify-between items-center text-xs font-semibold">
          <span className="text-charcoal-700">Journey Budget Utilization</span>
          <span className={isOverBudget ? 'text-rose-600 font-bold' : 'text-forest-900'}>
            {spentPct}% spent
          </span>
        </div>
        <div className="w-full h-3 bg-ivory-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              isOverBudget
                ? 'bg-rose-500'
                : spentPct >= 85
                ? 'bg-amber-500'
                : 'bg-forest-800'
            }`}
            style={{ width: `${Math.min(100, spentPct)}%` }}
          />
        </div>
      </div>

      {/* Category Breakdown & Expense History Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Category Breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-charcoal-100 shadow-soft-sm space-y-4">
          <h3 className="font-serif text-lg font-medium text-charcoal-900 border-b border-charcoal-100 pb-3">
            Spending by Category
          </h3>

          {summary?.categories && Object.keys(summary.categories).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(summary.categories).map(([cat, amt]) => {
                const catPct = totalSpent > 0 ? Math.round((amt / totalSpent) * 100) : 0;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-charcoal-800">
                      <span>{cat}</span>
                      <span>₹{amt.toLocaleString('en-IN')} <span className="text-charcoal-400 font-normal">({catPct}%)</span></span>
                    </div>
                    <div className="w-full h-1.5 bg-ivory-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-forest-800 rounded-full"
                        style={{ width: `${catPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-charcoal-400 italic">No categorized expenses recorded yet.</p>
          )}

          <div className="pt-4 border-t border-charcoal-100">
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full py-2.5 rounded-full bg-ivory-100 hover:bg-forest-800 hover:text-white text-charcoal-800 text-xs font-semibold transition-all shadow-soft-sm"
            >
              + Add Item to Breakdown
            </button>
          </div>
        </div>

        {/* Right Columns: Expense Transactions Table & Wallet Settlement */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-charcoal-100 shadow-soft-sm space-y-4">
          <div className="flex items-center justify-between border-b border-charcoal-100 pb-3">
            <h3 className="font-serif text-lg font-medium text-charcoal-900">
              Detailed Expense Transactions
            </h3>
            <span className="text-xs text-charcoal-400">
              {summary?.expenses?.length || 0} items
            </span>
          </div>

          {loading ? (
            <p className="text-xs text-charcoal-400 py-8 text-center animate-pulse">Loading journey expenses...</p>
          ) : !summary?.expenses || summary.expenses.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <PieChart className="w-10 h-10 text-charcoal-300 mx-auto" />
              <p className="text-sm font-serif font-medium text-charcoal-800">No expenses recorded yet</p>
              <p className="text-xs text-charcoal-500 max-w-sm mx-auto font-light">
                Track flights, boutique stays, restaurant tabs, activities, and local guide bookings as you journey.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-5 py-2.5 rounded-full bg-forest-800 text-white text-xs font-medium shadow-soft hover:bg-forest-900 transition-all"
              >
                Log First Expense
              </button>
            </div>
          ) : (
            <div className="divide-y divide-charcoal-100/70">
              {summary.expenses.map((exp) => {
                const isPaid = exp.paid_with_wallet || (exp.notes && exp.notes.includes('[Paid via Wallet]'));
                const canPayWithWallet = !isPaid;

                return (
                  <div key={exp.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-charcoal-900 text-sm">{exp.title}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-ivory-100 text-charcoal-600 border border-charcoal-200">
                          {exp.category}
                        </span>
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Paid via Wallet</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                            Unsettled
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-charcoal-400">
                        <span>{exp.spent_at ? new Date(exp.spent_at).toLocaleDateString() : 'Recent'}</span>
                        {exp.notes && <span>• {exp.notes.replace('[Paid via Wallet]', '').trim()}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <div className="text-right">
                        <span className="text-base font-bold text-charcoal-900">
                          ₹{exp.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>

                      {canPayWithWallet && (
                        <button
                          onClick={() => handlePayExpenseWithWallet(exp.id)}
                          disabled={payingExpenseId === exp.id}
                          className="px-3 py-1.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-semibold shadow-soft-sm transition-all flex items-center gap-1.5"
                          title="Settle this expense directly from your Trip Wallet"
                        >
                          <WalletIcon className="w-3.5 h-3.5" />
                          <span>{payingExpenseId === exp.id ? 'Settling...' : 'Pay with Wallet'}</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteExpense(exp.id)}
                        className="p-1.5 text-charcoal-400 hover:text-rose-600 transition-colors"
                        title="Delete expense"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Add Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-float border border-charcoal-100 p-6 sm:p-8 space-y-6">

            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full text-charcoal-400 hover:text-charcoal-800 hover:bg-ivory-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-forest-800 mb-1 block">
                Journey Log
              </span>
              <h2 className="font-serif text-2xl font-medium text-charcoal-900">
                Record New Journey Expense
              </h2>
              <p className="text-xs text-charcoal-500 mt-1 font-light">
                Log a trip expense and choose whether to settle it instantly via your Trip Wallet.
              </p>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-600 mb-1">
                  Expense Title / Item
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Michelin Dinner at Candlenut, Speedboat to Nusa Penida"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-charcoal-200 outline-none focus:border-forest-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-600 mb-1">
                    Amount in INR (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    placeholder="3500"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs font-bold text-charcoal-900 rounded-xl border border-charcoal-200 outline-none focus:border-forest-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-600 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs rounded-xl border border-charcoal-200 outline-none focus:border-forest-800 bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-600 mb-1">
                  Notes / Reference (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Receipt number, location, or travel notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-charcoal-200 outline-none focus:border-forest-800"
                />
              </div>

              {/* Pay with Trip Wallet Toggle */}
              <div className="p-4 rounded-2xl bg-forest-900 text-ivory-50 space-y-2">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-2">
                    <WalletIcon className="w-4 h-4 text-sage-300" />
                    <div>
                      <span className="text-xs font-semibold block">Pay Directly via Trip Wallet</span>
                      <span className="text-[10px] text-sage-300 block">
                        Available Balance: ₹{(walletBalance || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={payWithWallet}
                    onChange={(e) => setPayWithWallet(e.target.checked)}
                    className="w-4 h-4 accent-forest-700 cursor-pointer"
                  />
                </label>

                {payWithWallet && amount && parseFloat(amount) > (walletBalance || 0) && (
                  <p className="text-[11px] text-amber-300 pt-1 border-t border-forest-800">
                    ⚠️ Your wallet balance is less than this expense. Top up on the Trip Wallet page or uncheck this option to log it as an unpaid item.
                  </p>
                )}
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-charcoal-200 text-charcoal-700 text-xs font-medium hover:bg-ivory-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-semibold shadow-soft transition-all"
                >
                  {submitting ? 'Recording...' : payWithWallet ? 'Pay & Record Expense' : 'Save Expense Record'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

