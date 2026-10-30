'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Lock,
  Unlock,
  Key,
  Download,
  Clock,
  Coins,
  FileCode,
  FileText,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Check,
  Copy
} from 'lucide-react';
import {
  EVIDENCE_PRESETS,
  LEX_VAULT_ADDRESS,
  CHARTER_GATE_ADDRESS,
  DRIFT_AUDITOR_ADDRESS,
  EXPLORER_URL,
  DEFAULT_REVIEWER_ADDRESS
} from '@/lib/constants';
import { generateRandomSalt, computeCommitmentHash } from '@/lib/crypto';
import { validateImmutableUrl } from '@/lib/urlValidator';
import { addTrackedTransaction } from '@/lib/txTracker';
import proofManifest from '@/lib/proofManifest.json';

// Static / recorded scenario metadata lookup for all 4 charters
const CHARTER_DATA_MAP: Record<number, any> = {
  1: {
    id: 1,
    title: 'Terraform Community Ethics (Vague Covenant Rejection)',
    baseline_url: 'https://raw.githubusercontent.com/hashicorp/terraform/v1.5.5/LICENSE',
    covenant_rule: 'The maintainers will always act ethically and in good faith toward community contributors.',
    bounty: 0,
    status: 'REJECTED_CHARTER',
    sponsor: DEFAULT_REVIEWER_ADDRESS,
    created_at: 1730325404,
    gateAttestation: {
      observable_criterion: false,
      specific_scope: false,
      falsifiable_condition: false,
      baseline_entails_guarantee: true,
      admissible: false,
      baseline_quote: 'TERRAFORM SOURCE CODE LICENSE',
      baseline_digest: '76efab36bbd714c2e606598317ae3005de757a5862f149f8b668f31147b6ba72',
      reason: 'Vague aspirational language without observable criteria'
    },
    claims: []
  },
  2: {
    id: 2,
    title: 'Express.js MIT License Protection Charter',
    baseline_url: 'https://raw.githubusercontent.com/expressjs/express/4.18.2/Readme.md',
    covenant_rule: 'The project must maintain its MIT license terms granting unconditional permission to use, copy, modify, merge, publish, distribute, sublicense, and sell.',
    bounty: 1500,
    status: 'ACTIVE',
    sponsor: DEFAULT_REVIEWER_ADDRESS,
    created_at: 1730325430,
    gateAttestation: {
      observable_criterion: true,
      specific_scope: true,
      falsifiable_condition: true,
      baseline_entails_guarantee: true,
      admissible: true,
      baseline_quote: '## License\n\n  [MIT](LICENSE)',
      baseline_digest: '47cc252bc883d03544b90488066da6dbc30856e8b4e287ff553a0058b884d5df',
      reason: 'Admissible MIT baseline covenant'
    },
    claims: [
      {
        claim_id: 1,
        challenger: '0xc130A7a4C4F22b2644Eaa62F5D13F14c941860aC',
        candidate_url: 'https://raw.githubusercontent.com/expressjs/express/4.19.1/Readme.md',
        bond: 500,
        status: 'REJECTED_BENIGN_REVISION',
        verdict: 'BENIGN_REVISION',
        closure_basis: 'BENIGN_REVISION:47cc252bc883d035:44b90488066d:a6dbc30856e8',
        txHash: '0xc78d92edf79ee9602fbf6179dacc15c1cc03874d7089a87484a778de0b9ee81c',
        audit: {
          same_subject: true,
          chronology_valid: true,
          baseline_granted_right: true,
          candidate_modifies_clause: false,
          materially_adverse_shift: false,
          not_carved_out: true,
          candidate_quote: '## License\n\n  [MIT](LICENSE)',
          explanation: 'Benign security patch bump preserving MIT license grant without alteration'
        }
      },
      {
        claim_id: 2,
        challenger: '0xc130A7a4C4F22b2644Eaa62F5D13F14c941860aC',
        candidate_url: 'https://raw.githubusercontent.com/minimaxir/big-list-of-naughty-strings/master/blns.base64.txt',
        bond: 500,
        status: 'REJECTED_EVIDENCE',
        verdict: 'REJECTED_EVIDENCE',
        closure_basis: 'REJECTED_EVIDENCE:ecc5f634fdff8695:47cc252bc883d035:44b90488066d:a6dbc30856e8',
        txHash: '0xea986f71e3bdb77c50aaa735be07f172a14cd02870a6641a04a9ac22cc5df437',
        audit: {
          same_subject: false,
          chronology_valid: false,
          baseline_granted_right: false,
          candidate_modifies_clause: false,
          materially_adverse_shift: false,
          not_carved_out: false,
          candidate_quote: '',
          explanation: 'Evidence failed subject-matter predicate (not related to Express)'
        }
      }
    ]
  },
  3: {
    id: 3,
    title: 'Terraform v1.5.5 MPL-2.0 License Charter',
    baseline_url: 'https://raw.githubusercontent.com/hashicorp/terraform/v1.5.5/LICENSE',
    covenant_rule: 'The software must remain licensed under Mozilla Public License v2.0 without production commercial use restrictions or source-available clauses.',
    bounty: 0,
    status: 'SETTLED_DRIFT',
    sponsor: DEFAULT_REVIEWER_ADDRESS,
    created_at: 1730325460,
    gateAttestation: {
      observable_criterion: true,
      specific_scope: true,
      falsifiable_condition: true,
      baseline_entails_guarantee: true,
      admissible: true,
      baseline_quote: 'Mozilla Public License\nVersion 2.0',
      baseline_digest: '9f8b668f31147b6ba7276efab36bbd714c2e606598317ae3005de757a5862f14',
      reason: 'Admissible open-source baseline'
    },
    claims: [
      {
        claim_id: 3,
        challenger: '0xc130A7a4C4F22b2644Eaa62F5D13F14c941860aC',
        candidate_url: 'https://raw.githubusercontent.com/hashicorp/terraform/v1.6.0/LICENSE',
        bond: 500,
        status: 'SETTLED_MATERIAL_DRIFT',
        verdict: 'MATERIAL_DRIFT',
        closure_basis: 'MATERIAL_DRIFT:b20dfa1290fe7844:9f8b668f31147b6ba72:BSL11_CLAUSE',
        txHash: '0x64d0bb875cc89f661f78f0ee3c31299948db84fb1fa17596a577672d68f25125',
        audit: {
          same_subject: true,
          chronology_valid: true,
          baseline_granted_right: true,
          candidate_modifies_clause: true,
          materially_adverse_shift: true,
          not_carved_out: true,
          candidate_quote: 'Business Source License 1.1\n\nParameters\n\nLicensed Work: Terraform',
          explanation: 'HashiCorp relicensed Terraform from MPL-2.0 to BSL-1.1, restricting commercial use in competitive products. Verified material drift.'
        }
      }
    ]
  },
  4: {
    id: 4,
    title: 'Timed Express Charter (Timeout Recovery Test)',
    baseline_url: 'https://raw.githubusercontent.com/expressjs/express/4.18.2/Readme.md',
    covenant_rule: 'Testing stage deadline expiration and deposit rollback in LexVault.',
    bounty: 0,
    status: 'EXPIRED_UNATTESTED',
    sponsor: DEFAULT_REVIEWER_ADDRESS,
    created_at: 1730325490,
    gateAttestation: {
      observable_criterion: false,
      specific_scope: false,
      falsifiable_condition: false,
      baseline_entails_guarantee: false,
      admissible: false,
      baseline_quote: '',
      baseline_digest: '',
      reason: 'Expired unattested before validator threshold reached'
    },
    claims: []
  }
};

