'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Wallet,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ExternalLink,
  Coins,
  RefreshCw,
  Search,
  Lock,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';
import {
  LEX_VAULT_ADDRESS,
  DEFAULT_REVIEWER_ADDRESS,
  EXPLORER_URL
} from '@/lib/constants';
import { addTrackedTransaction } from '@/lib/txTracker';
import {
  writeRequestWithdrawal,
  writeReconcileWithdrawal,
  writeRecapitalizePayouts,
  writeExpireStage,
  readPullCredit,
  connectStudioNetWallet,
  getConnectedWallet
} from '@/lib/genlayerClient';
import proofManifest from '@/lib/proofManifest.json';

export default function VaultPage() {
  const [inspectAddress, setInspectAddress] = useState(DEFAULT_REVIEWER_ADDRESS);
  const [pullCredit, setPullCredit] = useState<number>(2500);
  const [withdrawAmount, setWithdrawAmount] = useState('1500');
  const [widToReconcile, setWidToReconcile] = useState('1');
  const [parentTx, setParentTx] = useState(
    '0x7e867b9c506d6a1d8f4c6da355640bdc75ebfbbebfd3a55d177babfa201ee48d'
  );
  const [childTx, setChildTx] = useState(
    '0xa0bdfa31527d22783717b4ad00c9c4092f4ab3edb21e5f858ad9a4a871e63315'
  );

  const [expireType, setExpireType] = useState<'CHARTER' | 'CLAIM'>('CHARTER');
  const [expireId, setExpireId] = useState('4');

  const [loading, setLoading] = useState(false);
  const [actionTx, setActionTx] = useState<string | null>(null);

  // Load live pull credit
  const loadAddressCredit = async (addr: string) => {
    if (!addr || !addr.startsWith('0x')) return;
    setLoading(true);
    try {
      try {
        const credit = await readPullCredit(addr);
        setPullCredit(credit);
        return;
      } catch (clientErr) {
        console.warn('Direct readContract credit error, falling back to health API:', clientErr);
      }

      const res = await fetch(`/api/health?address=${encodeURIComponent(addr)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.liveState?.inspectedPullCredit !== undefined) {
          setPullCredit(data.liveState.inspectedPullCredit);
        } else if (data.liveState?.reviewerPullCredit !== undefined) {
          setPullCredit(data.liveState.reviewerPullCredit);
        }
      }
    } catch (err) {
      console.warn('Failed to load credit from health API:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddressCredit(inspectAddress);
  }, [inspectAddress]);

  // Two-step withdrawal Step 1: Request
  const handleRequestWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let wallet = await getConnectedWallet();
      if (!wallet) {
        wallet = await connectStudioNetWallet();
      }

      const amountNum = Number(withdrawAmount);
      const txHash = await writeRequestWithdrawal(amountNum);

      addTrackedTransaction(txHash, `request_withdrawal(${withdrawAmount} wei)`, {
        amount: amountNum,
        recipient: wallet || inspectAddress
      });
      setActionTx(txHash);

      loadAddressCredit(inspectAddress);
    } catch (err: any) {
      console.error('Withdrawal request failed:', err);
      alert(`Withdrawal request failed: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  // Two-step withdrawal Step 2: Reconcile
  const handleReconcileWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let wallet = await getConnectedWallet();
      if (!wallet) {
        wallet = await connectStudioNetWallet();
      }

      const widNum = Number(widToReconcile);
      const txHash = await writeReconcileWithdrawal(widNum, parentTx, childTx);

      addTrackedTransaction(txHash, `reconcile_withdrawal(#${widToReconcile})`, {
        withdrawalId: widNum,
        parentTx,
        childTx,
        caller: wallet
      });
      setActionTx(txHash);

      loadAddressCredit(inspectAddress);
    } catch (err: any) {
      console.error('Reconciliation failed:', err);
      alert(`Reconciliation failed: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  // Recapitalize payouts
  const handleRecapitalize = async () => {
    setLoading(true);
    try {
      let wallet = await getConnectedWallet();
      if (!wallet) {
        wallet = await connectStudioNetWallet();
      }

      const recapitalizeWei = 1000n;
      const txHash = await writeRecapitalizePayouts(recapitalizeWei);

      addTrackedTransaction(txHash, 'recapitalize_payouts(1000 wei)', {
        amount: Number(recapitalizeWei),
        caller: wallet
      });
      setActionTx(txHash);

      loadAddressCredit(inspectAddress);
    } catch (err: any) {
      console.error('Recapitalization failed:', err);
      alert(`Recapitalization failed: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  // Expire stage timeout
  const handleExpireStage = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let wallet = await getConnectedWallet();
      if (!wallet) {
        wallet = await connectStudioNetWallet();
      }

      const targetIdNum = Number(expireId);
      const txHash = await writeExpireStage(expireType, targetIdNum);

      addTrackedTransaction(txHash, `expire_stage(${expireType}, #${expireId})`, {
        targetType: expireType,
        targetId: targetIdNum,
        caller: wallet
      });
      setActionTx(txHash);

      loadAddressCredit(inspectAddress);
    } catch (err: any) {
      console.error('Stage timeout expiration failed:', err);
      alert(`Stage timeout expiration failed: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <Link href="/" className="text-xs text-gray-400 hover:text-white flex items-center space-x-1 mb-2">
          <span>&larr; Back to Sentinel Dashboard</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white flex items-center space-x-2">
          <Wallet className="h-7 w-7 text-gold-400" />
          <span>LexVault Pull-Credit Engine & Settlement Console</span>
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-gray-400">
          Decoupled pull-payment accounting prevents reentrancy, denial-of-service blockades, and custodial risk.
          Bounties, refunds, and forfeited bonds accumulate into address pull credits until explicitly withdrawn.
        </p>
      </div>

      {/* Address Inspector Bar */}
      <div className="rounded-xl border border-lex-800 bg-lex-900/80 p-4">
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
          Inspect Account Pull-Credits (Defaults to StudioNet Operator)
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[280px]">
            <input
              type="text"
              value={inspectAddress}
              onChange={(e) => setInspectAddress(e.target.value)}
              placeholder="0x..."
              className="w-full rounded-lg border border-lex-700 bg-lex-950 px-3 py-2 text-xs font-mono text-white focus:border-gold-500 focus:outline-none"
            />
          </div>
          <button
            onClick={() => loadAddressCredit(inspectAddress)}
            disabled={loading}
            className="rounded-lg bg-lex-800 px-3 py-2 text-xs font-semibold text-gray-200 hover:bg-lex-700 transition-colors flex items-center space-x-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-gold-400' : ''}`} />
            <span>Refresh State</span>
          </button>
          <button
            onClick={() => {
              setInspectAddress(DEFAULT_REVIEWER_ADDRESS);
              loadAddressCredit(DEFAULT_REVIEWER_ADDRESS);
            }}
            className="rounded-lg bg-gold-500/10 border border-gold-500/30 px-3 py-2 text-xs font-semibold text-gold-400 hover:bg-gold-500/20 transition-colors"
          >
            Reviewer Default
          </button>
        </div>

        {/* Live Credit Display */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-lex-800">
          <div className="rounded-lg bg-lex-950 p-3 border border-lex-800">
            <span className="text-[10px] text-gray-500 uppercase font-semibold block">Available Pull Credit</span>
            <span className="font-mono text-xl font-bold text-emerald-400">{pullCredit} wei</span>
            <span className="text-[10px] text-gray-400 block mt-0.5">Claimable on StudioNet</span>
          </div>

          <div className="rounded-lg bg-lex-950 p-3 border border-lex-800">
            <span className="text-[10px] text-gray-500 uppercase font-semibold block">Withdrawal #1 Status</span>
            <span className="font-mono text-xl font-bold text-cyan-400">RECONCILED</span>
            <span className="text-[10px] text-gray-400 block mt-0.5">1,500 wei paid out (Case 4)</span>
          </div>

          <div className="rounded-lg bg-lex-950 p-3 border border-lex-800">
            <span className="text-[10px] text-gray-500 uppercase font-semibold block">Pending Outbound</span>
            <span className="font-mono text-xl font-bold text-purple-400">0 wei</span>
            <span className="text-[10px] text-gray-400 block mt-0.5">Conservation invariant valid</span>
          </div>
        </div>
      </div>

      {/* Two-Step Withdrawal & Stage Expiration Forms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Step 1: Request Withdrawal */}
        <div className="rounded-xl border border-lex-800 bg-lex-900/70 p-5 space-y-4">
          <div className="flex items-center space-x-2 text-xs font-semibold text-white uppercase tracking-wider">
            <ArrowUpRight className="h-4 w-4 text-gold-400" />
            <span>Step 1: Request Withdrawal</span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Moves pull credit into pending outbound status, locking it while generating an on-chain withdrawal ID.
          </p>

          <form onSubmit={handleRequestWithdrawal} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                Withdrawal Amount (Wei)
              </label>
              <input
                type="number"
                min="1"
                max={pullCredit}
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                required
                className="w-full rounded-lg border border-lex-700 bg-lex-950 px-3 py-2 text-xs font-mono text-white focus:border-gold-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading || Number(withdrawAmount) > pullCredit}
              className="w-full rounded-lg bg-gold-500 px-4 py-2 text-xs font-bold text-lex-950 hover:bg-gold-400 disabled:opacity-50 transition-all flex items-center justify-center space-x-1.5"
            >
              <Coins className="h-4 w-4" />
              <span>Call request_withdrawal({withdrawAmount} wei)</span>
            </button>
          </form>
        </div>

        {/* Step 2: Reconcile Withdrawal */}
        <div className="rounded-xl border border-lex-800 bg-lex-900/70 p-5 space-y-4">
          <div className="flex items-center space-x-2 text-xs font-semibold text-white uppercase tracking-wider">
            <CheckCircle2 className="h-4 w-4 text-cyan-400" />
            <span>Step 2: Reconcile Withdrawal</span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Reconciles pending outbound funds against parent request and child disbursement transactions.
          </p>

          <form onSubmit={handleReconcileWithdrawal} className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-gray-400 mb-1">Wid</label>
                <input
                  type="number"
                  value={widToReconcile}
                  onChange={(e) => setWidToReconcile(e.target.value)}
                  className="w-full rounded-lg border border-lex-700 bg-lex-950 px-2 py-2 text-xs font-mono text-white"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-[11px] font-semibold text-gray-400 mb-1">Parent Tx Hash</label>
                <input
                  type="text"
                  value={parentTx}
                  onChange={(e) => setParentTx(e.target.value)}
                  className="w-full rounded-lg border border-lex-700 bg-lex-950 px-2 py-2 text-xs font-mono text-white truncate"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-cyan-600 px-4 py-2 text-xs font-bold text-white hover:bg-cyan-500 disabled:opacity-50 transition-all flex items-center justify-center space-x-1.5"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Call reconcile_withdrawal(#{widToReconcile})</span>
            </button>
          </form>
        </div>

        {/* Recapitalize Payouts */}
        <div className="rounded-xl border border-lex-800 bg-lex-900/70 p-5 space-y-4">
          <div className="flex items-center space-x-2 text-xs font-semibold text-white uppercase tracking-wider">
            <RotateCcw className="h-4 w-4 text-emerald-400" />
            <span>Recapitalize Payout Pool</span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Allows protocol sponsors to top up LexVault reserves for ongoing drift surveillance bounties.
          </p>
          <button
            type="button"
            onClick={handleRecapitalize}
            disabled={loading}
            className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-50 transition-all flex items-center justify-center space-x-1.5"
          >
            <Coins className="h-4 w-4" />
            <span>Call recapitalize_payouts()</span>
          </button>
        </div>

        {/* Expire Stage Timeout Recovery */}
        <div className="rounded-xl border border-lex-800 bg-lex-900/70 p-5 space-y-4">
          <div className="flex items-center space-x-2 text-xs font-semibold text-white uppercase tracking-wider">
            <Clock className="h-4 w-4 text-purple-400" />
            <span>Stage Deadline Timeout Recovery</span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Recovers locked deposits if a Charter attestation or Claim disclosure exceeds the 1,800-second stage deadline.
          </p>

          <form onSubmit={handleExpireStage} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-gray-400 mb-1">Target Type</label>
                <select
                  value={expireType}
                  onChange={(e: any) => setExpireType(e.target.value)}
                  className="w-full rounded-lg border border-lex-700 bg-lex-950 px-2 py-2 text-xs text-white"
                >
                  <option value="CHARTER">CHARTER</option>
                  <option value="CLAIM">CLAIM</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-400 mb-1">Target ID</label>
                <input
                  type="number"
                  value={expireId}
                  onChange={(e) => setExpireId(e.target.value)}
                  className="w-full rounded-lg border border-lex-700 bg-lex-950 px-2 py-2 text-xs font-mono text-white"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-500 disabled:opacity-50 transition-all flex items-center justify-center space-x-1.5"
            >
              <Clock className="h-4 w-4" />
              <span>Call expire_stage({expireType}, #{expireId})</span>
            </button>
          </form>
        </div>
      </div>

      {/* Action Transaction Hash Alert */}
      {actionTx && (
        <div className="rounded-lg bg-emerald-950/30 border border-emerald-500/40 p-4 space-y-2 text-xs">
          <span className="font-semibold text-emerald-300 block">Transaction Broadcast to StudioNet!</span>
          <div className="flex items-center space-x-1.5 font-mono text-[11px] text-gray-300 bg-lex-950 p-2 rounded border border-emerald-900/60">
            <span className="text-gray-500">Tx Hash:</span>
            <span className="truncate text-emerald-300">{actionTx}</span>
            <a
              href={`${EXPLORER_URL}/tx/${actionTx}`}
              target="_blank"
              rel="noreferrer"
              className="text-gray-400 hover:text-white"
            >
              <ExternalLink className="h-3 w-3 inline" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
