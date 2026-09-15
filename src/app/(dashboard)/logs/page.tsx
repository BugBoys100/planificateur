'use client';

import { useEffect, useState } from 'react';
import { 
  ShieldAlert, 
  Filter, 
  User, 
  Calendar, 
  FolderCheck, 
  Key, 
  Monitor, 
  Globe, 
  RefreshCw 
} from 'lucide-react';

interface LogItem {
  id: string;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  action: string;
  category: 'EVENT' | 'PROJECT' | 'AUTH' | 'ADMIN';
  details: string;
  metadata: { ip?: string; userAgent?: string } | null;
  createdAt: string;
}

interface UserOption {
  id: string;
  name: string;
  email: string;
}

export default function LogsPage() {
  const [logsList, setLogsList] = useState<LogItem[]>([]);
  const [usersList, setUsersList] = useState<UserOption[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedUser, setSelectedUser] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        category: selectedCategory,
        userId: selectedUser,
      }).toString();

      const res = await fetch(`/api/logs?${query}`);
      if (res.ok) {
        const data = await res.json();
        setLogsList(data.logs);
        setUsersList(data.users);
      }
    } catch (err) {
      console.error('Erreur chargement logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [selectedCategory, selectedUser]);

  // Formatage de la date du log
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // Badge par catégorie
  const getCategoryBadge = (category: LogItem['category']) => {
    switch (category) {
      case 'AUTH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
            <Key size={12} /> Authentification
          </span>
        );
      case 'EVENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
            <Calendar size={12} /> Événement
          </span>
        );
      case 'PROJECT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400">
            <FolderCheck size={12} /> Projet
          </span>
        );
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400">
            <ShieldAlert size={12} /> Administration
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <ShieldAlert className="text-blue-600" /> Journal d'activités (Logs)
          </h1>
          <p className="text-sm text-gray-500">
            Historique complet des actions effectuées sur la plateforme.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Actualiser
        </button>
      </div>

      {/* Barre de Filtres */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider shrink-0">
          <Filter size={14} /> Filtres :
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
          {/* Filtre par catégorie */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full text-xs font-medium bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Toutes les catégories</option>
            <option value="AUTH">Authentification (Connexion / Inscription)</option>
            <option value="EVENT">Événements & Tâches</option>
            <option value="PROJECT">Projets</option>
            <option value="ADMIN">Administration</option>
          </select>

          {/* Filtre par Utilisateur */}
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="w-full text-xs font-medium bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Tous les utilisateurs</option>
            {usersList.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.email})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tableau des logs */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-xs text-gray-500">Chargement de l'historique...</div>
        ) : logsList.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-500">Aucune activité enregistrée pour le moment.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 text-gray-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Date & Heure</th>
                  <th className="py-3 px-4">Utilisateur</th>
                  <th className="py-3 px-4">Catégorie</th>
                  <th className="py-3 px-4">Détails</th>
                  <th className="py-3 px-4">Appareil & IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {logsList.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition">
                    {/* Date */}
                    <td className="py-3.5 px-4 font-mono text-gray-500 whitespace-nowrap">
                      {formatDate(log.createdAt)}
                    </td>

                    {/* Utilisateur */}
                    <td className="py-3.5 px-4 font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <User size={14} className="text-gray-400" />
                        <span>{log.userName || 'Anonyme'}</span>
                      </div>
                    </td>

                    {/* Catégorie */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getCategoryBadge(log.category)}
                    </td>

                    {/* Détails */}
                    <td className="py-3.5 px-4 text-gray-700 dark:text-gray-300">
                      <span className="font-semibold text-gray-900 dark:text-gray-100 mr-2">
                        [{log.action}]
                      </span>
                      {log.details}
                    </td>

                    {/* Appareil & IP */}
                    <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap">
                      {log.metadata ? (
                        <div className="space-y-0.5 text-[11px]">
                          <div className="flex items-center gap-1">
                            <Globe size={11} className="text-gray-400" /> IP: {log.metadata.ip || 'Inconnue'}
                          </div>
                          {log.metadata.userAgent && (
                            <div className="flex items-center gap-1 max-w-[180px] truncate" title={log.metadata.userAgent}>
                              <Monitor size={11} className="text-gray-400 shrink-0" /> {log.metadata.userAgent}
                            </div>
                          )}
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
