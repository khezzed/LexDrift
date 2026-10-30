import { ExternalLink, ShieldCheck, Terminal, Database } from 'lucide-react';
import { LEX_VAULT_ADDRESS, CHARTER_GATE_ADDRESS, DRIFT_AUDITOR_ADDRESS, EXPLORER_URL } from '@/lib/constants';
import proofManifest from '@/lib/proofManifest.json';

export function Footer() {
  return (
    <footer className="border-t border-lex-800 bg-lex-950 py-8 text-xs text-gray-400 mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-6 border-b border-lex-800">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 text-white font-serif font-bold text-sm mb-2">
              <ShieldCheck className="h-4 w-4 text-gold-400" />
              <span>LexDrift Sentinel Protocol</span>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed max-w-md">
              Autonomous legal and governance policy drift sentinel on GenLayer StudioNet.
              Decentralized consensus verification of immutable covenants, multi-snapshot chronology,
              substring containment proofs, and pull-credit restitution.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-mono text-gray-500">
              <div className="flex items-center space-x-1.5">
                <Terminal className="h-3.5 w-3.5 text-cyan-500" />
                <span>Runner:</span>
                <span className="text-cyan-400">{proofManifest.runnerHash}</span>
              </div>
              {proofManifest.gitCommit && (
                <div className="flex items-center space-x-1.5">
                  <Database className="h-3.5 w-3.5 text-gold-500" />
                  <span>Git Commit:</span>
                  <span className="text-gold-400 font-mono">{proofManifest.gitCommit.slice(0, 8)}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-gray-300 block mb-2">
              Deployed Contracts
            </span>
            <ul className="space-y-1.5 font-mono text-[11px]">
              <li>
                <a
                  href={`${EXPLORER_URL}/address/${LEX_VAULT_ADDRESS}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-1 hover:text-gold-400 transition-colors"
                >
                  <span className="text-gray-500">Vault:</span>
                  <span className="truncate">{LEX_VAULT_ADDRESS.slice(0, 10)}...</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </li>
              <li>
                <a
                  href={`${EXPLORER_URL}/address/${CHARTER_GATE_ADDRESS}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-1 hover:text-cyan-400 transition-colors"
                >
                  <span className="text-gray-500">Gate:</span>
                  <span className="truncate">{CHARTER_GATE_ADDRESS.slice(0, 10)}...</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </li>
              <li>
                <a
                  href={`${EXPLORER_URL}/address/${DRIFT_AUDITOR_ADDRESS}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-1 hover:text-emerald-400 transition-colors"
                >
                  <span className="text-gray-500">Auditor:</span>
                  <span className="truncate">{DRIFT_AUDITOR_ADDRESS.slice(0, 10)}...</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </li>
            </ul>
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-gray-300 block mb-2">
              Verification Matrix
            </span>
            <ul className="space-y-1.5 text-[11px]">
              <li className="flex items-center space-x-1.5 text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                <span>Case 1: Vague Covenant (Rejected)</span>
              </li>
              <li className="flex items-center space-x-1.5 text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                <span>Case 2: Benign Revision (Rejected)</span>
              </li>
              <li className="flex items-center space-x-1.5 text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                <span>Case 3: Adversarial Input (Rejected)</span>
              </li>
              <li className="flex items-center space-x-1.5 text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                <span>Case 4: Material Drift (Settled & Reconciled)</span>
              </li>
              <li className="flex items-center space-x-1.5 text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                <span>Case 5: Stage Deadline (Expired & Refunded)</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-[11px] text-gray-500">
          <div>
            GenLayer Intelligent Contract Sentinel Benchmark • StudioNet Chain ID 61999
          </div>
          <div>
            Built with Next.js 15 App Router, TypeScript & Tailwind CSS
          </div>
        </div>
      </div>
    </footer>
  );
}
