'use client';

import { useEffect, useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Filter, 
  Calendar as CalendarIcon, 
  Flag, 
  CheckSquare, 
  Square,
  X,
  AlignLeft,
  Trash2
} from 'lucide-react';

interface Project {
  id: string;
  title: string;
  color: string;
  deadline: string;
}

interface CalendarEvent {
  id: string;
  projectId?: string | null;
  title: string;
  description?: string;
  date: string;
  isCompleted: boolean;
  projectTitle?: string;
  projectColor?: string;
  isDeadline?: boolean; // Événement virtuel généré pour la date finale
}

const DAYS_OF_WEEK = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export default function CalendrierPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [projects, setProjects] = useState<Project[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // States Modale Nouvel Événement Libres
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDateForModal, setSelectedDateForModal] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventProjectId, setEventProjectId] = useState('');

  // States Détail d'un événement
  const [activeEvent, setActiveEvent] = useState<CalendarEvent | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [resProjects, resEvents] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/events'),
      ]);

      if (resProjects.ok && resEvents.ok) {
        const dataProjects: Project[] = await resProjects.json();
        const dataEvents: CalendarEvent[] = await resEvents.json();
        setProjects(dataProjects);
        setEvents(dataEvents);
      }
    } catch (err) {
      console.error('Erreur chargement données calendrier:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Fusionner les événements et les Deadlines des projets
  const allCalendarItems = useMemo(() => {
    let items: CalendarEvent[] = [...events];

    // Générer des marqueurs visuels pour les Deadlines des projets
    projects.forEach((proj) => {
      if (proj.deadline) {
        items.push({
          id: `deadline-${proj.id}`,
          projectId: proj.id,
          title: `🏁 DEADLINE : ${proj.title}`,
          date: proj.deadline,
          isCompleted: false,
          projectTitle: proj.title,
          projectColor: proj.color,
          isDeadline: true,
        });
      }
    });

    // Filtre par projet
    if (selectedProjectId !== 'all') {
      items = items.filter((item) => item.projectId === selectedProjectId);
    }

    return items;
  }, [events, projects, selectedProjectId]);

  // Navigation par mois
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Calcul de la grille du mois
  const monthGrid = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Ajuster l'index du premier jour (0 = Lundi, 6 = Dimanche)
    let startingDayIndex = firstDayOfMonth.getDay() - 1;
    if (startingDayIndex === -1) startingDayIndex = 6;

    const daysInMonth = lastDayOfMonth.getDate();

    const grid = [];
    
    // Remplir les jours du mois précédent
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayIndex - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const dateStr = `${month === 0 ? year - 1 : year}-${String(month === 0 ? 12 : month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      grid.push({ day, dateStr, isCurrentMonth: false });
    }

    // Jours du mois courant
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      grid.push({ day, dateStr, isCurrentMonth: true });
    }

    // Compléter la dernière semaine si nécessaire
    const remainingDays = 42 - grid.length; // Grille fixe de 6 semaines (6 * 7 = 42)
    for (let day = 1; day <= remainingDays; day++) {
      const dateStr = `${month === 11 ? year + 1 : year}-${String(month === 11 ? 1 : month + 2).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      grid.push({ day, dateStr, isCurrentMonth: false });
    }

    return grid;
  }, [currentDate]);
  // Cocher/Décocher un événement
  const toggleEventCompletion = async (event: CalendarEvent) => {
    if (event.isDeadline) return;

    const newStatus = !event.isCompleted;

    // 1. Mise à jour dans la liste globale des événements (grille)
    setEvents((prev) =>
      prev.map((e) => (e.id === event.id ? { ...e, isCompleted: newStatus } : e))
    );

    // 2. Mise à jour instantanée de la modale ouverte
    if (activeEvent && activeEvent.id === event.id) {
      setActiveEvent({ ...activeEvent, isCompleted: newStatus });
    }

    // 3. Persistance en BDD
    await fetch(`/api/events/${event.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isCompleted: newStatus }),
    });
  };


  // Créer un événement
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle || !selectedDateForModal) return;

    await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: eventTitle,
        description: eventDescription,
        date: selectedDateForModal,
        projectId: eventProjectId || null,
      }),
    });

    setIsModalOpen(false);
    setEventTitle('');
    setEventDescription('');
    setEventProjectId('');
    loadData();
  };

  // Supprimer un événement libre
  const handleDeleteEvent = async (eventId: string) => {
    await fetch(`/api/events/${eventId}`, { method: 'DELETE' });
    setActiveEvent(null);
    loadData();
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      {/* Header & Filtres */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <CalendarIcon size={24} className="text-blue-600" />
            Calendrier
          </h1>
          <p className="text-sm text-gray-500">Visualisez vos révisions, échéances et notes</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Filtre par Projet */}
          <div className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-1.5 shadow-sm">
            <Filter size={14} className="text-gray-400" />
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-transparent text-xs font-medium text-gray-700 dark:text-gray-300 focus:outline-none cursor-pointer"
            >
              <option value="all">Tous les projets</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              setSelectedDateForModal(todayStr);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Plus size={16} />
            Ajouter un événement
          </button>
        </div>
      </div>

      {/* Barre de navigation du mois */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button
            onClick={goToToday}
            className="px-2.5 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
          >
            Aujourd'hui
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Grille Mensuelle du Calendrier */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        {/* En-tête des jours */}
        <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 text-center text-xs font-semibold text-gray-500 py-3">
          {DAYS_OF_WEEK.map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        {/* Jours de la grille */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-gray-100 dark:divide-gray-800 min-h-[600px]">
          {monthGrid.map((item, idx) => {
            const dayEvents = allCalendarItems.filter((e) => e.date === item.dateStr);
            const isToday = item.dateStr === todayStr;

            return (
              <div
                key={idx}
                className={`p-2 flex flex-col justify-between transition-colors min-h-[100px] ${
                  !item.isCurrentMonth ? 'bg-gray-50/40 dark:bg-gray-950/20 text-gray-400' : 'bg-white dark:bg-gray-900'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full ${
                      isToday
                        ? 'bg-blue-600 text-white font-bold'
                        : item.isCurrentMonth
                        ? 'text-gray-700 dark:text-gray-300'
                        : 'text-gray-400'
                    }`}
                  >
                    {item.day}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedDateForModal(item.dateStr);
                      setIsModalOpen(true);
                    }}
                    className="opacity-0 hover:opacity-100 text-gray-400 hover:text-blue-600 p-0.5 rounded transition-opacity"
                    title="Ajouter ici"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Événements de la journée */}
                <div className="space-y-1 overflow-y-auto max-h-[85px] pr-0.5">
                  {dayEvents.map((ev) => (
                    <div
                      key={ev.id}
                      onClick={() => setActiveEvent(ev)}
                      className={`text-[11px] px-2 py-1 rounded-lg border font-medium truncate cursor-pointer transition-all flex items-center gap-1.5 ${
                        ev.isDeadline
                          ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 font-bold'
                          : ev.isCompleted
                          ? 'bg-gray-100 dark:bg-gray-800/40 border-gray-200 dark:border-gray-800 text-gray-400 line-through'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:border-blue-400'
                      }`}
                      style={
                        !ev.isDeadline && ev.projectColor
                          ? { borderLeftWidth: '3px', borderLeftColor: ev.projectColor }
                          : undefined
                      }
                    >
                      {ev.isDeadline ? (
                        <Flag size={10} className="shrink-0 text-red-600" />
                      ) : (
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: ev.projectColor || '#9ca3af' }}
                        />
                      )}
                      <span className="truncate">{ev.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODALE CRÉATION D'ÉVÉNEMENT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 w-full max-w-md rounded-2xl shadow-xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Ajouter un événement</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Titre</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Revoir la notion d'intégration"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Projet rattaché (Optionnel)</label>
                <select
                  value={eventProjectId}
                  onChange={(e) => setEventProjectId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Événement libre (Aucun projet)</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={selectedDateForModal}
                  onChange={(e) => setSelectedDateForModal(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Description (Optionnelle)</label>
                <textarea
                  rows={2}
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-gray-900 dark:text-gray-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-gray-500 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POP-UP DÉTALS D'UN ÉVÉNEMENT */}
      {activeEvent && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 w-full max-w-sm rounded-2xl shadow-xl p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                {activeEvent.projectTitle && (
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                    {activeEvent.projectTitle}
                  </span>
                )}
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">{activeEvent.title}</h3>
              </div>
              <button onClick={() => setActiveEvent(null)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-2 text-gray-500">
                <CalendarIcon size={14} />
                <span>{activeEvent.date}</span>
              </div>
              {activeEvent.description && (
                <div className="flex items-start gap-2 bg-gray-50 dark:bg-gray-800/50 p-2.5 rounded-xl">
                  <AlignLeft size={14} className="shrink-0 text-gray-400 mt-0.5" />
                  <p>{activeEvent.description}</p>
                </div>
              )}
            </div>

            {!activeEvent.isDeadline && (
              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => toggleEventCompletion(activeEvent)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400"
                >
                  {activeEvent.isCompleted ? (
                    <>
                      <CheckSquare size={16} /> Marquer non faite
                    </>
                  ) : (
                    <>
                      <Square size={16} /> Marquer comme faite
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleDeleteEvent(activeEvent.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                  title="Supprimer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
