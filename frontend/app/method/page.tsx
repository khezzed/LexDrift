import Link from 'next/link';
import {
  BookOpen,
  ShieldCheck,
  Scale,
  Layers,
  Lock,
  Clock,
  Coins,
  CheckCircle2,
  ExternalLink,
  Terminal,
  FileText,
  AlertCircle
} from 'lucide-react';
import {
  LEX_VAULT_ADDRESS,
  CHARTER_GATE_ADDRESS,
  DRIFT_AUDITOR_ADDRESS,
  EXPLORER_URL
} from '@/lib/constants';
import proofManifest from '@/lib/proofManifest.json';

export default function MethodPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div>
        <Link href="/" className="text-xs text-gray-400 hover:text-white flex items-center space-x-1 mb-2">
          <span>&larr; Back to Sentinel Dashboard</span>
        </Link>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white flex items-center space-x-3">
          <BookOpen className="h-8 w-8 text-gold-400" />
          <span>LexDrift Protocol Specification & Judge Guide</span>
        </h1>
        <p className="mt-2 text-sm text-gray-400 leading-relaxed">
          Technical architecture, mathematical conservation invariants, and non-deterministic consensus
          methodology powering autonomous governance policy drift detection on GenLayer StudioNet.
        </p>
      </div>

      {/* Section 1: 3-Contract Architecture & Separation of Concerns */}
      <section className="rounded-xl border border-lex-800 bg-lex-900/60 p-6 space-y-4">
        <h2 className="text-xl font-serif font-bold text-white flex items-center space-x-2">
          <Layers className="h-5 w-5 text-gold-400" />
          <span>1. Architecture & 3-Contract Separation of Concerns</span>
        </h2>
        <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
          LexDrift strictly separates financial custody from AI non-deterministic consensus to ensure
          impeccable security and formal verifiability:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs">
          <div className="rounded-lg bg-lex-950 p-4 border border-lex-800">
            <div className="font-bold text-gold-400 mb-1">LexVault</div>
            <div className="font-mono text-[10px] text-gray-500 mb-2 truncate">{LEX_VAULT_ADDRESS}</div>
            <p className="text-gray-400 leading-relaxed">
              <strong>Deterministic Accounting:</strong> Holds all native funds. Manages pull-payment credits,
              commit-reveal claim lifecycle, and enforces the strict mathematical conservation invariant:
              <br />
              <code className="text-[11px] text-emerald-400 mt-1 block font-mono">
                escrow + credits + pending == TVL
              </code>
            </p>
          </div>

          <div className="rounded-lg bg-lex-950 p-4 border border-lex-800">
            <div className="font-bold text-cyan-400 mb-1">CharterGate</div>
            <div className="font-mono text-[10px] text-gray-500 mb-2 truncate">{CHARTER_GATE_ADDRESS}</div>
            <p className="text-gray-400 leading-relaxed">
              <strong>Admissibility Filter:</strong> Autonomous worker contract that fetches the baseline ($T_0$),
              hashes bounded content, and evaluates the 4-boolean rule admissibility matrix before any bounty is locked.
            </p>
          </div>

          <div className="rounded-lg bg-lex-950 p-4 border border-lex-800">
            <div className="font-bold text-emerald-400 mb-1">DriftAuditor</div>
            <div className="font-mono text-[10px] text-gray-500 mb-2 truncate">{DRIFT_AUDITOR_ADDRESS}</div>
            <p className="text-gray-400 leading-relaxed">
              <strong>Audit Engine:</strong> Multi-snapshot chronology analyzer. Evaluates the 6-boolean predicate
              matrix, extracts verbatim substring proofs, and certifies material drift vs benign updates.
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-lex-950/80 p-3 text-xs text-gray-400 border border-lex-800 mt-2">
          <span className="text-gold-400 font-semibold block mb-0.5">Two-Phase Circular Bootstrap:</span>
          In GenLayer, contracts reference each other during callbacks. To avoid uninitialized dependencies,
          LexVault is deployed first with an empty configuration, followed by CharterGate and DriftAuditor,
          which are then linked into LexVault via a single atomic <code>configure(gate, auditor)</code> transaction.
        </div>
      </section>

      {/* Section 2: Immutable Snapshots & Zero Live-Page Drift */}
      <section className="rounded-xl border border-lex-800 bg-lex-900/60 p-6 space-y-4">
        <h2 className="text-xl font-serif font-bold text-white flex items-center space-x-2">
          <Lock className="h-5 w-5 text-cyan-400" />
          <span>2. Cryptographic Immutability: Eliminating Live-Page Drift</span>
        </h2>
        <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
          Decentralized consensus requires that every validator fetching an external resource observes
          the exact same bytes. LexDrift strictly forbids ephemeral or mutable endpoints (e.g. <code>github.com/.../main</code>).
          The protocol allowlist accepts only 3 cryptographically pinned snapshot formats:
        </p>

        <div className="space-y-2.5 text-xs font-mono">
          <div className="rounded-lg bg-lex-950 p-3 border border-lex-800">
            <span className="text-gold-400 font-bold block mb-0.5">1. Raw GitHub Pinned Commit (40-hex SHA or Tag)</span>
            <span className="text-gray-300">https://raw.githubusercontent.com/:org/:repo/:sha40/:path</span>
            <p className="text-gray-500 font-sans text-[11px] mt-1">Git commit trees are content-addressed and cryptographically tamper-evident.</p>
          </div>

          <div className="rounded-lg bg-lex-950 p-3 border border-lex-800">
            <span className="text-cyan-400 font-bold block mb-0.5">2. Wikipedia Immutable Revision (oldid)</span>
            <span className="text-gray-300">https://:lang.wikipedia.org/w/index.php?title=:page&oldid=:revision_id</span>
            <p className="text-gray-500 font-sans text-[11px] mt-1">Permanently archived MediaWiki revision ID immutable across edits.</p>
          </div>

          <div className="rounded-lg bg-lex-950 p-3 border border-lex-800">
            <span className="text-emerald-400 font-bold block mb-0.5">3. Internet Archive Wayback Machine (TIMESTAMPid_)</span>
            <span className="text-gray-300">https://web.archive.org/web/:14digits_timestampid_/:target_url</span>
            <p className="text-gray-500 font-sans text-[11px] mt-1">The <code>id_</code> flag returns pristine verbatim bytes without Wayback HTML injection.</p>
          </div>
        </div>
      </section>

      {/* Section 3: The 4-Boolean & 6-Boolean Matrices */}
      <section className="rounded-xl border border-lex-800 bg-lex-900/60 p-6 space-y-4">
        <h2 className="text-xl font-serif font-bold text-white flex items-center space-x-2">
          <Scale className="h-5 w-5 text-emerald-400" />
          <span>3. Boolean Predicate Matrices & Verbatim Substring Proofs</span>
        </h2>
        <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
          GenLayer Intelligent Contracts replace subjective opinions with structured deterministic boolean matrices
          evaluated during validator leader-follower consensus.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* CharterGate 4-Boolean */}
          <div className="rounded-lg bg-lex-950 p-4 border border-lex-800 space-y-2">
            <div className="font-bold text-gold-400 border-b border-lex-800 pb-1">
              CharterGate Admissibility (4 Booleans)
            </div>
            <ul className="space-y-1.5 text-gray-300">
              <li>&bull; <code className="text-cyan-300 font-mono">observable_criterion</code>: Empirical text, not vague intent.</li>
              <li>&bull; <code className="text-cyan-300 font-mono">specific_scope</code>: Bounded within subject scope.</li>
              <li>&bull; <code className="text-cyan-300 font-mono">falsifiable_condition</code>: Disprovable by future text.</li>
              <li>&bull; <code className="text-cyan-300 font-mono">baseline_entails_guarantee</code>: Verbatim $T_0$ substring verified.</li>
            </ul>
          </div>

          {/* DriftAuditor 6-Boolean */}
          <div className="rounded-lg bg-lex-950 p-4 border border-lex-800 space-y-2">
            <div className="font-bold text-emerald-400 border-b border-lex-800 pb-1">
              DriftAuditor Evaluation (6 Booleans)
            </div>
            <ul className="space-y-1.5 text-gray-300">
              <li>&bull; <code className="text-emerald-300 font-mono">same_subject</code>: Candidate relates to baseline entity.</li>
              <li>&bull; <code className="text-emerald-300 font-mono">chronology_valid</code>: Candidate timestamp &gt; baseline.</li>
              <li>&bull; <code className="text-emerald-300 font-mono">baseline_granted_right</code>: Original license granted right.</li>
              <li>&bull; <code className="text-emerald-300 font-mono">candidate_modifies_clause</code>: Evidence modifies terms.</li>
              <li>&bull; <code className="text-emerald-300 font-mono">materially_adverse_shift</code>: Negative shift verified.</li>
              <li>&bull; <code className="text-emerald-300 font-mono">not_carved_out</code>: No exception applies.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section 4: Appeal Window & Game Theory */}
      <section className="rounded-xl border border-lex-800 bg-lex-900/60 p-6 space-y-4">
        <h2 className="text-xl font-serif font-bold text-white flex items-center space-x-2">
          <Clock className="h-5 w-5 text-purple-400" />
          <span>4. Native Appeal Window & Anti-Frontrunning Game Theory</span>
        </h2>
        <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
          In alignment with GenLayer design principles, LexDrift avoids building an ad-hoc custom court.
          Instead, the protocol relies entirely on GenLayer native consensus finality and appeal windows:
        </p>

        <div className="rounded-lg bg-lex-950 p-4 border border-lex-800 space-y-3 text-xs">
          <div>
            <span className="font-semibold text-white block mb-0.5">Commit-Reveal Protection:</span>
            <p className="text-gray-400">
              Challengers seal a cryptographic commitment <code>sha256(candidate_url + &quot;:&quot; + salt)</code> alongside
              a 500 wei bond. Front-runners and malicious miners cannot steal evidence from the mempool before
              the disclosure phase.
            </p>
          </div>

          <div>
            <span className="font-semibold text-white block mb-0.5">Native Appeal Window (Accepted Stage):</span>
            <p className="text-gray-400">
              When GenVM validators achieve consensus, the transaction enters the <code>accepted</code> state.
              The native appeal window remains active for validator challenges before reaching permanent <code>finalized-success</code>.
            </p>
          </div>

          <div>
            <span className="font-semibold text-white block mb-0.5">Stage Timeout Emergency Recovery:</span>
            <p className="text-gray-400">
              If an external worker fails to attest a Charter or a Challenger fails to reveal evidence within 1,800 seconds,
              any participant can trigger <code>expire_stage()</code> to prevent indefinite fund lockup.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
