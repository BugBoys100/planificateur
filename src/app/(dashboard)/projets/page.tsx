'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Calendar, CheckCircle, Folder, X, Edit2, Trash2, Save, AlignLeft } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description?: string;
  color: string;
  deadline: string;
  levelName?: string;
  totalEvents: number;
  completedEvents: number;
}

interface EventItem {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  date: string;
  isCompleted: boolean;
}

interface ProjectDetail extends Project {
  events: EventItem[];
}

export default function ProjetsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Pop-up states
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projectDetail, setProjectDetail] = useState<ProjectDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [isEditingProject, setIsEditingProject] = useState(false);

  // Form edit project states
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editColor, setEditColor] = useState('#3b82f6');
  const [editDeadline, setEditDeadline] = useState('');

  // States pour la gestion des sessions
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventEditTitle, setEventEditTitle] = useState('');
  const [eventEditDate, setEventEditDate] = useState('');
  const [eventEditDescription, setEventEditDescription] = useState('');

  // States pour ajouter une session
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventDescription, setNewEventDescription] = useState('');

  const loadProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setProjects(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleOpenModal = async (projectId: string) => {
    setSelectedProjectId(projectId);
    setLoadingDetail(true);
    setIsEditingProject(false);
    setEditingEventId(null);
    setIsAddingEvent(false);

    try {
      const res = await fetch(`/api/projects/${projectId}`);
      if (res.ok) {
        const data = await res.json();
        setProjectDetail(data);
        setEditTitle(data.title || '');
        setEditDescription(data.description || '');
        setEditColor(data.color || '#3b82f6');
        setEditDeadline(data.deadline || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedProjectId(null);
    setProjectDetail(null);
  };

  // --- ACTIONS SUR LE PROJET ---
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) return;

    await fetch(`/api/projects/${selectedProjectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: editTitle,
        description: editDescription,
        color: editColor,
        deadline: editDeadline,
      }),
    });

    setIsEditingProject(false);
    handleOpenModal(selectedProjectId);
    loadProjects();
  };

  const handleDeleteProject = async () => {
    if (!selectedProjectId || !confirm('Voulez-vous supprimer ce projet et toutes ses sessions ?')) return;
    await fetch(`/api/projects/${selectedProjectId}`, { method: 'DELETE' });
    handleCloseModal();
    loadProjects();
  };

  // --- ACTIONS SUR LES SESSIONS (EVENTS) ---
  const startEditingEvent = (event: EventItem) => {
    setEditingEventId(event.id);
    setEventEditTitle(event.title);
    setEventEditDate(event.date);
    setEventEditDescription(event.description || '');
  };

  const handleSaveEvent = async (eventId: string) => {
    await fetch(`/api/events/${eventId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: eventEditTitle,
        date: eventEditDate,
        description: eventEditDescription,
      }),
    });

    setEditingEventId(null);
    if (selectedProjectId) handleOpenModal(selectedProjectId);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Supprimer cette session ?')) return;
    await fetch(`/api/events/${eventId}`, { method: 'DELETE' });
    if (selectedProjectId) handleOpenModal(selectedProjectId);
    loadProjects();
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !newEventTitle || !newEventDate) return;

    await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId: selectedProjectId,
        title: newEventTitle,
        date: newEventDate,
        description: newEventDescription,
      }),
    });

    setIsAddingEvent(false);
    setNewEventTitle('');
    setNewEventDate('');
    setNewEventDescription('');
    handleOpenModal(selectedProjectId);
    loadProjects();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Mes Projets</h1>
          <p className="text-sm text-gray-500">Gérez vos modules et planifiez vos révisions</p>
        </div>
        <Link
          href="/projets/nouveau"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-all shadow-sm"
        >
          <Plus size={18} />
          Nouveau Projet
        </Link>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500">Chargement de vos projets...</div>
      ) : projects.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-3">
          <Folder className="mx-auto text-gray-400" size={40} />
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Aucun projet pour le moment</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            Créez votre premier projet pour générer vos sessions de révision.
          </p>
          <Link
            href="/projets/nouveau"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-all"
          >
            <Plus size={16} />
            Créer un projet
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => {
            const progress = project.totalEvents > 0 
              ? Math.round((project.completedEvents / project.totalEvents) * 100) 
              : 0;

            return (
              <div
                key={project.id}
                onClick={() => handleOpenModal(project.id)}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 space-y-4 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="inline-block w-3.5 h-3.5 rounded-full" style={{ backgroundColor: project.color }} />
                    {project.levelName && (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-medium">
                        {project.levelName}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{project.title}</h3>
                  {project.description && (
                    <p className="text-xs text-gray-500 line-clamp-2">{project.description}</p>
                  )}
                </div>

                <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-800/60">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      {project.deadline}
                    </span>
                    <span className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-gray-300">
                      <CheckCircle size={14} className="text-blue-500" />
                      {project.totalEvents} sessions
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-gray-500">
                      <span>Progression</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${progress}%`, backgroundColor: project.color }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* POPUP / MODAL DÉTAILS DU PROJET */}
      {selectedProjectId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                {projectDetail && (
                  <span className="w-4 h-4 rounded-full" style={{ backgroundColor: projectDetail.color }} />
                )}
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {isEditingProject ? 'Modifier le projet' : projectDetail?.title || 'Chargement...'}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                {!isEditingProject && projectDetail && (
                  <>
                    <button
                      onClick={() => setIsEditingProject(true)}
                      className="p-2 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                      title="Modifier le projet"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={handleDeleteProject}
                      className="p-2 text-gray-500 hover:text-red-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                      title="Supprimer le projet"
                    >
                      <Trash2 size={18} />
                    </button>
                  </>
                )}
                <button
                  onClick={handleCloseModal}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-6">
              {loadingDetail ? (
                <div className="text-center text-gray-500 py-8">Chargement...</div>
              ) : isEditingProject ? (
                /* FORMULAIRE D'ÉDITION DE PROJET */
                <form onSubmit={handleSaveProject} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Titre</label>
                    <input
                      type="text"
                      required
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                    <textarea
                      rows={3}
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Deadline</label>
                      <input
                        type="date"
                        required
                        value={editDeadline}
                        onChange={(e) => setEditDeadline(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Couleur</label>
                      <input
                        type="color"
                        value={editColor}
                        onChange={(e) => setEditColor(e.target.value)}
                        className="w-full h-10 rounded-xl cursor-pointer border-0 bg-transparent"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsEditingProject(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl"
                    >
                      Enregistrer
                    </button>
                  </div>
                </form>
              ) : projectDetail ? (
                <>
                  {/* Infos Projet */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                      <span>Niveau : {projectDetail.levelName || 'N/A'}</span>
                      <span>•</span>
                      <span>Deadline : {projectDetail.deadline}</span>
                    </div>
                    {projectDetail.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">
                        {projectDetail.description}
                      </p>
                    )}
                  </div>

                  {/* Gestion des Sessions */}
                  <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                        Sessions de révision ({projectDetail.events.length})
                      </h3>
                      <button
                        onClick={() => setIsAddingEvent(!isAddingEvent)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 transition-all"
                      >
                        <Plus size={14} />
                        Ajouter une session
                      </button>
                    </div>

                    {/* Formulaire de création de session */}
                    {isAddingEvent && (
                      <form onSubmit={handleCreateEvent} className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-blue-200 dark:border-blue-900 space-y-3">
                        <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Nouvelle session</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="Titre de la session"
                            required
                            value={newEventTitle}
                            onChange={(e) => setNewEventTitle(e.target.value)}
                            className="px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                          />
                          <input
                            type="date"
                            required
                            value={newEventDate}
                            onChange={(e) => setNewEventDate(e.target.value)}
                            className="px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                          />
                        </div>
                        <input
                          type="text"
                          placeholder="Description / Objectifs de la session (optionnel)"
                          value={newEventDescription}
                          onChange={(e) => setNewEventDescription(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                        />
                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setIsAddingEvent(false)}
                            className="px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
                          >
                            Annuler
                          </button>
                          <button
                            type="submit"
                            className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                          >
                            Ajouter
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Liste des Sessions */}
                    <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                      {projectDetail.events.length === 0 ? (
                        <p className="text-xs text-gray-500 text-center py-4">Aucune session planifiée.</p>
                      ) : (
                        projectDetail.events.map((event) => (
                          <div
                            key={event.id}
                            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-3.5 space-y-2 hover:border-gray-300 dark:hover:border-gray-700 transition-all"
                          >
                            {editingEventId === event.id ? (
                              /* MODE ÉDITION D'UNE SESSION */
                              <div className="space-y-3">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  <input
                                    type="text"
                                    value={eventEditTitle}
                                    onChange={(e) => setEventEditTitle(e.target.value)}
                                    className="px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent"
                                  />
                                  <input
                                    type="date"
                                    value={eventEditDate}
                                    onChange={(e) => setEventEditDate(e.target.value)}
                                    className="px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent"
                                  />
                                </div>
                                <textarea
                                  rows={2}
                                  placeholder="Description / Note..."
                                  value={eventEditDescription}
                                  onChange={(e) => setEventEditDescription(e.target.value)}
                                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent"
                                />
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => setEditingEventId(null)}
                                    className="px-2.5 py-1 text-xs text-gray-500 hover:bg-gray-100 rounded-md"
                                  >
                                    Annuler
                                  </button>
                                  <button
                                    onClick={() => handleSaveEvent(event.id)}
                                    className="inline-flex items-center gap-1 px-3 py-1 text-xs text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                  >
                                    <Save size={12} /> Enregistrer
                                  </button>
                                </div>
                              </div>
                            ) : (
                              /* MODE AFFICHAGE D'UNE SESSION */
                              <div className="flex items-start justify-between gap-3">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">{event.title}</h4>
                                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-500">
                                      {event.date}
                                    </span>
                                  </div>
                                  {event.description && (
                                    <p className="text-xs text-gray-500 flex items-center gap-1.5 pt-0.5">
                                      <AlignLeft size={12} className="shrink-0 text-gray-400" />
                                      {event.description}
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    onClick={() => startEditingEvent(event)}
                                    className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                                    title="Modifier la session"
                                  >
                                    <Edit2 size={14} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteEvent(event.id)}
                                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                                    title="Supprimer la session"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
