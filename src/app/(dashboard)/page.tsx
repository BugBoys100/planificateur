'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Calendar, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Flag, 
  ArrowRight, 
  Sparkles, 
  BookOpen,
  AlignLeft,
  ChevronRight
} from 'lucide-react';

interface EventItem {
  id: string;
  projectId?: string | null;
  title: string;
  description?: string;
  date: string;
  isCompleted: boolean;
  projectTitle?: string;
  projectColor?: string;
}

interface ProjectDeadline {
  id: string;
  title: string;
  color: string;
  deadline: string;
  daysLeft: number;
  totalEvents: number;
  completedEvents: number;
}

export default function HomePage() {
  const [userName, setUserName] = useState('Luc');
  const [todayEvents, setTodayEvents] = useState<EventItem[]>([]);
  const [tomorrowEvents, setTomorrowEvents] = useState<EventItem[]>([]);
  const [deadlines, setDeadlines] = useState<ProjectDeadline[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      const res = await fetch('/api/dashboard');
      if (res.ok) {
        const data = await res.json();
        setUserName(data.userName || 'Luc');
        setTodayEvents(data.todayEvents || []);
        setTomorrowEvents(data.tomorrowEvents || []);
        setDeadlines(data.upcomingDeadlines || []);
      }
    } catch (err) {
      console.error('Erreur chargement dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const toggleEventCompletion = async (event: EventItem) => {
    const newStatus = !event.isCompleted;

    // Mise à jour optimiste
    const updateList = (list: EventItem[]) =>
      list.map((e) => (e.id === event.id ? { ...e, isCompleted: newStatus } : e));

    setTodayEvents(updateList(todayEvents));
    setTomorrowEvents(updateList(tomorrowEvents));

    await fetch(`/api/events/${event.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isCompleted: newStatus }),
    });

    loadDashboard(); // Recharger pour maj les jauges
  };

  // Progression globale du jour
  const todayCompleted = todayEvents.filter((e) => e.isCompleted).length;
  const todayProgress = todayEvents.length > 0 ? Math.round((todayCompleted / todayEvents.length) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Salutation / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 text-white shadow-lg shadow-blue-500/10">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-blue-100">
            <Sparkles size={14} />
            <span>Tableau de bord quotidien</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Bonjour, {userName} ! 👋</h1>
          <p className="text-sm text-blue-100/80">
            {todayEvents.length > 0
              ? `Tu as ${todayEvents.length} session${todayEvents.length > 1 ? 's' : ''} prévue${todayEvents.length > 1 ? 's' : ''} aujourd'hui.`
              : 'Aucune tâche urgente programmée pour aujourd’hui.'}
          </p>
        </div>

        <Link
          href="/calendrier"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-blue-600 hover:bg-blue-50 rounded-2xl text-xs font-bold transition-all shadow-sm shrink-0 self-start sm:self-center"
        >
          <Calendar size={16} />
          Voir le calendrier
        </Link>
      </div>

      {/* Grid Principal (Gauche: Prochains Jours / Droite: Deadlines) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* SECTION GAUCHE : AUJOURD'HUI & DEMAIN (8/12) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* CARTE : AUJOURD'HUI */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <Clock size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Aujourd'hui</h2>
                  <p className="text-xs text-gray-500">
                    {todayCompleted} / {todayEvents.length} accomplie(s)
                  </p>
                </div>
              </div>

              {/* Jauge de progression */}
              {todayEvents.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-300"
                      style={{ width: `${todayProgress}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-gray-600 dark:text-gray-400">{todayProgress}%</span>
                </div>
              )}
            </div>

            {loading ? (
              <p className="text-xs text-gray-400 text-center py-4">Chargement du programme...</p>
            ) : todayEvents.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-12 h-12 bg-green-50 dark:bg-green-950/30 text-green-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={24} />
                </div>
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Journée libre ou terminée !</h3>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  Aucune session de révision planifiée pour aujourd'hui. Profites-en pour vous reposer ou avancer sur d'autres notions.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayEvents.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => toggleEventCompletion(event)}
                    className={`group p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                      event.isCompleted
                        ? 'bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-800 opacity-60'
                        : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-blue-500/50 shadow-sm'
                    }`}
                  >
                    <button className="mt-0.5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {event.isCompleted ? (
                        <CheckCircle2 size={20} className="text-blue-600 dark:text-blue-400" />
                      ) : (
                        <Circle size={20} />
                      )}
                    </button>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-sm font-bold ${
                            event.isCompleted
                              ? 'line-through text-gray-500 dark:text-gray-400'
                              : 'text-gray-900 dark:text-gray-100'
                          }`}
                        >
                          {event.title}
                        </span>
                        {event.projectTitle && (
                          <span
                            className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full border"
                            style={{
                              backgroundColor: `${event.projectColor}15`,
                              borderColor: `${event.projectColor}40`,
                              color: event.projectColor,
                            }}
                          >
                            {event.projectTitle}
                          </span>
                        )}
                      </div>

                      {event.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 pt-0.5">
                          <AlignLeft size={12} className="shrink-0 text-gray-400" />
                          {event.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CARTE : DEMAIN */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                  <Calendar size={18} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Demain</h2>
                  <p className="text-xs text-gray-500">Anticipez la journée de demain</p>
                </div>
              </div>
            </div>

            {loading ? (
              <p className="text-xs text-gray-400 text-center py-2">Chargement...</p>
            ) : tomorrowEvents.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-3 italic">
                Rien de prévu pour demain.
              </p>
            ) : (
              <div className="space-y-2">
                {tomorrowEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-3.5 rounded-xl border border-gray-100 dark:border-gray-800/80 bg-gray-50/50 dark:bg-gray-800/20 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: event.projectColor || '#9ca3af' }}
                      />
                      <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                        {event.title}
                      </span>
                    </div>

                    {event.projectTitle && (
                      <span className="text-[10px] text-gray-500 font-medium">
                        {event.projectTitle}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SECTION DROITE : DEADLINES EN DÉTAILS (4/12) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-5 sticky top-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center">
                  <Flag size={16} />
                </div>
                <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Deadlines</h2>
              </div>
              <Link
                href="/projets"
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
              >
                Projets <ChevronRight size={14} />
              </Link>
            </div>

            {loading ? (
              <p className="text-xs text-gray-400 text-center py-4">Chargement des échéances...</p>
            ) : deadlines.length === 0 ? (
              <div className="text-center py-6 space-y-2">
                <BookOpen size={28} className="mx-auto text-gray-400" />
                <p className="text-xs text-gray-500">Aucun projet en cours avec deadline.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {deadlines.map((proj) => {
                  const progress =
                    proj.totalEvents > 0 ? Math.round((proj.completedEvents / proj.totalEvents) * 100) : 0;

                  return (
                    <div
                      key={proj.id}
                      className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: proj.color }}
                          />
                          <h3 className="text-xs font-bold text-gray-900 dark:text-gray-100 line-clamp-1">
                            {proj.title}
                          </h3>
                        </div>

                        {/* Badges de délai */}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                            proj.daysLeft < 0
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                              : proj.daysLeft <= 3
                              ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400'
                              : 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                          }`}
                        >
                          {proj.daysLeft < 0
                            ? 'Dépassée'
                            : proj.daysLeft === 0
                            ? 'Aujourd’hui !'
                            : `J-${proj.daysLeft}`}
                        </span>
                      </div>

                      {/* Info Date & Progression */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[11px] text-gray-500">
                          <span>Échéance : {proj.deadline}</span>
                          <span className="font-semibold text-gray-700 dark:text-gray-300">{progress}%</span>
                        </div>

                        <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{ width: `${progress}%`, backgroundColor: proj.color }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
