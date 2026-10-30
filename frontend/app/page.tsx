'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ArrowRight,
  Database,
  Activity,
  Layers,
  FileText,
  FileCode,
  Scale,
  RefreshCw,
  Clock,
  Coins
} from 'lucide-react';
import { InvariantBar } from '@/components/InvariantBar';
import { TxAppealTracker } from '@/components/TxAppealTracker';
import {
  LEX_VAULT_ADDRESS,
  CHARTER_GATE_ADDRESS,
  DRIFT_AUDITOR_ADDRESS,
  EXPLORER_URL,
  DEFAULT_REVIEWER_ADDRESS
} from '@/lib/constants';
import proofManifest from '@/lib/proofManifest.json';
import { AccountingState, ProofScenario } from '@/lib/types';

export default function DashboardPage() {
  const [dataSource, setDataSource] = useState<'proof' | 'live'>('live');
  const [loading, setLoading] = useState<boolean>(false);
  const [liveAccounting, setLiveAccounting] = useState<AccountingState>(proofManifest.finalAccounting);
  const [chartersList, setChartersList] = useState<any[]>([]);
  const [healthStatus, setHealthStatus] = useState<any>(null);

  const fetchLiveData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setHealthStatus(data);
        if (data.liveState?.accounting) {
          setLiveAccounting(data.liveState.accounting);
        }
        if (data.liveState?.charters) {
          setChartersList(data.liveState.charters);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch live health data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveData();
    const interval = setInterval(fetchLiveData, 15000);
    return () => clearInterval(interval);
  }, []);

  const scenarios: ProofScenario[] = proofManifest.scenarios;

  // Active accounting depending on dataSource
  const currentAccounting: AccountingState =
    dataSource === 'live' ? liveAccounting : proofManifest.finalAccounting;

  return (
    <div className="space-y-8">
      {/* Transaction Appeal Tracker */}
      <TxAppealTracker />

      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl border border-lex-800 bg-gradient-to-b from-lex-900/90 to-lex-950 p-6 sm:p-8">
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="inline-flex items-center space-x-2 rounded-full bg-gold-500/10 border border-gold-500/30 px-3 py-1 text-xs font-semibold text-gold-400">
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>Autonomous Legal & Governance Policy Drift Sentinel</span>
            </div>

            {/* Mode Switcher Badge */}
            <div className="flex items-center space-x-2 bg-lex-950/80 border border-lex-800 rounded-lg p-1">
              <button
                onClick={() => setDataSource('live')}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  dataSource === 'live'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <Activity className="h-3 w-3" />
                <span>Live StudioNet RPC</span>
              </button>
              <button
                onClick={() => setDataSource('proof')}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  dataSource === 'proof'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <Database className="h-3 w-3" />
                <span>Recorded Proof Manifest</span>
              </button>
              <button
                onClick={fetchLiveData}
                disabled={loading}
                title="Refresh Live Data"
                className="p-1 text-gray-400 hover:text-white transition-colors"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-gold-400' : ''}`} />
              </button>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-white max-w-3xl">
            Autonomous Multi-Snapshot Governance & Legal Policy Drift Sentinel
          </h1>
          <p className="mt-3 text-sm sm:text-base text-gray-300 max-w-3xl leading-relaxed">
            LexDrift monitors open-source and governance charters against stealth material regressions.
            Decentralized GenLayer validators inspect immutable snapshots across time, verify strict
            verbatim substring containment proofs, and execute pull-credit bounty restitution without
            custodial intermediaries.
          </p>

          {/* 3-Contract Architecture Badges */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-lex-800/80 text-xs">
            <div className="rounded-lg bg-lex-900/60 p-3 border border-lex-800">
              <div className="flex items-center justify-between text-gold-400 font-semibold mb-1">
                <span>1. LexVault</span>
                <span className="font-mono text-[10px] text-gray-400">0x270B...456b</span>
              </div>
              <p className="text-gray-400 text-[11px]">
                Deterministic financial escrow, pull-payments, commit-reveal claim registry, and conservation invariant.
              </p>
            </div>

            <div className="rounded-lg bg-lex-900/60 p-3 border border-lex-800">
              <div className="flex items-center justify-between text-cyan-400 font-semibold mb-1">
                <span>2. CharterGate</span>
                <span className="font-mono text-[10px] text-gray-400">0xa7ae...c51c</span>
              </div>
              <p className="text-gray-400 text-[11px]">
                4-boolean rule admissibility filter: observable criterion, specific scope, falsifiability, and guarantee entailment.
              </p>
            </div>

            <div className="rounded-lg bg-lex-900/60 p-3 border border-lex-800">
              <div className="flex items-center justify-between text-emerald-400 font-semibold mb-1">
                <span>3. DriftAuditor</span>
                <span className="font-mono text-[10px] text-gray-400">0xB6C7...600d</span>
              </div>
              <p className="text-gray-400 text-[11px]">
                6-boolean audit engine: same subject, chronological order, granted rights, clause modification, and adverse shift.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Live Invariant Bar */}
      <InvariantBar
        accounting={currentAccounting}
        sourceLabel={dataSource === 'live' ? 'Live StudioNet RPC gen_call' : 'Recorded deploy/proof.json'}
      />

      {/* 5 Verified StudioNet Scenarios Matrix */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-lg font-serif font-bold text-white flex items-center space-x-2">
              <Scale className="h-5 w-5 text-gold-400" />
              <span>5 Verified StudioNet Acceptance Scenarios</span>
            </h2>
            <p className="text-xs text-gray-400">
              Cryptographically verified on GenLayer StudioNet (Chain ID 61999) with leader receipts & transaction hashes.
            </p>
          </div>
          <span className="rounded bg-emerald-950 px-2.5 py-1 text-xs font-semibold text-emerald-400 border border-emerald-700">
            5 / 5 Scenarios Passed (100%)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Case 1 */}
          <div className="rounded-xl border border-lex-800 bg-lex-900/70 p-4 hover:border-lex-700 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/30">
                  Case 1: CharterGate
                </span>
                <span className="rounded bg-crimson-950 px-2 py-0.5 text-[10px] font-semibold text-crimson-400 border border-crimson-800">
                  REJECTED_CHARTER
                </span>
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">
                Vague Covenant Rejection
              </h3>
              <p className="text-xs text-gray-400 mb-3">
                Intentionally vague covenant (&quot;act ethically in good faith&quot;) tested against CharterGate.
                Failed observable criterion & falsifiability predicates. Full 1,000 wei sponsor deposit refunded.
              </p>

              <div className="space-y-1.5 text-[11px] font-mono bg-lex-950/60 p-2.5 rounded-lg border border-lex-800 mb-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Charter ID:</span>
                  <span className="text-gray-300">#1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Sponsor Refund:</span>
                  <span className="text-emerald-400">1,000 wei credit</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Bounty on-chain:</span>
                  <span className="text-gray-400">0 wei</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-lex-800 flex items-center justify-between text-xs">
              <Link href="/charters/1" className="text-gold-400 hover:text-gold-300 flex items-center space-x-1 font-medium">
                <span>Inspect Charter</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
              <a
                href={`${EXPLORER_URL}/tx/0x4a19aa05930ab6412f553b89e5bb252006b60510aef7b73630c1ad98c434364e`}
                target="_blank"
                rel="noreferrer"
                className="text-gray-400 hover:text-white flex items-center space-x-1 font-mono text-[11px]"
              >
                <span>0x4a19...364e</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>
          </div>

          {/* Case 2 */}
          <div className="rounded-xl border border-lex-800 bg-lex-900/70 p-4 hover:border-lex-700 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="rounded bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold text-cyan-400 border border-cyan-500/30">
                  Case 2: DriftAuditor
                </span>
                <span className="rounded bg-amber-950 px-2 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-800">
                  BENIGN_REVISION
                </span>
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">
                Express.js Benign Revision
              </h3>
              <p className="text-xs text-gray-400 mb-3">
                Express v4.18.2 to v4.19.1 maintenance patch. DriftAuditor confirmed MIT terms preserved intact.
                Challenger bond forfeited to augment protected bounty from 1,000 to 1,500 wei.
              </p>

              <div className="space-y-1.5 text-[11px] font-mono bg-lex-950/60 p-2.5 rounded-lg border border-lex-800 mb-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Charter / Claim:</span>
                  <span className="text-gray-300">#2 / Claim #1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Charter Status:</span>
                  <span className="text-emerald-400 font-bold">ACTIVE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Augmented Bounty:</span>
                  <span className="text-gold-400 font-bold">1,500 wei</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-lex-800 flex items-center justify-between text-xs">
              <Link href="/charters/2" className="text-gold-400 hover:text-gold-300 flex items-center space-x-1 font-medium">
                <span>Inspect Charter</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
              <a
                href={`${EXPLORER_URL}/tx/0xc78d92edf79ee9602fbf6179dacc15c1cc03874d7089a87484a778de0b9ee81c`}
                target="_blank"
                rel="noreferrer"
                className="text-gray-400 hover:text-white flex items-center space-x-1 font-mono text-[11px]"
              >
                <span>0xc78d...e81c</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>
          </div>

          {/* Case 3 */}
          <div className="rounded-xl border border-lex-800 bg-lex-900/70 p-4 hover:border-lex-700 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="rounded bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold text-cyan-400 border border-cyan-500/30">
                  Case 3: Adversarial Guard
                </span>
                <span className="rounded bg-crimson-950 px-2 py-0.5 text-[10px] font-semibold text-crimson-400 border border-crimson-800">
                  REJECTED_EVIDENCE
                </span>
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">
                Adversarial Evidence Rejection
              </h3>
              <p className="text-xs text-gray-400 mb-3">
                Big List of Naughty Strings submitted as candidate evidence against Express charter.
                Fails subject-matter predicate. Challenger 500 wei bond transferred directly to sponsor credit.
              </p>

              <div className="space-y-1.5 text-[11px] font-mono bg-lex-950/60 p-2.5 rounded-lg border border-lex-800 mb-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Charter / Claim:</span>
                  <span className="text-gray-300">#2 / Claim #2</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Sponsor Restitution:</span>
                  <span className="text-emerald-400">+500 wei credit</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Closure Basis:</span>
                  <span className="text-gray-400 truncate">REJECTED_EVIDENCE...</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-lex-800 flex items-center justify-between text-xs">
              <Link href="/charters/2" className="text-gold-400 hover:text-gold-300 flex items-center space-x-1 font-medium">
                <span>Inspect Charter</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
              <a
                href={`${EXPLORER_URL}/tx/0xea986f71e3bdb77c50aaa735be07f172a14cd02870a6641a04a9ac22cc5df437`}
                target="_blank"
                rel="noreferrer"
                className="text-gray-400 hover:text-white flex items-center space-x-1 font-mono text-[11px]"
              >
                <span>0xea98...f437</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>
          </div>

          {/* Case 4 */}
          <div className="rounded-xl border border-lex-700 bg-lex-900/90 p-4 hover:border-gold-500/50 transition-all flex flex-col justify-between shadow-lg">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                  Case 4: Full Settlement
                </span>
                <span className="rounded bg-emerald-950 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-800">
                  SETTLED_MATERIAL_DRIFT
                </span>
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">
                Terraform MPL-2.0 to BSL-1.1 Shift
              </h3>
              <p className="text-xs text-gray-400 mb-3">
                Terraform v1.5.5 MPL-2.0 vs v1.6.0 BSL-1.1 license shift. 6/6 predicates verified true.
                Full 1,500 wei bounty paid to challenger via 2-step pull withdrawal (Withdrawal #1 Reconciled).
              </p>

              <div className="space-y-1.5 text-[11px] font-mono bg-lex-950/60 p-2.5 rounded-lg border border-lex-800 mb-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Charter / Claim:</span>
                  <span className="text-gray-300">#3 / Claim #3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Challenger Payout:</span>
                  <span className="text-emerald-400 font-bold">1,500 wei</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Withdrawal #1:</span>
                  <span className="text-cyan-400 font-bold">RECONCILED</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-lex-800 flex items-center justify-between text-xs">
              <Link href="/charters/3" className="text-gold-400 hover:text-gold-300 flex items-center space-x-1 font-medium">
                <span>Inspect Charter</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
              <a
                href={`${EXPLORER_URL}/tx/0x64d0bb875cc89f661f78f0ee3c31299948db84fb1fa17596a577672d68f25125`}
                target="_blank"
                rel="noreferrer"
                className="text-gray-400 hover:text-white flex items-center space-x-1 font-mono text-[11px]"
              >
                <span>0x64d0...5125</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>
          </div>

          {/* Case 5 */}
          <div className="rounded-xl border border-lex-800 bg-lex-900/70 p-4 hover:border-lex-700 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="rounded bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold text-purple-400 border border-purple-500/30">
                  Case 5: Timed Recovery
                </span>
                <span className="rounded bg-purple-950 px-2 py-0.5 text-[10px] font-semibold text-purple-400 border border-purple-800">
                  EXPIRED_UNATTESTED
                </span>
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">
                Stage Deadline Timeout Recovery
              </h3>
              <p className="text-xs text-gray-400 mb-3">
                Charter #4 opened but stage expired before worker attestation. Protected against permanent fund lockup.
                `expire_stage(&apos;CHARTER&apos;, 4)` safely returned 1,000 wei deposit to sponsor pull credit.
              </p>

              <div className="space-y-1.5 text-[11px] font-mono bg-lex-950/60 p-2.5 rounded-lg border border-lex-800 mb-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Charter ID:</span>
                  <span className="text-gray-300">#4</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Sponsor Refund:</span>
                  <span className="text-emerald-400 font-bold">1,000 wei credit</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span className="text-purple-400">EXPIRED_UNATTESTED</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-lex-800 flex items-center justify-between text-xs">
              <Link href="/charters/4" className="text-gold-400 hover:text-gold-300 flex items-center space-x-1 font-medium">
                <span>Inspect Charter</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
              <a
                href={`${EXPLORER_URL}/tx/0x0e4c3c928c387b955aa5b64eb9fcfe9bae91eeb53e0072eee3c363f37975accb`}
                target="_blank"
                rel="noreferrer"
                className="text-gray-400 hover:text-white flex items-center space-x-1 font-mono text-[11px]"
              >
                <span>0x0e4c...accb</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Protected Charter Registry */}
      <div className="rounded-xl border border-lex-800 bg-lex-900/60 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-serif font-bold text-white flex items-center space-x-2">
              <FileCode className="h-5 w-5 text-cyan-400" />
              <span>Protected Charter Registry</span>
            </h2>
            <p className="text-xs text-gray-400">
              Active, settled, and evaluated governance covenants registered in LexVault.
            </p>
          </div>
          <Link
            href="/charters/new"
            className="rounded-lg bg-gold-500/20 px-3 py-1.5 text-xs font-semibold text-gold-300 border border-gold-500/40 hover:bg-gold-500/30 transition-colors flex items-center space-x-1.5"
          >
            <span>+ Protect New Charter</span>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-lex-800 text-[11px] uppercase tracking-wider text-gray-400">
                <th className="py-2.5 pr-4">ID</th>
                <th className="py-2.5 px-4">Baseline Subject</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Protected Bounty</th>
                <th className="py-2.5 px-4">Sponsor</th>
                <th className="py-2.5 pl-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lex-800/60">
              <tr className="hover:bg-lex-850/50 transition-colors">
                <td className="py-3 pr-4 font-mono font-bold text-gray-300">#1</td>
                <td className="py-3 px-4">
                  <div className="font-semibold text-white">Terraform Community Ethics (Vague Test)</div>
                  <div className="font-mono text-[11px] text-gray-500 truncate max-w-xs">raw.githubusercontent.com/.../LICENSE</div>
                </td>
                <td className="py-3 px-4">
                  <span className="rounded bg-crimson-950 px-2 py-0.5 text-[10px] font-semibold text-crimson-400 border border-crimson-800">
                    REJECTED_CHARTER
                  </span>
                </td>
                <td className="py-3 px-4 font-mono text-gray-400">0 wei</td>
                <td className="py-3 px-4 font-mono text-gray-400">0xc130...60aC</td>
                <td className="py-3 pl-4 text-right">
                  <Link href="/charters/1" className="text-gold-400 hover:text-gold-300 font-medium">
                    Inspect &rarr;
                  </Link>
                </td>
              </tr>

              <tr className="hover:bg-lex-850/50 transition-colors">
                <td className="py-3 pr-4 font-mono font-bold text-gray-300">#2</td>
                <td className="py-3 px-4">
                  <div className="font-semibold text-white">Express.js MIT License Protection</div>
                  <div className="font-mono text-[11px] text-gray-500 truncate max-w-xs">raw.githubusercontent.com/expressjs/express/4.18.2/...</div>
                </td>
                <td className="py-3 px-4">
                  <span className="rounded bg-emerald-950 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-800">
                    ACTIVE
                  </span>
                </td>
                <td className="py-3 px-4 font-mono font-bold text-gold-400">1,500 wei</td>
                <td className="py-3 px-4 font-mono text-gray-400">0xc130...60aC</td>
                <td className="py-3 pl-4 text-right">
                  <Link href="/charters/2" className="text-gold-400 hover:text-gold-300 font-medium">
                    Inspect &rarr;
                  </Link>
                </td>
              </tr>

              <tr className="hover:bg-lex-850/50 transition-colors">
                <td className="py-3 pr-4 font-mono font-bold text-gray-300">#3</td>
                <td className="py-3 px-4">
                  <div className="font-semibold text-white">Terraform v1.5.5 MPL-2.0 License Charter</div>
                  <div className="font-mono text-[11px] text-gray-500 truncate max-w-xs">raw.githubusercontent.com/hashicorp/terraform/v1.5.5/LICENSE</div>
                </td>
                <td className="py-3 px-4">
                  <span className="rounded bg-cyan-950 px-2 py-0.5 text-[10px] font-semibold text-cyan-400 border border-cyan-800">
                    SETTLED_DRIFT
                  </span>
                </td>
                <td className="py-3 px-4 font-mono text-gray-400">0 wei (Paid Out)</td>
                <td className="py-3 px-4 font-mono text-gray-400">0xc130...60aC</td>
                <td className="py-3 pl-4 text-right">
                  <Link href="/charters/3" className="text-gold-400 hover:text-gold-300 font-medium">
                    Inspect &rarr;
                  </Link>
                </td>
              </tr>

              <tr className="hover:bg-lex-850/50 transition-colors">
                <td className="py-3 pr-4 font-mono font-bold text-gray-300">#4</td>
                <td className="py-3 px-4">
                  <div className="font-semibold text-white">Timed Charter (Timeout Recovery Test)</div>
                  <div className="font-mono text-[11px] text-gray-500 truncate max-w-xs">raw.githubusercontent.com/expressjs/express/4.18.2/...</div>
                </td>
                <td className="py-3 px-4">
                  <span className="rounded bg-purple-950 px-2 py-0.5 text-[10px] font-semibold text-purple-400 border border-purple-800">
                    EXPIRED_UNATTESTED
                  </span>
                </td>
                <td className="py-3 px-4 font-mono text-gray-400">0 wei (Refunded)</td>
                <td className="py-3 px-4 font-mono text-gray-400">0xc130...60aC</td>
                <td className="py-3 pl-4 text-right">
                  <Link href="/charters/4" className="text-gold-400 hover:text-gold-300 font-medium">
                    Inspect &rarr;
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
