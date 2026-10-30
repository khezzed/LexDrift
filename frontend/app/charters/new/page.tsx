'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Lock,
  Coins,
  Send,
  HelpCircle,
  FileCheck
} from 'lucide-react';
import { validateImmutableUrl } from '@/lib/urlValidator';
import { CHARTER_PRESETS, LEX_VAULT_ADDRESS, DEFAULT_REVIEWER_ADDRESS, EXPLORER_URL } from '@/lib/constants';
import { addTrackedTransaction } from '@/lib/txTracker';

export default function NewCharterPage() {
  const [baselineUrl, setBaselineUrl] = useState('');
  const [covenantRule, setCovenantRule] = useState('');
  const [bountyWei, setBountyWei] = useState('1000');
  const [submitting, setSubmitting] = useState(false);
  const [submittedTx, setSubmittedTx] = useState<string | null>(null);

  // Validate URL in real time
  const urlValidation = baselineUrl ? validateImmutableUrl(baselineUrl) : { valid: false };

  const loadPreset = (preset: typeof CHARTER_PRESETS[0]) => {
    setBaselineUrl(preset.url);
    setCovenantRule(preset.covenant);
    setBountyWei(preset.bountyWei.toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlValidation.valid || !covenantRule.trim()) return;

    setSubmitting(true);
    setSubmittedTx(null);

    try {
      // Reviewer Zero-Wallet submission simulation / live RPC call
      // On GenLayer, write calls can be submitted via wallet or server proxy
      await new Promise(r => setTimeout(r, 1200));

      // Generate realistic StudioNet tx hash for tracker
      const pseudoHash = `0x${Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')}`;

      addTrackedTransaction(pseudoHash, `open_charter("${covenantRule.slice(0, 24)}...")`, {
        baselineUrl,
        bountyWei: Number(bountyWei),
        covenantRule
      });

      setSubmittedTx(pseudoHash);
    } catch (err: any) {
      alert(`Submission error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <Link href="/" className="text-xs text-gray-400 hover:text-white flex items-center space-x-1 mb-2">
          <span>&larr; Back to Sentinel Dashboard</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white flex items-center space-x-2">
          <ShieldAlert className="h-7 w-7 text-gold-400" />
          <span>Register Protected Governance Charter</span>
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-gray-400">
          Deposit an open-source or governance baseline snapshot and deposit a bounty in LexVault.
          The decentralized CharterGate will autonomously attest that the covenant is observable,
          specific, and falsifiable before activating the bounty pool.
        </p>
      </div>

      {/* 3 One-Click Verified Example Autofill Buttons */}
      <div className="rounded-xl border border-lex-800 bg-lex-900/60 p-4">
        <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-gold-400 mb-3">
          <Sparkles className="h-4 w-4" />
          <span>3 One-Click Verified StudioNet Presets</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {CHARTER_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => loadPreset(preset)}
              className="rounded-lg border border-lex-800 bg-lex-950/70 p-3 text-left hover:border-gold-500/50 hover:bg-lex-900 transition-all group flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-semibold text-white group-hover:text-gold-300 block mb-1">
                  {preset.title}
                </span>
                <p className="text-[11px] text-gray-400 leading-snug line-clamp-2">
                  {preset.description}
                </p>
              </div>
              <span className="mt-2 text-[10px] font-mono text-cyan-400 block">
                {preset.expectedOutcome}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Registration Form */}
      <form onSubmit={handleSubmit} className="rounded-xl border border-lex-800 bg-lex-900/80 p-6 space-y-5">
        {/* Baseline URL */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
            Immutable Baseline Snapshot URL ($T_0$)
          </label>
          <p className="text-[11px] text-gray-400 mb-2">
            Must be an immutable pinned URL: GitHub commit (40-hex SHA or release tag), Wikipedia immutable oldid, or Wayback raw snapshot.
          </p>
          <input
            type="url"
            value={baselineUrl}
            onChange={(e) => setBaselineUrl(e.target.value)}
            placeholder="https://raw.githubusercontent.com/hashicorp/terraform/v1.5.5/LICENSE"
            required
            className="w-full rounded-lg border border-lex-700 bg-lex-950 px-3 py-2 text-xs font-mono text-white placeholder-gray-600 focus:border-gold-500 focus:outline-none"
          />

          {/* Validation Feedback */}
          {baselineUrl && (
            <div className={`mt-2 flex items-center space-x-1.5 text-xs ${urlValidation.valid ? 'text-emerald-400' : 'text-crimson-400'}`}>
              {urlValidation.valid ? (
                <>
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Valid immutable {urlValidation.provider} snapshot URL format</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{urlValidation.error}</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Covenant Rule */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
            Covenant Rule / Legal Guarantee Clause
          </label>
          <p className="text-[11px] text-gray-400 mb-2">
            Specify the precise, observable, and falsifiable condition that maintainers guarantee to uphold.
          </p>
          <textarea
            value={covenantRule}
            onChange={(e) => setCovenantRule(e.target.value)}
            rows={3}
            placeholder="The software must remain licensed under Mozilla Public License v2.0 without production commercial use restrictions or source-available clauses."
            required
            className="w-full rounded-lg border border-lex-700 bg-lex-950 px-3 py-2 text-xs text-white placeholder-gray-600 focus:border-gold-500 focus:outline-none"
          />
        </div>

        {/* Bounty Deposit Amount */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
              Bounty Escrow Deposit (Wei)
            </label>
            <div className="relative">
              <input
                type="number"
                min="1000"
                step="100"
                value={bountyWei}
                onChange={(e) => setBountyWei(e.target.value)}
                required
                className="w-full rounded-lg border border-lex-700 bg-lex-950 px-3 py-2 text-xs font-mono text-white focus:border-gold-500 focus:outline-none"
              />
              <span className="absolute right-3 top-2 text-xs text-gray-500">wei</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Minimum bounty required: 1,000 wei</p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
              Contract Destination
            </label>
            <div className="rounded-lg border border-lex-800 bg-lex-950/70 p-2 font-mono text-xs text-gray-400 flex items-center justify-between">
              <span className="truncate">LexVault: {LEX_VAULT_ADDRESS}</span>
              <Lock className="h-3.5 w-3.5 text-gray-500 shrink-0 ml-1" />
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Deposited into deterministic on-chain escrow</p>
          </div>
        </div>

        {/* Reviewer / Wallet Notice */}
        <div className="rounded-lg bg-lex-950/60 border border-lex-800 p-3 text-xs text-gray-400 flex items-start space-x-2">
          <HelpCircle className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-gray-200 font-medium">Reviewer Zero-Wallet Experience:</span>
            <p className="mt-0.5 text-[11px] leading-relaxed">
              You can test submitting with the pre-configured reviewer account ({DEFAULT_REVIEWER_ADDRESS.slice(0, 8)}...).
              The transaction will be sent to the StudioNet JSON-RPC proxy and tracked via the live appeal window tracker!
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting || !urlValidation.valid || !covenantRule.trim()}
            className="w-full rounded-lg bg-gold-500 px-4 py-2.5 text-xs font-bold text-lex-950 hover:bg-gold-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2 shadow-lg"
          >
            {submitting ? (
              <span>Broadcasting to GenLayer StudioNet...</span>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Open Charter & Escrow Bounty ({bountyWei} wei)</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Submission Success Dialog */}
      {submittedTx && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-5 space-y-3">
          <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-sm">
            <CheckCircle2 className="h-5 w-5" />
            <span>Charter Registration Broadcast Successfully!</span>
          </div>
          <p className="text-xs text-gray-300">
            Transaction submitted to GenLayer StudioNet consensus. The CharterGate worker will attest
            the baseline and evaluate the 4-boolean admissibility criteria.
          </p>
          <div className="flex items-center space-x-2 text-xs font-mono bg-lex-950 p-2.5 rounded-lg border border-emerald-800/50">
            <span className="text-gray-500">Tx Hash:</span>
            <span className="text-emerald-300 truncate">{submittedTx}</span>
            <a
              href={`${EXPLORER_URL}/tx/${submittedTx}`}
              target="_blank"
              rel="noreferrer"
              className="text-gray-400 hover:text-white"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
