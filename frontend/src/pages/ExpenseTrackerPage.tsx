import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PieChart, AlertTriangle, CheckCircle2, Plus, Wallet as WalletIcon,
  CreditCard, ArrowUpRight, DollarSign, Calendar, Tag, Trash2,
  TrendingUp, ShieldAlert, Sparkles, RefreshCw, ChevronRight, X
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
      setError(err?.message || 'Could not load journey expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [isAuthenticated]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount || Number(amount) <= 0) {
      setError('Please provide a valid expense title and positive amount.');
      return;
    }

    setSubmitting(true);
    setError('');
    setActionSuccess('');

    try {
      const res = await api.addExpense({
        title: title.trim(),
        amount: Number(amount),
        category,
        notes: notes.trim(),
        pay_with_wallet: payWithWallet,
      });

      setActionSuccess(res?.message || 'Expense successfully recorded!');
      setTitle('');
      setAmount('');
      setNotes('');
      setIsModalOpen(false);
      await fetchExpenses();
      await refreshWallet();
    } catch (err: any) {
      setError(err?.message || 'Failed to add expense. Please check your wallet balance.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayExpenseWithWallet = async (expense: Expense) => {
    try {
      setPayingExpenseId(expense.id);
      setError('');
      setActionSuccess('');

      const res = await api.payExpenseWithWallet(expense.id);
      setActionSuccess(res?.message || `Successfully settled ₹${expense.amount.toLocaleString('en-IN')} via Trip Wallet.`);
      await fetchExpenses();
      await refreshWallet();
    } catch (err: any) {
      setError(err?.message || 'Could not settle expense. Please verify your wallet balance.');
    } finally {
      setPayingExpenseId(null);
    }
  };

  const handleDeleteExpense = async (expenseId: number) => {
    if (!window.confirm('Are you sure you want to delete this expense record?')) return;
    try {
      await api.deleteExpense(expenseId);
      setActionSuccess('Expense record deleted.');
      await fetchExpenses();
    } catch (err: any) {
      setError(err?.message || 'Could not delete expense.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-3xl bg-[#FFF0F2] text-[#FF385C] border border-[#FFC5CC] flex items-center justify-center mx-auto mb-6">
          <PieChart className="w-8 h-8" />
        </div>
        <h1 className="font-serif text-3xl font-medium text-[#222222] mb-3">
          Journey Expense Tracker
        </h1>
        <p className="text-sm text-[#717171] max-w-md mx-auto mb-8">
          Sign in to your PlanMyTravel account to track overall trip spending, receive instant overexpense alerts, and settle journey expenses directly via your Trip Wallet.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="px-8 py-3.5 rounded-full bg-[#FF385C] hover:bg-[#E00B41] text-white text-xs font-semibold shadow-coral transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          Sign In to Access Expense Tracker
        </button>
      </div>
    );
  }

  const budget = summary?.budget || 100000;
  const totalSpent = summary?.total_spent || 0;
  const remainingBudget = summary?.remaining_budget ?? Math.max(0, budget - totalSpent);
  const isOverBudget = summary?.is_over_budget || totalSpent > budget;
  const overBudgetBy = summary?.over_budget_by || Math.max(0, totalSpent - budget);
  const spentPct = summary?.spent_percentage || Math.round((totalSpent / budget) * 100);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DDDDDD] pb-6 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#FFF0F2] text-[#FF385C] text-[10px] font-bold tracking-wider uppercase border border-[#FFC5CC]">
              Financial Control
            </span>
            <span className="text-xs text-[#717171]">Whole Journey Ledger</span>
          </div>
          <h1 className="font-serif text-3xl font-medium text-[#222222]">
            Journey Expense Tracker
          </h1>
          <p className="text-xs text-[#717171] mt-1">
            Track expenses throughout your itinerary, manage budgets with live alerts, and settle items via your Trip Wallet.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/wallet"
            className="px-4 py-2.5 rounded-full bg-white hover:bg-[#F2F2F2] border border-[#DDDDDD] text-[#222222] text-xs font-medium flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-soft-sm"
          >
            <WalletIcon className="w-4 h-4 text-[#FF385C]" />
            <span>Wallet: <strong>₹{(walletBalance || 0).toLocaleString('en-IN')}</strong></span>
          </Link>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 rounded-full bg-[#FF385C] hover:bg-[#E00B41] text-white text-xs font-semibold flex items-center gap-2 shadow-coral transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Log Expense</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="mb-6 p-4 rounded-2xl bg-[#F0FDF4] border border-[#DCFCE7] text-[#008A05] text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess('')} className="text-[#008A05] hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-[#FFF0F2] border border-[#FFC5CC] text-[#FF385C] text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-[#FF385C] hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Overexpense Alert Banner */}
      {isOverBudget ? (
        <div className="mb-8 p-5 rounded-3xl bg-gradient-to-r from-[#FFF0F2] to-[#FFE2E6] border-2 border-[#FF385C] shadow-soft">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-[#FF385C] text-white flex items-center justify-center flex-shrink-0 shadow-coral">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-base font-bold text-[#222222]">
                  ⚠️ Overexpense Alert: Budget Exceeded
                </h3>
                <span className="px-3 py-1 rounded-full bg-[#FF385C] text-white text-[11px] font-bold">
                  +{spentPct - 100}% Over Budget
                </span>
              </div>
              <p className="text-xs text-[#222222] mt-1.5 leading-relaxed">
                You have exceeded your planned journey budget of <strong>₹{budget.toLocaleString('en-IN')}</strong> by{' '}
                <strong className="text-[#FF385C] font-bold">₹{overBudgetBy.toLocaleString('en-IN')}</strong>. Total spending stands at{' '}
                <strong>₹{totalSpent.toLocaleString('en-IN')}</strong>.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <Link
                  to="/wallet"
                  className="px-4 py-2 rounded-full bg-[#FF385C] hover:bg-[#E00B41] text-white text-xs font-semibold shadow-coral transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  Top Up Wallet Balance →
                </Link>
                <Link
                  to="/concierge"
                  className="px-4 py-2 rounded-full bg-white hover:bg-[#F2F2F2] border border-[#DDDDDD] text-[#222222] text-xs font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  Rebalance AI Concierge Itinerary
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : spentPct >= 85 ? (
        <div className="mb-8 p-4 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] flex items-center justify-between shadow-soft-sm">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-[#D97706] flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-[#92400E]">Approaching Budget Limit</p>
              <p className="text-[11px] text-[#B45309]">
                You have utilized {spentPct}% of your planned allocation. Only ₹{remainingBudget.toLocaleString('en-IN')} remaining.
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#FEF3C7] text-[#92400E]">
            {100 - spentPct}% left
          </span>
        </div>
      ) : null}

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Spent */}
        <div className="p-5 rounded-3xl bg-white border border-[#DDDDDD] shadow-soft-sm">
          <div className="flex items-center justify-between text-[#717171] mb-2">
            <span className="text-xs font-medium">Total Journey Expenses</span>
            <div className="w-8 h-8 rounded-full bg-[#FFF0F2] text-[#FF385C] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-2xl font-bold text-[#222222]">
            ₹{totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-[#717171] mt-1">Across all logged itinerary items</p>
        </div>

        {/* Journey Budget */}
        <div className="p-5 rounded-3xl bg-white border border-[#DDDDDD] shadow-soft-sm">
          <div className="flex items-center justify-between text-[#717171] mb-2">
            <span className="text-xs font-medium">Journey Budget Target</span>
            <div className="w-8 h-8 rounded-full bg-[#F7F7F7] text-[#222222] flex items-center justify-center">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-2xl font-bold text-[#222222]">
            ₹{budget.toLocaleString('en-IN')}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 bg-[#F2F2F2] h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isOverBudget ? 'bg-[#FF385C]' : spentPct > 80 ? 'bg-[#D97706]' : 'bg-[#008A05]'
                }`}
                style={{ width: `${Math.min(100, spentPct)}%` }}
              ></div>
            </div>
            <span className="text-[10px] font-semibold text-[#717171]">{spentPct}%</span>
          </div>
        </div>

        {/* Remaining Budget */}
        <div className="p-5 rounded-3xl bg-white border border-[#DDDDDD] shadow-soft-sm">
          <div className="flex items-center justify-between text-[#717171] mb-2">
            <span className="text-xs font-medium">Remaining Allocation</span>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isOverBudget ? 'bg-[#FFF0F2] text-[#FF385C]' : 'bg-[#F0FDF4] text-[#008A05]'
              }`}
            >
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p
            className={`font-serif text-2xl font-bold ${
              isOverBudget ? 'text-[#FF385C]' : 'text-[#008A05]'
            }`}
          >
            {isOverBudget ? `-₹${overBudgetBy.toLocaleString('en-IN')}` : `₹${remainingBudget.toLocaleString('en-IN')}`}
          </p>
          <p className="text-[10px] text-[#717171] mt-1">
            {isOverBudget ? 'Exceeded by threshold' : 'Available for remaining itinerary'}
          </p>
        </div>

        {/* Trip Wallet Balance */}
        <div className="p-5 rounded-3xl bg-white border border-[#DDDDDD] shadow-soft-sm">
          <div className="flex items-center justify-between text-[#717171] mb-2">
            <span className="text-xs font-medium">Trip Wallet Balance</span>
            <div className="w-8 h-8 rounded-full bg-[#FFF0F2] text-[#FF385C] flex items-center justify-center">
              <WalletIcon className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-2xl font-bold text-[#222222]">
            ₹{(walletBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[10px] text-[#008A05] font-semibold">1-Click Settlement Ready</span>
            <Link
              to="/wallet"
              className="text-[10px] text-[#FF385C] hover:underline font-bold"
            >
              Top Up +
            </Link>
          </div>
        </div>
      </div>

      {/* Category Breakdown Chips */}
      {summary?.categories && Object.keys(summary.categories).length > 0 && (
        <div className="mb-8 p-6 rounded-3xl bg-[#F7F7F7] border border-[#DDDDDD]">
          <h3 className="font-serif text-base font-semibold text-[#222222] mb-3">
            Spending by Category
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {Object.entries(summary.categories).map(([cat, amt]) => (
              <div key={cat} className="p-3.5 rounded-2xl bg-white border border-[#DDDDDD] shadow-soft-sm">
                <span className="text-[11px] text-[#717171] font-medium block truncate">{cat}</span>
                <span className="font-serif text-base font-bold text-[#222222] mt-0.5 block">
                  ₹{amt.toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expenses Ledger Table */}
      <div className="bg-white rounded-3xl border border-[#DDDDDD] shadow-soft-sm overflow-hidden">
        <div className="p-6 border-b border-[#DDDDDD] flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg font-medium text-[#222222]">
              Recorded Journey Expenses
            </h3>
            <p className="text-xs text-[#717171] mt-0.5">
              Review line items, settle pending expenses via your Trip Wallet, and audit costs.
            </p>
          </div>
          <button
            onClick={fetchExpenses}
            className="p-2 rounded-full hover:bg-[#F2F2F2] text-[#717171] transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Refresh Ledger"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-[#717171]">Loading journey expenses...</div>
        ) : !summary?.expenses || summary.expenses.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-12 h-12 rounded-full bg-[#F7F7F7] text-[#717171] flex items-center justify-center mx-auto mb-3">
              <PieChart className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-[#222222]">No journey expenses logged yet</p>
            <p className="text-xs text-[#717171] mt-1 max-w-sm mx-auto">
              Start logging your dining, transport, entry tickets, and stays to monitor your budget and settle expenses via your Trip Wallet.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-5 px-6 py-2.5 rounded-full bg-[#FF385C] hover:bg-[#E00B41] text-white text-xs font-semibold shadow-coral transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              + Record First Expense
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#DDDDDD]">
            {summary.expenses.map((expense) => (
              <div
                key={expense.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F7F7F7] transition-colors"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#F7F7F7] border border-[#DDDDDD] flex items-center justify-center text-[#222222] flex-shrink-0 mt-0.5">
                    <Tag className="w-4 h-4 text-[#FF385C]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm text-[#222222]">{expense.title}</h4>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#F2F2F2] border border-[#DDDDDD] text-[#717171] text-[10px] font-medium">
                        {expense.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-[#717171]">
                      <span>{expense.spent_at}</span>
                      {expense.notes && (
                        <>
                          <span>•</span>
                          <span className="italic">{expense.notes}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 justify-between sm:justify-end">
                  <div className="text-right">
                    <span className="font-serif text-base font-bold text-[#222222] block">
                      ₹{expense.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                    {expense.paid_with_wallet ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#008A05]">
                        <CheckCircle2 className="w-3 h-3" />
                        Settled via Wallet
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#717171] font-medium">Unsettled</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {!expense.paid_with_wallet && (
                      <button
                        onClick={() => handlePayExpenseWithWallet(expense)}
                        disabled={payingExpenseId === expense.id}
                        className="px-3.5 py-1.5 rounded-full bg-[#FF385C] hover:bg-[#E00B41] text-white text-xs font-semibold shadow-coral transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                        title="Pay directly from Trip Wallet"
                      >
                        <WalletIcon className="w-3.5 h-3.5" />
                        <span>{payingExpenseId === expense.id ? 'Settling...' : 'Pay with Wallet'}</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteExpense(expense.id)}
                      className="p-2 rounded-full hover:bg-[#FFF0F2] text-[#717171] hover:text-[#FF385C] transition-all hover:scale-105 active:scale-95 cursor-pointer"
                      title="Delete expense"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Log Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-[#DDDDDD] shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-[#DDDDDD] mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#FFF0F2] text-[#FF385C] flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-medium text-[#222222]">Log Journey Expense</h3>
                  <p className="text-[11px] text-[#717171]">Record cost or settle immediately via Trip Wallet</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-[#F2F2F2] flex items-center justify-center text-[#717171] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#717171] mb-1">
                  Expense Description *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Kyoto Traditional Kaiseki Dinner, Airport Shinkansen..."
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-[#DDDDDD] focus:border-[#FF385C] outline-none text-[#222222]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#717171] mb-1">
                    Amount (INR ₹) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-sm font-bold text-[#717171]">₹</span>
                    <input
                      type="number"
                      required
                      min="1"
                      step="any"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="e.g. 3500"
                      className="w-full pl-8 pr-4 py-2.5 text-sm rounded-xl border border-[#DDDDDD] focus:border-[#FF385C] outline-none text-[#222222]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#717171] mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#DDDDDD] focus:border-[#FF385C] outline-none text-[#222222] bg-white cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#717171] mb-1">
                  Notes / Receipt Details
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional details, merchant name, or receipt notes..."
                  className="w-full px-4 py-2 text-xs rounded-xl border border-[#DDDDDD] focus:border-[#FF385C] outline-none text-[#222222]"
                ></textarea>
              </div>

              {/* Pay with Trip Wallet Toggle */}
              <div className="p-4 rounded-2xl bg-[#F7F7F7] border border-[#DDDDDD]">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={payWithWallet}
                    onChange={(e) => setPayWithWallet(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-[#FF385C] rounded cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#222222] block">
                      Pay instantly through Trip Wallet
                    </span>
                    <span className="text-[11px] text-[#717171] block mt-0.5">
                      Debits ₹{amount ? Number(amount).toLocaleString('en-IN') : '0'} directly from your wallet balance (Available: ₹{(walletBalance || 0).toLocaleString('en-IN')}).
                    </span>
                  </div>
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#DDDDDD]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-full hover:bg-[#F2F2F2] text-[#717171] text-xs font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-7 py-2.5 rounded-full bg-[#FF385C] hover:bg-[#E00B41] text-white text-xs font-semibold shadow-coral transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Recording...' : payWithWallet ? 'Pay & Record Expense' : 'Record Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

