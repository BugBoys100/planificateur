'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, FolderOpen, ScrollText, BarChart3, Settings, Menu, X } from 'lucide-react';
import UserMenu from '@/components/UserMenu';

const navItems = [
  { name: 'Accueil', href: '/', icon: Home },
  { name: 'Calendrier', href: '/calendrier', icon: Calendar },
  { name: 'Projets', href: '/projets', icon: FolderOpen },
  { name: 'Logs', href: '/logs', icon: ScrollText },
  { name: 'Statistiques', href: '/statistiques', icon: BarChart3 },
  { name: 'Paramètres', href: '/settings', icon: Settings },
];

export function Sidebar({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col md:flex-row w-full overflow-x-hidden">
      {/* Header Mobile */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <span className="font-bold text-base text-gray-900 dark:text-gray-100">
            Auto-Planificateur
          </span>
        </div>

        {/* Menu utilisateur sur mobile */}
        <UserMenu />
      </div>

      {/* Superposition sombre sur Mobile quand le menu est ouvert */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Barre Latérale */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transform transition-transform duration-200 ease-in-out shrink-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* En-tête de la Sidebar Desktop */}
        <div className="p-6 hidden md:flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Auto-Planif.
          </h1>
        </div>

        {/* Header tiroir mobile (pour pouvoir fermer facilement) */}
        <div className="p-4 md:hidden flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
          <span className="font-bold text-sm text-gray-900 dark:text-gray-100">
            Navigation
          </span>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation / Liens */}
        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-semibold'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                }`}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Colonne Principale */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        {/* Header Desktop (avec UserMenu) */}
        <header className="hidden md:flex items-center justify-end px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <UserMenu />
        </header>

        {/* Contenu principal */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto w-full max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
