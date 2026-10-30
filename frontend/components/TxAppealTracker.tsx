'use client';

import { useState, useEffect } from 'react';
import { Clock, ShieldCheck, AlertCircle, CheckCircle2, ArrowRight, ExternalLink, RefreshCw, XCircle } from 'lucide-react';
import { TrackedTx, TxStepState } from '@/lib/types';
import { getTrackedTransactions, saveTrackedTransactions } from '@/lib/txTracker';
import { EXPLORER_URL } from '@/lib/constants';

const STEPS: { key: TxStepState; label: string; desc: string }[] = [
  { key: 'submitted', label: '1. Submitted', desc: 'Broadcast to StudioNet mempool' },
  { key: 'pending', label: '2. Pending', desc: 'Intelligent GenVM validator consensus' },
  { key: 'accepted', label: '3. Accepted', desc: 'Native appeal window active' },
  { key: 'finalized-success', label: '4. Finalized', desc: 'Consensus sealed on ledger' },
];

export function TxAppealTracker() {
  const [trackedTxs, setTrackedTxs] = useState<TrackedTx[]>([]);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    setTrackedTxs(getTrackedTransactions());
    const interval = setInterval(() => {
      setNow(Date.now());
      setTrackedTxs(getTrackedTransactions());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  if (trackedTxs.length === 0) {
    return null;
  }

  const clearCompleted = () => {
    const active = trackedTxs.filter(t => t.step !== 'finalized-success' && t.step !== 'finalized-error');
    saveTrackedTransactions(active);
    setTrackedTxs(active);
  };

  return (
    <div className="rounded-xl border border-lex-700 bg-lex-900/95 p-4 shadow-xl backdrop-blur-md mb-6">
      <div className="flex items-center justify-between pb-3 border-b border-lex-800">
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-white">
            GenLayer Transaction Finality & Appeal Window Tracker
          </h3>
          <span className="rounded-full bg-cyan-950 px-2 py-0.5 text-[10px] font-bold text-cyan-400 border border-cyan-800">
            {trackedTxs.length} Tracked
          </span>
        </div>
        <button
          onClick={clearCompleted}
          className="text-[11px] text-gray-400 hover:text-white transition-colors"
        >
          Dismiss Finalized
        </button>
      </div>

      <div className="divide-y divide-lex-800">
        {trackedTxs.map((tx) => {
          const isError = tx.step === 'finalized-error';
          const isAccepted = tx.step === 'accepted';
          const isFinal = tx.step === 'finalized-success' || isError;

          // Compute remaining appeal time if in accepted stage
          let appealSecondsLeft = 0;
          if (isAccepted && tx.appealWindowEndsAt) {
            appealSecondsLeft = Math.max(0, Math.ceil((tx.appealWindowEndsAt - now) / 1000));
          }

          return (
            <div key={tx.hash} className="py-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-2">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-gold-400">{tx.action}</span>
                  <a
                    href={`${EXPLORER_URL}/tx/${tx.hash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-gray-400 hover:text-white flex items-center space-x-1"
                  >
                    <span>{tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                <div className="flex items-center space-x-2">
                  {isAccepted && (
                    <span className="rounded bg-amber-950/80 px-2 py-0.5 text-[10px] font-semibold text-amber-300 border border-amber-600 animate-pulse">
                      Appeal Window Open: {appealSecondsLeft}s
                    </span>
                  )}
                  {tx.step === 'finalized-success' && (
                    <span className="rounded bg-emerald-950/80 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 border border-emerald-600">
                      Finalized Success
                    </span>
                  )}
                  {isError && (
                    <span className="rounded bg-crimson-950/80 px-2 py-0.5 text-[10px] font-semibold text-crimson-300 border border-crimson-600">
                      Finalized Error
                    </span>
                  )}
                </div>
              </div>

              {/* 4-Phase Stepper */}
              <div className="grid grid-cols-4 gap-2 pt-1 text-[11px]">
                {STEPS.map((step, sIdx) => {
                  let stepStatus: 'done' | 'current' | 'pending' = 'pending';
                  if (tx.step === step.key) {
                    stepStatus = isFinal ? 'done' : 'current';
                  } else if (
                    (step.key === 'submitted' && (tx.step === 'pending' || tx.step === 'accepted' || tx.step === 'finalized-success')) ||
                    (step.key === 'pending' && (tx.step === 'accepted' || tx.step === 'finalized-success')) ||
                    (step.key === 'accepted' && tx.step === 'finalized-success')
                  ) {
                    stepStatus = 'done';
                  }

                  return (
                    <div
                      key={step.key}
                      className={`rounded-lg p-2 border transition-all ${
                        stepStatus === 'done'
                          ? 'border-emerald-600/50 bg-emerald-950/20 text-emerald-300'
                          : stepStatus === 'current'
                          ? 'border-cyan-500 bg-cyan-950/30 text-cyan-200'
                          : 'border-lex-800 bg-lex-950/40 text-gray-500'
                      }`}
                    >
                      <div className="flex items-center space-x-1.5 font-medium">
                        {stepStatus === 'done' ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        ) : stepStatus === 'current' ? (
                          <RefreshCw className="h-3.5 w-3.5 text-cyan-400 animate-spin" />
                        ) : (
                          <span className="h-3 w-3 rounded-full border border-gray-600 inline-block" />
                        )}
                        <span className="truncate">{step.label}</span>
                      </div>
                      <p className="text-[10px] opacity-75 mt-0.5 hidden sm:block">
                        {step.key === 'accepted' && isAccepted
                          ? `Window active (${appealSecondsLeft}s)`
                          : step.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