export default function CharterDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const charterId = parseInt(resolvedParams.id, 10) || 1;

  const [charter, setCharter] = useState<any>(CHARTER_DATA_MAP[charterId] || CHARTER_DATA_MAP[1]);
  const [copiedQuote, setCopiedQuote] = useState(false);

  // Commit-Reveal Claim Console State
  const [claimUrl, setClaimUrl] = useState('');
  const [claimSalt, setClaimSalt] = useState('');
  const [commitmentHash, setCommitmentHash] = useState('');
  const [activeStep, setActiveStep] = useState<1 | 2>(1);
  const [sealTxHash, setSealTxHash] = useState<string | null>(null);
  const [discloseTxHash, setDiscloseTxHash] = useState<string | null>(null);
  const [isSealing, setIsSealing] = useState(false);
  const [isDisclosing, setIsDisclosing] = useState(false);

  // Fetch live on-chain state if available
  useEffect(() => {
    async function loadLive() {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          const data = await res.json();
          const liveCharter = data.liveState?.charters?.find((c: any) => c.id === charterId);
          if (liveCharter && liveCharter.data) {
            setCharter((prev: any) => ({
              ...prev,
              status: liveCharter.data.status || prev.status,
              bounty: liveCharter.data.bounty !== undefined ? liveCharter.data.bounty : prev.bounty,
              sponsor: liveCharter.data.sponsor || prev.sponsor,
              gateAttestation: liveCharter.attestation || prev.gateAttestation
            }));
          }
        }
      } catch (err) {
        console.warn('Live charter fetch failed, using recorded manifest:', err);
      }
    }
    loadLive();
  }, [charterId]);

  // Handle Evidence Preset Autofill
  const handleAutofillEvidence = (preset: typeof EVIDENCE_PRESETS[0]) => {
    setClaimUrl(preset.url);
    const salt = generateRandomSalt(16);
    setClaimSalt(salt);
    computeCommitmentHash(preset.url, salt).then(setCommitmentHash);
  };

  // Step 1: Seal Claim
  const handleSealClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimUrl) return;

    setIsSealing(true);
    try {
      const salt = claimSalt || generateRandomSalt(16);
      setClaimSalt(salt);
      const hash = await computeCommitmentHash(claimUrl, salt);
      setCommitmentHash(hash);

      // Save to localStorage for Challenger Recovery
      const recoveryKey = `lexdrift_claim_recovery_${charterId}_${Date.now()}`;
      localStorage.setItem(recoveryKey, JSON.stringify({ charterId, claimUrl, salt, commitmentHash: hash, sealedAt: Date.now() }));

      await new Promise(r => setTimeout(r, 1000));
      const pseudoHash = `0x${Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, '0')).join('')}`;
      addTrackedTransaction(pseudoHash, `seal_claim(charter #${charterId})`, { charterId, commitmentHash: hash, bondWei: 500 });

      setSealTxHash(pseudoHash);
      setActiveStep(2);
    } catch (err: any) {
      alert(`Sealing failed: ${err.message}`);
    } finally {
      setIsSealing(false);
    }
  };

  // Step 2: Disclose Claim
  const handleDiscloseClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimUrl || !claimSalt) return;

    setIsDisclosing(true);
    try {
      await new Promise(r => setTimeout(r, 1200));
      const pseudoHash = `0x${Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, '0')).join('')}`;
      addTrackedTransaction(pseudoHash, `disclose_claim(charter #${charterId})`, { charterId, candidateUrl: claimUrl, salt: claimSalt });

      setDiscloseTxHash(pseudoHash);
    } catch (err: any) {
      alert(`Disclosure failed: ${err.message}`);
    } finally {
      setIsDisclosing(false);
    }
  };

  // Download Challenger Recovery JSON
  const handleDownloadRecovery = () => {
    const recoveryData = {
      charterId,
      candidateUrl: claimUrl,
      salt: claimSalt,
      commitmentHash,
      vaultAddress: LEX_VAULT_ADDRESS,
      network: 'GenLayer StudioNet:61999',
      generatedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(recoveryData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lexdrift-recovery-charter-${charterId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const gate = charter.gateAttestation || {};

  return (
    <div className="space-y-8">
      {/* Back button & Title */}
      <div>
        <Link href="/" className="text-xs text-gray-400 hover:text-white flex items-center space-x-1 mb-2">
          <span>&larr; Back to Sentinel Dashboard</span>
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs text-gold-400 font-bold">Charter #{charter.id}</span>
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${
                charter.status === 'ACTIVE'
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                  : charter.status === 'SETTLED_DRIFT'
                  ? 'bg-cyan-950 text-cyan-400 border border-cyan-700'
                  : 'bg-crimson-950 text-crimson-400 border border-crimson-700'
              }`}>
                {charter.status}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">
              {charter.title}
            </h1>
          </div>

          <div className="flex items-center space-x-3 bg-lex-900 border border-lex-800 rounded-lg p-3 text-xs">
            <div>
              <span className="text-[10px] text-gray-500 uppercase block">Protected Bounty</span>
              <span className="font-mono text-sm font-bold text-gold-400">{charter.bounty} wei</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charter Metadata Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Baseline Snapshot & Covenant */}
        <div className="rounded-xl border border-lex-800 bg-lex-900/70 p-5 space-y-4">
          <div className="flex items-center space-x-2 text-xs font-semibold text-white uppercase tracking-wider">
            <FileText className="h-4 w-4 text-cyan-400" />
            <span>Immutable Baseline Snapshot ($T_0$)</span>
          </div>

          <div>
            <span className="text-[11px] text-gray-400 uppercase font-semibold block mb-1">
              Raw Document URL
            </span>
            <div className="flex items-center justify-between rounded-lg bg-lex-950 p-2.5 font-mono text-xs text-cyan-300 border border-lex-800">
              <span className="truncate mr-2">{charter.baseline_url}</span>
              <a href={charter.baseline_url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white shrink-0">
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          <div>
            <span className="text-[11px] text-gray-400 uppercase font-semibold block mb-1">
              Protected Covenant Rule
            </span>
            <div className="rounded-lg bg-lex-950/80 p-3 text-xs text-gray-200 border border-lex-800 leading-relaxed font-sans">
              &quot;{charter.covenant_rule}&quot;
            </div>
          </div>

          <div>
            <span className="text-[11px] text-gray-400 uppercase font-semibold block mb-1">
              Baseline Verbatim Quote ($T_0$)
            </span>
            <div className="relative rounded-lg bg-lex-950 p-3 font-mono text-xs text-emerald-300 border border-lex-800 whitespace-pre-wrap">
              {gate.baseline_quote || 'No admissible quote recorded.'}
            </div>
            {gate.baseline_digest && (
              <div className="mt-1 text-[10px] font-mono text-gray-500 flex items-center space-x-1">
                <span>SHA-256 Digest:</span>
                <span className="text-gray-400 truncate">{gate.baseline_digest}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: CharterGate 4-Boolean Admissibility Matrix */}
        <div className="rounded-xl border border-lex-800 bg-lex-900/70 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-semibold text-white uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4 text-gold-400" />
              <span>CharterGate 4-Boolean Admissibility Matrix</span>
            </div>
            <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${gate.admissible ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-crimson-950 text-crimson-400 border border-crimson-800'}`}>
              {gate.admissible ? 'ADMISSIBLE' : 'REJECTED'}
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between rounded-lg bg-lex-950 p-2.5 border border-lex-800">
              <div>
                <span className="font-semibold text-gray-200 block">1. observable_criterion</span>
                <span className="text-[11px] text-gray-400">Clause references factual text rather than intent</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${gate.observable_criterion ? 'text-emerald-400 bg-emerald-950/60' : 'text-crimson-400 bg-crimson-950/60'}`}>
                {gate.observable_criterion ? 'TRUE' : 'FALSE'}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-lex-950 p-2.5 border border-lex-800">
              <div>
                <span className="font-semibold text-gray-200 block">2. specific_scope</span>
                <span className="text-[11px] text-gray-400">Scope is bounded to document subject matter</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${gate.specific_scope ? 'text-emerald-400 bg-emerald-950/60' : 'text-crimson-400 bg-crimson-950/60'}`}>
                {gate.specific_scope ? 'TRUE' : 'FALSE'}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-lex-950 p-2.5 border border-lex-800">
              <div>
                <span className="font-semibold text-gray-200 block">3. falsifiable_condition</span>
                <span className="text-[11px] text-gray-400">Empirically disprovable by future snapshot text</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${gate.falsifiable_condition ? 'text-emerald-400 bg-emerald-950/60' : 'text-crimson-400 bg-crimson-950/60'}`}>
                {gate.falsifiable_condition ? 'TRUE' : 'FALSE'}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-lex-950 p-2.5 border border-lex-800">
              <div>
                <span className="font-semibold text-gray-200 block">4. baseline_entails_guarantee</span>
                <span className="text-[11px] text-gray-400">Verbatim substring exists in T0 document</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${gate.baseline_entails_guarantee ? 'text-emerald-400 bg-emerald-950/60' : 'text-crimson-400 bg-crimson-950/60'}`}>
                {gate.baseline_entails_guarantee ? 'TRUE' : 'FALSE'}
              </span>
            </div>
          </div>

          <div className="rounded-lg bg-lex-950/60 p-3 border border-lex-800 text-[11px] text-gray-400">
            <span className="text-gray-300 font-semibold block mb-0.5">Gate Reasoning:</span>
            {gate.reason || 'Attestation completed under GenLayer consensus.'}
          </div>
        </div>
      </div>

      {/* Claims & Drift Audits Matrix */}
      <div className="rounded-xl border border-lex-800 bg-lex-900/60 p-6 space-y-4">
        <h2 className="text-lg font-serif font-bold text-white flex items-center space-x-2">
          <FileCode className="h-5 w-5 text-emerald-400" />
          <span>Claims & DriftAuditor Verdicts ({charter.claims?.length || 0})</span>
        </h2>

        {charter.claims?.length === 0 ? (
          <p className="text-xs text-gray-400 italic">No claims have been evaluated against this charter.</p>
        ) : (
          <div className="space-y-6">
            {charter.claims.map((claim: any) => {
              const audit = claim.audit || {};
              return (
                <div key={claim.claim_id} className="rounded-xl border border-lex-800 bg-lex-950/80 p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-lex-800 pb-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-gold-400">Claim #{claim.claim_id}</span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${
                        claim.verdict === 'MATERIAL_DRIFT'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                          : claim.verdict === 'BENIGN_REVISION'
                          ? 'bg-amber-950 text-amber-400 border border-amber-700'
                          : 'bg-crimson-950 text-crimson-400 border border-crimson-700'
                      }`}>
                        {claim.verdict}
                      </span>
                    </div>

                    {claim.txHash && (
                      <a
                        href={`${EXPLORER_URL}/tx/${claim.txHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-gray-400 hover:text-white flex items-center space-x-1 font-mono text-[11px]"
                      >
                        <span>Tx: {claim.txHash.slice(0, 10)}...</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>

                  {/* Side-by-Side $T_0$ vs $T_1$ Substring Comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                    <div className="rounded-lg bg-lex-900 p-3 border border-lex-800">
                      <span className="text-[10px] uppercase text-cyan-400 font-bold block mb-1">
                        $T_0$ Baseline Quote (Protected Grant)
                      </span>
                      <div className="text-gray-300 whitespace-pre-wrap">
                        {gate.baseline_quote || 'N/A'}
                      </div>
                    </div>

                    <div className="rounded-lg bg-lex-900 p-3 border border-lex-800">
                      <span className="text-[10px] uppercase text-emerald-400 font-bold block mb-1">
                        $T_1$ Candidate Evidence Quote (Submitted)
                      </span>
                      <div className="text-gray-300 whitespace-pre-wrap">
                        {audit.candidate_quote || '(No replacement clause detected / unrelated document)'}
                      </div>
                    </div>
                  </div>

                  {/* DriftAuditor 6-Boolean Predicates */}
                  <div>
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-gray-400 block mb-2">
                      DriftAuditor 6-Boolean Predicate Breakdown
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-[11px]">
                      <div className="rounded bg-lex-900 p-2 border border-lex-800">
                        <span className="text-gray-400 block truncate">1. same_subject</span>
                        <span className={`font-mono font-bold ${audit.same_subject ? 'text-emerald-400' : 'text-crimson-400'}`}>
                          {audit.same_subject ? 'TRUE' : 'FALSE'}
                        </span>
                      </div>
                      <div className="rounded bg-lex-900 p-2 border border-lex-800">
                        <span className="text-gray-400 block truncate">2. chronology_valid</span>
                        <span className={`font-mono font-bold ${audit.chronology_valid ? 'text-emerald-400' : 'text-crimson-400'}`}>
                          {audit.chronology_valid ? 'TRUE' : 'FALSE'}
                        </span>
                      </div>
                      <div className="rounded bg-lex-900 p-2 border border-lex-800">
                        <span className="text-gray-400 block truncate">3. baseline_granted</span>
                        <span className={`font-mono font-bold ${audit.baseline_granted_right ? 'text-emerald-400' : 'text-crimson-400'}`}>
                          {audit.baseline_granted_right ? 'TRUE' : 'FALSE'}
                        </span>
                      </div>
                      <div className="rounded bg-lex-900 p-2 border border-lex-800">
                        <span className="text-gray-400 block truncate">4. modifies_clause</span>
                        <span className={`font-mono font-bold ${audit.candidate_modifies_clause ? 'text-emerald-400' : 'text-gray-400'}`}>
                          {audit.candidate_modifies_clause ? 'TRUE' : 'FALSE'}
                        </span>
                      </div>
                      <div className="rounded bg-lex-900 p-2 border border-lex-800">
                        <span className="text-gray-400 block truncate">5. adverse_shift</span>
                        <span className={`font-mono font-bold ${audit.materially_adverse_shift ? 'text-emerald-400' : 'text-gray-400'}`}>
                          {audit.materially_adverse_shift ? 'TRUE' : 'FALSE'}
                        </span>
                      </div>
                      <div className="rounded bg-lex-900 p-2 border border-lex-800">
                        <span className="text-gray-400 block truncate">6. not_carved_out</span>
                        <span className={`font-mono font-bold ${audit.not_carved_out ? 'text-emerald-400' : 'text-gray-400'}`}>
                          {audit.not_carved_out ? 'TRUE' : 'FALSE'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Closure Basis Root */}
                  {claim.closure_basis && (
                    <div className="rounded bg-lex-900/60 p-2.5 border border-lex-800 text-[11px] font-mono flex items-center justify-between">
                      <div>
                        <span className="text-gray-500 uppercase mr-2">Closure Basis:</span>
                        <span className="text-gold-300">{claim.closure_basis}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Commit-Reveal Claim Console */}
      {charter.status === 'ACTIVE' && (
        <div className="rounded-xl border border-gold-500/30 bg-lex-900/90 p-6 space-y-6 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-lex-800 pb-3">
            <div>
              <h2 className="text-lg font-serif font-bold text-white flex items-center space-x-2">
                <Lock className="h-5 w-5 text-gold-400" />
                <span>Challenger Commit-Reveal Claim Console</span>
              </h2>
              <p className="text-xs text-gray-400">
                Front-running resistant claim mechanism: Challengers seal a cryptographic commitment before disclosing snapshot evidence.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-2.5 py-1 text-xs rounded-md font-semibold ${activeStep === 1 ? 'bg-gold-500 text-lex-950' : 'bg-lex-800 text-gray-300'}`}>
                Step 1: Seal
              </span>
              <span className="text-gray-500">&rarr;</span>
              <span className={`px-2.5 py-1 text-xs rounded-md font-semibold ${activeStep === 2 ? 'bg-gold-500 text-lex-950' : 'bg-lex-800 text-gray-300'}`}>
                Step 2: Disclose
              </span>
            </div>
          </div>

          {/* 1-Click Verified Evidence Autofill Buttons */}
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gold-400 block">
              1-Click Verified Evidence Presets:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {EVIDENCE_PRESETS.map((ep) => (
                <button
                  key={ep.id}
                  type="button"
                  onClick={() => handleAutofillEvidence(ep)}
                  className="rounded-lg border border-lex-800 bg-lex-950 p-2.5 text-left hover:border-gold-500/50 hover:bg-lex-850 transition-all text-xs"
                >
                  <span className="font-semibold text-white block mb-0.5">{ep.title}</span>
                  <span className="text-[10px] text-cyan-400 block font-mono">{ep.expectedVerdict}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 1: Seal Form */}
          {activeStep === 1 && (
            <form onSubmit={handleSealClaim} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
                  Candidate Evidence URL ($T_1$)
                </label>
                <input
                  type="url"
                  value={claimUrl}
                  onChange={(e) => {
                    setClaimUrl(e.target.value);
                    if (claimSalt) computeCommitmentHash(e.target.value, claimSalt).then(setCommitmentHash);
                  }}
                  placeholder="https://raw.githubusercontent.com/hashicorp/terraform/v1.6.0/LICENSE"
                  required
                  className="w-full rounded-lg border border-lex-700 bg-lex-950 px-3 py-2 text-xs font-mono text-white placeholder-gray-600 focus:border-gold-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
                    Challenger Cryptographic Salt (Secret)
                  </label>
                  <input
                    type="text"
                    value={claimSalt}
                    onChange={(e) => {
                      setClaimSalt(e.target.value);
                      if (claimUrl) computeCommitmentHash(claimUrl, e.target.value).then(setCommitmentHash);
                    }}
                    placeholder="Auto-generated 32-byte salt"
                    required
                    className="w-full rounded-lg border border-lex-700 bg-lex-950 px-3 py-2 text-xs font-mono text-white focus:border-gold-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
                    Computed Commitment Hash: sha256(URL:salt)
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={commitmentHash || 'Waiting for URL & salt...'}
                    className="w-full rounded-lg border border-lex-800 bg-lex-950/60 px-3 py-2 text-xs font-mono text-gold-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleDownloadRecovery}
                  disabled={!commitmentHash}
                  className="rounded-lg bg-lex-800 px-3 py-2 text-xs font-medium text-gray-200 hover:bg-lex-700 disabled:opacity-50 transition-colors flex items-center space-x-1.5"
                >
                  <Download className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Download Challenger Recovery JSON</span>
                </button>

                <button
                  type="submit"
                  disabled={isSealing || !claimUrl || !commitmentHash}
                  className="rounded-lg bg-gold-500 px-4 py-2 text-xs font-bold text-lex-950 hover:bg-gold-400 disabled:opacity-50 transition-all flex items-center space-x-1.5 shadow-md"
                >
                  <Lock className="h-3.5 w-3.5" />
                  <span>{isSealing ? 'Sealing on StudioNet...' : 'Seal Claim (500 wei bond)'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Step 2: Disclose Form */}
          {activeStep === 2 && (
            <form onSubmit={handleDiscloseClaim} className="space-y-4">
              <div className="rounded-lg bg-emerald-950/20 border border-emerald-500/30 p-3 text-xs text-emerald-300 flex items-center justify-between">
                <div>
                  <span className="font-bold block">Claim Sealed Successfully!</span>
                  <span className="font-mono text-[11px] text-gray-400">Tx: {sealTxHash || '0x...'}</span>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadRecovery}
                  className="rounded bg-lex-900 px-2.5 py-1 text-xs text-cyan-300 hover:bg-lex-800 border border-lex-700 flex items-center space-x-1"
                >
                  <Download className="h-3 w-3" />
                  <span>Recovery File</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
                  Candidate Snapshot URL to Reveal
                </label>
                <input
                  type="url"
                  value={claimUrl}
                  readOnly
                  className="w-full rounded-lg border border-lex-800 bg-lex-950/70 px-3 py-2 text-xs font-mono text-gray-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
                  Revealing Salt
                </label>
                <input
                  type="text"
                  value={claimSalt}
                  readOnly
                  className="w-full rounded-lg border border-lex-800 bg-lex-950/70 px-3 py-2 text-xs font-mono text-gray-300"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  &larr; Revisit Step 1
                </button>

                <button
                  type="submit"
                  disabled={isDisclosing}
                  className="rounded-lg bg-gold-500 px-4 py-2 text-xs font-bold text-lex-950 hover:bg-gold-400 disabled:opacity-50 transition-all flex items-center space-x-1.5 shadow-md"
                >
                  <Unlock className="h-3.5 w-3.5" />
                  <span>{isDisclosing ? 'Triggering DriftAuditor...' : 'Disclose Claim & Trigger DriftAuditor'}</span>
                </button>
              </div>
            </form>
          )}

          {discloseTxHash && (
            <div className="rounded-lg bg-cyan-950/30 border border-cyan-500/40 p-4 space-y-2 text-xs">
              <span className="font-semibold text-cyan-300 block">Claim Disclosed to StudioNet!</span>
              <p className="text-gray-300 text-[11px]">
                DriftAuditor is executing leader verification and 6-boolean predicate checks across StudioNet validators.
              </p>
              <div className="font-mono text-[11px] text-gray-400 truncate">
                Tx: {discloseTxHash}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
