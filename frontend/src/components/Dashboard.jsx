import React, { useState, useMemo } from "react";
import { Flame, CalendarDays, BookOpen, Archive } from "lucide-react";
import LampEffect from "./ui/LampEffect";
import Sidebar from "./Sidebar";
import Forge from "./Forge";
import Events from "./Events";
import Notes from "./Notes";
import ArchiveView from "./Archive";

/**
 * Dashboard — Main app shell with sidebar, tabs, and content area.
 * Orchestrates all data operations between components and the API.
 */
export default function Dashboard({ user, api, onLogout }) {
  const [habits, setHabits] = useState([]);
  const [events, setEvents] = useState([]);
  const [archivedEvents, setArchivedEvents] = useState([]);
  const [notes, setNotes] = useState([]);
  const [stats, setStats] = useState({});
  const [tab, setTab] = useState("forge");
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  // Initial data load
  React.useEffect(() => {
    async function load() {
      try {
        const [h, e, ae, n, s] = await Promise.all([
          api.getHabits(),
          api.getEvents(),
          api.getArchivedEvents(),
          api.getNotes(),
          api.getStats(),
        ]);
        setHabits(h);
        setEvents(e);
        setArchivedEvents(ae);
        setNotes(n);
        setStats(s);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoaded(true);
      }
    }
    load();
  }, []);

  // Completion summary
  const completionPercent = useMemo(() => {
    if (!habits.length) return 0;
    return Math.round(
      (habits.filter((h) => h.done).length / habits.length) * 100
    );
  }, [habits]);

  // --- Habit operations ---
  async function addHabit(text) {
    try {
      const habit = await api.createHabit({
        text,
        pillar: stats.activePillar || "General",
      });
      setHabits((prev) => [...prev, habit]);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  async function updateHabit(id, patch) {
    // Optimistic update
    setHabits((prev) =>
      prev.map((h) => (h._id === id ? { ...h, ...patch } : h))
    );
    try {
      const updated = await api.updateHabit(id, patch);
      setHabits((prev) => prev.map((h) => (h._id === id ? updated : h)));
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteHabit(id) {
    setHabits((prev) => prev.filter((h) => h._id !== id));
    try {
      await api.deleteHabit(id);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  async function changePillar(pillar) {
    setStats((prev) => ({ ...prev, activePillar: pillar }));
    try {
      await api.updateStats({ activePillar: pillar });
    } catch (err) {
      setError(err.message);
    }
  }

  // --- Event operations ---
  async function addEvent({ text, deadline }) {
    try {
      const event = await api.createEvent({ text, deadline });
      setEvents((prev) => [...prev, event]);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  async function updateEvent(id, patch) {
    setEvents((prev) =>
      prev.map((e) => (e._id === id ? { ...e, ...patch } : e))
    );
    try {
      const updated = await api.updateEvent(id, patch);
      setEvents((prev) => prev.map((e) => (e._id === id ? updated : e)));
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteEvent(id) {
    setEvents((prev) => prev.filter((e) => e._id !== id));
    try {
      await api.deleteEvent(id);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  // --- Note operations ---
  async function addNote({ title, content }) {
    try {
      const note = await api.createNote({ title, content });
      setNotes((prev) => [note, ...prev]);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteNote(id) {
    setNotes((prev) => prev.filter((n) => n._id !== id));
    try {
      await api.deleteNote(id);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  // --- State operations ---
  async function handleMidnight() {
    try {
      const updatedStats = await api.midnight();
      setStats(updatedStats);
      // Refresh habits and events after midnight
      const [h, e, ae] = await Promise.all([
        api.getHabits(),
        api.getEvents(),
        api.getArchivedEvents(),
      ]);
      setHabits(h);
      setEvents(e);
      setArchivedEvents(ae);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleReset() {
    try {
      await api.resetForge();
      setHabits([]);
      setEvents([]);
      setArchivedEvents([]);
      setStats((prev) => ({
        ...prev,
        activePillar: "General",
        statsMaster: { current: 0, prev: 0, best: 0 },
        statsIron: { current: 0, prev: 0, best: 0 },
        statsMind: { current: 0, prev: 0, best: 0 },
        statsGeneral: { current: 0, prev: 0, best: 0 },
      }));
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  if (!loaded) {
    return <div className="loading">Loading StreakForge...</div>;
  }

  return (
    <>
      <LampEffect />
      <div className="app-shell">
        <Sidebar
          user={user}
          stats={stats}
          onLogout={onLogout}
          onReset={handleReset}
          onMidnight={handleMidnight}
        />
        <main className="workspace">
          {/* Top Bar */}
          <header className="topbar">
            <div>
              <h1>StreakForge</h1>
              <p>Execute the standard.</p>
            </div>
            <div className="summary">
              <strong>{completionPercent}%</strong>
              <span>Daily completion</span>
            </div>
          </header>

          {/* Error Banner */}
          {error && <div className="error-banner">{error}</div>}

          {/* Navigation Tabs */}
          <nav className="tabs">
            <button
              id="tab-forge"
              className={tab === "forge" ? "active" : ""}
              onClick={() => setTab("forge")}
            >
              <Flame size={18} /> The Forge
            </button>
            <button
              id="tab-events"
              className={tab === "events" ? "active" : ""}
              onClick={() => setTab("events")}
            >
              <CalendarDays size={18} /> Event Board
            </button>
            <button
              id="tab-notes"
              className={tab === "notes" ? "active" : ""}
              onClick={() => setTab("notes")}
            >
              <BookOpen size={18} /> Field Notes
            </button>
            <button
              id="tab-archive"
              className={tab === "archive" ? "active" : ""}
              onClick={() => setTab("archive")}
            >
              <Archive size={18} /> Archive
            </button>
          </nav>

          {/* Tab Content */}
          {tab === "forge" && (
            <Forge
              habits={habits}
              activePillar={stats.activePillar || "General"}
              onAddHabit={addHabit}
              onUpdateHabit={updateHabit}
              onDeleteHabit={deleteHabit}
              onChangePillar={changePillar}
            />
          )}
          {tab === "events" && (
            <Events
              events={events}
              onAddEvent={addEvent}
              onUpdateEvent={updateEvent}
              onDeleteEvent={deleteEvent}
            />
          )}
          {tab === "notes" && (
            <Notes
              notes={notes}
              onAddNote={addNote}
              onDeleteNote={deleteNote}
            />
          )}
          {tab === "archive" && (
            <ArchiveView archivedEvents={archivedEvents} />
          )}
        </main>
      </div>
    </>
  );
}
