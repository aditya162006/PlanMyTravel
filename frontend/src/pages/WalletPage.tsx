import React, { useState, useEffect } from 'react';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, ShieldCheck, AlertCircle, Plus, CheckCircle2, RotateCw } from 'lucide-react';
import { Wallet, WalletTransaction } from '../types';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const WalletPage: React.FC = () => {
  const { user, isAuthenticated, openAuthModal, refreshWallet } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTestMode, setIsTestMode] = useState(true);

  // Top up modal
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [amount, setAmount] = useState<number>(5000);
  const [topUpLoading, setTopUpLoading] = useState(false);
  const [topUpMessage, setTopUpMessage] = useState('');
  const [topUpError, setTopUpError] = useState('');

  const fetchWallet = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const data = await api.getWallet();
      if (data?.wallet) setWallet(data.wallet);
      if (data?.transactions) setTransactions(data.transactions);
      if (data?.is_test_mode !== undefined) setIsTestMode(data.is_test_mode);
    } catch (err) {
      console.error('Failed to load wallet:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchWallet();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handleTopUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTopUpError('');
    setTopUpMessage('');
    setTopUpLoading(true);

    try {
      // 1. Create Order with backend (authoritative server-side amount)
      const orderRes = await api.createWalletOrder(amount);
      const order = orderRes.order;

      // 2. In Sandbox / Test Mode, simulate Razorpay payment response
      const simulatedPaymentId = `pay_sim_${Date.now()}`;
      const simulatedSignature = `sig_valid_${Date.now()}`;

      // 3. Cryptographically verify payment on backend
      const verifyRes = await api.verifyPayment({
        razorpay_order_id: order.order_id,
        razorpay_payment_id: simulatedPaymentId,
        razorpay_signature: simulatedSignature,
        amount,
      });

      setTopUpMessage(`Successfully credited ₹${amount.toLocaleString('en-IN')} to your Trip Wallet!`);
      await fetchWallet();
      await refreshWallet();

      setTimeout(() => {
        setTopUpOpen(false);
        setTopUpMessage('');
      }, 2000);
    } catch (err: any) {
      setTopUpError(err.message || 'Payment top-up failed');
    } finally {
      setTopUpLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-ivory-100 text-charcoal-500 flex items-center justify-center mx-auto">
          <WalletIcon className="w-6 h-6 stroke-[1.5]" />
        </div>
        <h2 className="font-serif text-2xl font-medium text-charcoal-900">Trip Wallet Access</h2>
        <p className="text-xs text-charcoal-500 leading-relaxed font-light">
          Sign in or create an account to view your balance, top up travel funds, and manage transaction history.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="px-6 py-2.5 rounded-full bg-forest-800 text-ivory-50 text-xs font-semibold hover:bg-forest-900 transition-colors shadow-soft"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

      {/* Page Title */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sage-50 text-forest-800 text-xs font-semibold mb-2 border border-sage-200/50">
          <ShieldCheck className="w-3.5 h-3.5 text-sage-600" />
          <span>{isTestMode ? 'Razorpay Test Sandbox Active' : 'Live Gateway Active'}</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-medium text-charcoal-900">
          Trip Wallet
        </h1>
        <p className="text-sm text-charcoal-500 mt-2 font-light">
          Manage your travel budget, top up funds via Razorpay, and review auditable transaction ledgers.
        </p>
      </div>

      {/* Balance Card & Quick Actions */}
      <div className="bg-forest-900 text-ivory-100 rounded-3xl p-8 sm:p-10 shadow-soft-lg flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <span className="text-xs uppercase tracking-widest text-sage-300 font-bold block mb-1">
            Available Travel Balance
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-4xl sm:text-5xl font-bold text-white tracking-tight">
              ₹{(wallet?.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-sage-200 font-semibold">{wallet?.currency || 'INR'}</span>
          </div>
          <p className="text-[11px] text-ivory-300 mt-2 font-light">
            Held in integer minor units (paise) with cryptographic payment verification.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setTopUpOpen(true)}
            className="px-6 py-3.5 rounded-full bg-sage-500 hover:bg-sage-600 text-forest-950 font-semibold text-xs flex items-center gap-2 shadow-soft transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Money to Wallet</span>
          </button>
        </div>
      </div>

      {/* Regulatory Boundary Notice */}
      <div className="p-5 rounded-2xl bg-ivory-100 border border-charcoal-100 text-xs text-charcoal-600 space-y-1.5 font-light leading-relaxed">
        <span className="font-semibold text-charcoal-900 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-forest-800" />
          <span>Regulatory & Security Notice</span>
        </span>
        <p>
          Trip Wallet operates in developer sandbox mode using simulated Razorpay payments. Wallet balances can be applied directly towards eligible stays and trip purchases. In production, stored-value wallets require authorized regulatory clearance and payment aggregator approvals.
        </p>
      </div>

      {/* Transaction History Ledger */}
      <div className="bg-white rounded-3xl border border-charcoal-100 p-6 sm:p-8 shadow-soft space-y-6">
        <div className="flex items-center justify-between border-b border-charcoal-100 pb-4">
          <div>
            <h3 className="font-serif text-xl font-medium text-charcoal-900">Transaction History</h3>
            <p className="text-xs text-charcoal-400">Authoritative immutable ledger of credits and debits.</p>
          </div>
          <button
            onClick={fetchWallet}
            className="p-2 rounded-full text-charcoal-400 hover:text-charcoal-800 hover:bg-ivory-100 transition-colors"
            title="Refresh Ledger"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {transactions.length === 0 ? (
          <div className="py-12 text-center text-xs text-charcoal-400">
            No transactions recorded yet. Click "Add Money to Wallet" to initiate a test top-up.
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => {
              const isCredit = tx.type === 'credit' || tx.type === 'topup';
              return (
                <div
                  key={tx.id}
                  className="p-4 rounded-2xl bg-ivory-50/70 border border-charcoal-100 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isCredit ? 'bg-sage-100 text-forest-800' : 'bg-terracotta-100 text-terracotta-700'
                    }`}>
                      {isCredit ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="font-semibold text-charcoal-900">{tx.description || (isCredit ? 'Top-up' : 'Booking Payment')}</h4>
                      <div className="flex items-center gap-2 text-[11px] text-charcoal-400 mt-0.5">
                        <span>{new Date(tx.created_at).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="font-mono">{tx.reference || `TX-${tx.id}`}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`font-serif text-sm font-bold block ${
                      isCredit ? 'text-forest-800' : 'text-charcoal-900'
                    }`}>
                      {isCredit ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] text-charcoal-400 uppercase tracking-wider font-semibold">
                      {tx.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Top Up Modal */}
      {topUpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-float border border-charcoal-100 p-8 space-y-6">
            <div>
              <h3 className="font-serif text-2xl font-medium text-charcoal-900">Add Money to Trip Wallet</h3>
              <p className="text-xs text-charcoal-500 mt-1">
                Enter amount in INR. Verified via Razorpay payment gateway order.
              </p>
            </div>

            {topUpError && (
              <div className="p-3 rounded-xl bg-terracotta-50 text-terracotta-700 text-xs">
                {topUpError}
              </div>
            )}

            {topUpMessage && (
              <div className="p-3 rounded-xl bg-sage-50 text-forest-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sage-600" />
                <span>{topUpMessage}</span>
              </div>
            )}

            <form onSubmit={handleTopUpSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-500 mb-1">
                  Amount in Rupees (₹)
                </label>
                <input
                  type="number"
                  min="1"
                  max="200000"
                  step="1"
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-4 py-3 text-lg font-serif font-bold text-charcoal-900 rounded-xl border border-charcoal-200 focus:border-forest-800 outline-none"
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex gap-2">
                {[1000, 5000, 10000, 25000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border ${
                      amount === preset
                        ? 'bg-forest-800 text-white border-forest-800'
                        : 'bg-ivory-50 text-charcoal-700 border-charcoal-200 hover:border-charcoal-400'
                    }`}
                  >
                    +₹{(preset / 1000)}k
                  </button>
                ))}
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setTopUpOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-charcoal-200 text-charcoal-700 text-xs font-medium hover:bg-ivory-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={topUpLoading}
                  className="flex-1 py-3 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-soft disabled:opacity-50"
                >
                  {topUpLoading ? 'Processing...' : `Pay ₹${amount.toLocaleString('en-IN')}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

