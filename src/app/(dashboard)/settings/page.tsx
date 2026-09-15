'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { 
  User, 
  Moon, 
  Sun, 
  Calendar, 
  Copy, 
  Check, 
  Save, 
  ShieldCheck, 
  Sparkles,
  Smartphone,
  Lock
} from 'lucide-react';

export default function SettingsPage() {
  // Profil
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Thème avec next-themes
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // iCal
  const [copied, setCopied] = useState(false);
  const [iCalUrl, setICalUrl] = useState('');

  // États UI
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
  setMounted(true);

  fetch('/api/user/settings')
    .then(async (res) => {
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur serveur (${res.status})`);
      }
      return res.json();
    })
    .then((data) => {
      if (data) {
        setName(data.name || '');
        setEmail(data.email || '');

        const uId = data.id || data.userId;
        if (uId) {
          const origin = window.location.origin;
          setICalUrl(`${origin}/api/ical/${uId}`);
        }
      }
    })
    .catch((err) => {
      console.error('Détails erreur chargement profil:', err.message);
      setErrorMsg(`Impossible de charger les données : ${err.message}`);
    });
}, []);


  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password: password || undefined }),
      });

      if (res.ok) {
        setSuccessMsg('Profil et paramètres enregistrés avec succès !');
        setPassword('');
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Erreur lors de la sauvegarde');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Erreur réseau');
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = () => {
    if (!iCalUrl) return;
    navigator.clipboard.writeText(iCalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const currentTheme = theme === 'system' ? resolvedTheme : theme;

  return (
    <div className="max-w-4xl space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Paramètres & Configuration</h1>
        <p className="text-sm text-gray-500">Gérez votre compte, vos préférences d'affichage et vos synchronisations.</p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400 text-xs font-semibold flex items-center gap-2">
          <ShieldCheck size={16} /> {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {/* 1. Profil Utilisateur & Sécurité */}
      <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <User size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Profil & Sécurité</h2>
            <p className="text-xs text-gray-500">Modifiez votre nom, email et mot de passe</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Nom complet</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Adresse Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Nouveau mot de passe <span className="text-gray-400 font-normal">(laisser vide pour ne pas modifier)</span>
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 pl-9"
              />
              <Lock size={14} className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-sm disabled:opacity-50"
          >
            <Save size={14} /> {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </form>
      </section>

      {/* 2. Thème & Apparence */}
      <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Apparence du Thème</h2>
            <p className="text-xs text-gray-500">Choisissez votre mode visuel préféré</p>
          </div>
        </div>

        {mounted && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`p-4 rounded-2xl border text-left flex items-center justify-between transition ${
                currentTheme === 'light'
                  ? 'border-blue-600 bg-blue-50/50 text-blue-900 dark:bg-blue-950/20'
                  : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Sun size={20} className={currentTheme === 'light' ? 'text-blue-600' : 'text-gray-400'} />
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-gray-100">Mode Clair</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">Fond blanc, idéal en journée</p>
                </div>
              </div>
              {currentTheme === 'light' && <Check size={16} className="text-blue-600" />}
            </button>

            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-2xl border text-left flex items-center justify-between transition ${
                currentTheme === 'dark'
                  ? 'border-blue-600 bg-blue-950/20 text-blue-100'
                  : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Moon size={20} className={currentTheme === 'dark' ? 'text-blue-400' : 'text-gray-400'} />
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-gray-100">Mode Sombre</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">Moins de fatigue visuelle</p>
                </div>
              </div>
              {currentTheme === 'dark' && <Check size={16} className="text-blue-400" />}
            </button>
          </div>
        )}
      </section>

      {/* 3. Exportation iCal (.ics) */}
      <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <Calendar size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Synchronisation iCal (.ics)</h2>
            <p className="text-xs text-gray-500">Abonnez-vous à vos événements depuis Google Calendar, iPhone ou Outlook</p>
          </div>
        </div>

        <div className="space-y-4 max-w-2xl">
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
            Utilisez ce lien d'abonnement universel pour synchroniser automatiquement vos sessions de révision et vos deadlines sur votre smartphone ou votre agenda principal :
          </p>

          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs font-mono text-gray-700 dark:text-gray-300 truncate">
              {iCalUrl || 'Chargement du lien...'}
            </div>

            <button
              onClick={copyToClipboard}
              disabled={!iCalUrl}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200 text-xs font-bold rounded-xl transition shrink-0 disabled:opacity-50"
            >
              {copied ? (
                <>
                  <Check size={14} className="text-green-400 dark:text-green-600" /> Copié !
                </>
              ) : (
                <>
                  <Copy size={14} /> Copier le lien
                </>
              )}
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-2 text-xs text-gray-500">
            <div className="flex items-center gap-2 font-bold text-gray-700 dark:text-gray-300">
              <Smartphone size={14} /> Tuto rapide :
            </div>
            <ul className="list-disc list-inside space-y-1 pl-1">
              <li><b>Apple iPhone / Mac :</b> Réglages &gt; Calendrier &gt; Comptes &gt; Ajouter &gt; Enseigne. iCal abonné.</li>
              <li><b>Google Calendar :</b> Cliquez sur le "+" à côté d'Autres agendas &gt; À partir de l'URL.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
