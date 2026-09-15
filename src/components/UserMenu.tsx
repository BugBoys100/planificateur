'use client';

import { useState, useEffect, useRef } from 'react';
import { User, LogOut, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UserMenu() {
  const [userName, setUserName] = useState<string>('Utilisateur');
  const [userEmail, setUserEmail] = useState<string>('');
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/user/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setUserName(data.name || 'Utilisateur');
          setUserEmail(data.email || '');
        }
      })
      .catch((err) => console.error(err));

    // Fermer au clic extérieur
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Erreur déconnexion:', err);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition text-xs font-semibold text-gray-800 dark:text-gray-200"
      >
        <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
          <User size={15} />
        </div>
        <span className="hidden sm:inline-block max-w-[120px] truncate">{userName}</span>
        <ChevronDown size={14} className="text-gray-400" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg p-2 z-50 space-y-1">
          <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
            <p className="text-xs font-bold text-gray-900 dark:text-gray-100">{userName}</p>
            {userEmail && <p className="text-[11px] text-gray-500 truncate">{userEmail}</p>}
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
          >
            <LogOut size={14} /> Déconnexion
          </button>
        </div>
      )}
    </div>
  );
}
