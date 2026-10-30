'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldAlert, BookOpen, PlusCircle, Wallet, LayoutDashboard, ExternalLink, Activity } from 'lucide-react';
import { LEX_VAULT_ADDRESS, DEFAULT_REVIEWER_ADDRESS, EXPLORER_URL } from '@/lib/constants';

interface NavbarProps {
  dataSource?: 'live' | 'proof';
  onToggleDataSource?: () => void;
}

export function Navbar({ dataSource = 'live', onToggleDataSource }: NavbarProps) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Protect Charter', href: '/charters/new', icon: PlusCircle },
    { name: 'Credit Vault', href: '/vault', icon: Wallet },
    { name: 'Method & Spec', href: '/method', icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-lex-800 bg-lex-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-500/10 border border-gold-500/30 text-gold-400 group-hover:border-gold-500/60 transition-colors">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-serif text-lg font-bold tracking-tight text-white">LexDrift</span>
                <span className="rounded bg-gold-500/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gold-400 border border-gold-500/30">
                  GenLayer
                </span>
              </div>
              <p className="text-[10px] text-gray-400">Autonomous Legal Drift Sentinel</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-lex-800 text-gold-400 border border-lex-700'
                      : 'text-gray-300 hover:bg-lex-900 hover:text-white'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center space-x-3">
          {/* Data Source Mode Switcher */}
          {onToggleDataSource && (
            <button
              onClick={onToggleDataSource}
              title="Click to toggle between Live StudioNet RPC and cryptographically recorded proof.json"
              className="hidden sm:flex items-center space-x-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium border transition-colors bg-lex-900 hover:bg-lex-850 border-lex-700"
            >
              <Activity className={`h-3 w-3 ${dataSource === 'live' ? 'text-emerald-400 animate-pulse' : 'text-cyan-400'}`} />
              <span className="text-gray-300">Source:</span>
              <span className={`font-semibold ${dataSource === 'live' ? 'text-emerald-400' : 'text-cyan-300'}`}>
                {dataSource === 'live' ? 'Live RPC' : 'Recorded Proof'}
              </span>
            </button>
          )}

          {/* Network Pill */}
          <div className="hidden lg:flex items-center space-x-1.5 rounded-md bg-lex-900 px-2.5 py-1 text-[11px] border border-lex-800 text-gray-300">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-mono">StudioNet:61999</span>
          </div>

          {/* Reviewer Zero-Wallet Indicator */}
          <div className="flex items-center space-x-1.5 rounded-md bg-lex-900 border border-gold-500/30 px-2.5 py-1 text-xs">
            <span className="text-[10px] uppercase font-bold tracking-wider text-gold-400">Reviewer:</span>
            <span className="font-mono text-gray-300 text-[11px]">
              {DEFAULT_REVIEWER_ADDRESS.slice(0, 6)}...{DEFAULT_REVIEWER_ADDRESS.slice(-4)}
            </span>
          </div>

          <a
            href={`${EXPLORER_URL}/address/${LEX_VAULT_ADDRESS}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1 rounded-md bg-lex-800 px-2.5 py-1 text-xs font-medium text-gray-300 hover:bg-lex-700 hover:text-white transition-colors"
          >
            <span>Vault</span>
            <ExternalLink className="h-3 w-3 text-gray-400" />
          </a>
        </div>
      </div>
    </header>
  );
}
