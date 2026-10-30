'use client';

import { ShieldCheck, AlertTriangle, Lock, ArrowUpRight, DollarSign } from 'lucide-react';
import { AccountingState } from '@/lib/types';

interface InvariantBarProps {
  accounting: AccountingState;
  sourceLabel?: string;
}

export function InvariantBar({ accounting, sourceLabel = 'Live StudioNet' }: InvariantBarProps) {
  const { total_escrow, total_credits, total_pending_outbound, total_value_locked, invariant_valid } = accounting;
  const sumComponents = total_escrow + total_credits + total_pending_outbound;
  const isValid = invariant_valid && sumComponents === total_value_locked;

  const escrowPct = total_value_locked > 0 ? (total_escrow / total_value_locked) * 100 : 0;
  const creditsPct = total_value_locked > 0 ? (total_credits / total_value_locked) * 100 : 0;
  const pendingPct = total_value_locked > 0 ? (total_pending_outbound / total_value_locked) * 100 : 0;

  return (
    <div className="rounded-xl border border-lex-800 bg-lex-900/80 p-4 shadow-lg backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-lex-800">
        <div className="flex items-center space-x-2">
          <div className={`p-1.5 rounded-lg ${isValid ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-crimson-500/10 text-crimson-400 border border-crimson-500/30'}`}>
            {isValid ? <ShieldCheck className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold tracking-wide text-white uppercase">Conservation Invariant</span>
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${
                isValid
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                  : 'bg-crimson-950 text-crimson-300 border border-crimson-600'
              }`}>
                {isValid ? 'Invariant Valid' : 'Invariant Breached'}
              </span>
              <span className="text-xs text-gray-400 font-mono">({sourceLabel})</span>
            </div>
            <p className="text-xs text-gray-400">
              Fundamental balance axiom: Escrow + Credits + Pending Outbound == Total Value Locked
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-xs font-mono">
          <div className="text-right">
            <span className="text-gray-400 block text-[10px] uppercase">TVL Stored</span>
            <span className="text-sm font-bold text-gold-400">{total_value_locked} wei</span>
          </div>
        </div>
      </div>

      {/* Visual Invariant Formula & Values */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-3 text-xs">
        <div className="rounded-lg bg-lex-950/60 p-2.5 border border-lex-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase text-cyan-400 block font-semibold">total_escrow</span>
            <span className="font-mono text-sm font-bold text-white">{total_escrow} wei</span>
          </div>
          <span className="text-xs text-gray-500 font-bold">+</span>
        </div>

        <div className="rounded-lg bg-lex-950/60 p-2.5 border border-lex-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase text-gold-400 block font-semibold">total_credits</span>
            <span className="font-mono text-sm font-bold text-white">{total_credits} wei</span>
          </div>
          <span className="text-xs text-gray-500 font-bold">+</span>
        </div>

        <div className="rounded-lg bg-lex-950/60 p-2.5 border border-lex-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase text-purple-400 block font-semibold">total_pending</span>
            <span className="font-mono text-sm font-bold text-white">{total_pending_outbound} wei</span>
          </div>
          <span className="text-xs text-gray-500 font-bold">==</span>
        </div>

        <div className={`rounded-lg p-2.5 border flex items-center justify-between ${
          isValid
            ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
            : 'bg-crimson-950/20 border-crimson-500/30 text-crimson-300'
        }`}>
          <div>
            <span className="text-[10px] uppercase block font-semibold opacity-90">total_value_locked</span>
            <span className="font-mono text-sm font-bold">{total_value_locked} wei</span>
          </div>
          <Lock className="h-4 w-4 opacity-75" />
        </div>
      </div>

      {/* Progress Breakdown Bar */}
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-lex-950 flex border border-lex-800">
        <div
          style={{ width: `${escrowPct}%` }}
          className="bg-cyan-500/80 transition-all duration-500"
          title={`Escrow: ${total_escrow} wei (${escrowPct.toFixed(1)}%)`}
        />
        <div
          style={{ width: `${creditsPct}%` }}
          className="bg-gold-500/80 transition-all duration-500"
          title={`Credits: ${total_credits} wei (${creditsPct.toFixed(1)}%)`}
        />
        <div
          style={{ width: `${pendingPct}%` }}
          className="bg-purple-500/80 transition-all duration-500"
          title={`Pending Outbound: ${total_pending_outbound} wei (${pendingPct.toFixed(1)}%)`}
        />
      </div>
    </div>
  );
}
