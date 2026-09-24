import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from 'react';
import {
  Check,
  CheckCircle2,
  Clock3,
  ClipboardList,
  House,
  ListFilter,
  Moon,
  Pencil,
  Plus,
  Sun,
  Trash2,
} from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

type Filter = 'all' | 'active' | 'completed';
type Theme = 'light' | 'dark';

type Task = {
  id: string;
  title: string;
  completed: boolean;
  category: string;
  due: string;
};

const TASKS_KEY = 'taskflow.tasks.v1';
const THEME_KEY = 'taskflow.theme.v1';

const starterTasks: Task[] = [
  { id: 'task-1', title: 'Outline the weekend meal plan', completed: false, category: 'Plan', due: 'Today' },
  { id: 'task-2', title: 'Reply to Maya about the studio visit', completed: false, category: 'Personal', due: 'Today' },
  { id: 'task-3', title: 'Take a 20-minute walk', completed: true, category: 'Wellbeing', due: 'Yesterday' },
  { id: 'task-4', title: 'Pick up oat milk on the way home', completed: false, category: 'Errand', due: 'Tomorrow' },
];

const queryClient = new QueryClient();

function readTasks(): Task[] {
  if (typeof window === 'undefined') return starterTasks;
  try {
    const saved = window.localStorage.getItem(TASKS_KEY);
    if (!saved) return starterTasks;
    const parsed = JSON.parse(saved) as Task[];
    return Array.isArray(parsed) ? parsed : starterTasks;
  } catch {
    return starterTasks;
  }
}

function readTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  return window.localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light';
}

function TaskFlow() {
  const [tasks, setTasks] = useState<Task[]>(readTasks);
  const [filter, setFilter] = useState<Filter>('all');
  const [activeNav, setActiveNav] = useState<'home' | Filter>('home');
  const [theme, setTheme] = useState<Theme>(readTheme);
  const [newTitle, setNewTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  useEffect(() => {
    window.localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const activeCount = tasks.filter((task) => !task.completed).length;
  const completedCount = tasks.length - activeCount;
  const progress = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;
  const visibleTasks = useMemo(() => {
    if (filter === 'active') return tasks.filter((task) => !task.completed);
    if (filter === 'completed') return tasks.filter((task) => task.completed);
    return tasks;
  }, [filter, tasks]);

  const addTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = newTitle.trim();
    if (!title) return;
    setTasks((current) => [
      { id: `task-${Date.now()}`, title, completed: false, category: 'Quick win', due: 'Today' },
      ...current,
    ]);
    setNewTitle('');
  };

  const toggleTask = (id: string) => {
    setTasks((current) => current.map((task) => (
      task.id === id ? { ...task, completed: !task.completed } : task
    )));
  };

  const removeTask = (id: string) => {
    setTasks((current) => current.filter((task) => task.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const startEditing = (task: Task) => {
    setEditingId(task.id);
    setEditingTitle(task.title);
  };

  const finishEditing = () => {
    if (!editingId) return;
    const title = editingTitle.trim();
    if (title) {
      setTasks((current) => current.map((task) => (
        task.id === editingId ? { ...task, title } : task
      )));
    }
    setEditingId(null);
    setEditingTitle('');
  };

  const filterLabel = filter === 'all' ? 'all your tasks' : filter === 'active' ? 'active tasks' : 'completed tasks';

  return (
    <div className="task-app">
      <aside className="sidebar" aria-label="TaskFlow navigation">
        <div>
          <div className="sidebar-top">
            <div className="brand" data-testid="text-brand">
              <span className="brand-mark" aria-hidden="true"><Check /></span>
              <span>TaskFlow</span>
            </div>
            <nav className="sidebar-nav" aria-label="Task views">
              <button
                type="button"
                className={`nav-item ${activeNav === 'home' ? 'active' : ''}`}
                onClick={() => { setFilter('all'); setActiveNav('home'); }}
                aria-pressed={activeNav === 'home'}
                data-testid="button-nav-home"
              >
                <House /><span>Home</span>
              </button>
              <button
                type="button"
                className={`nav-item ${activeNav === 'all' ? 'active' : ''}`}
                onClick={() => { setFilter('all'); setActiveNav('all'); }}
                aria-pressed={activeNav === 'all'}
                data-testid="button-nav-all"
              >
                <ListFilter /><span>All Tasks</span>
              </button>
              <button
                type="button"
                className={`nav-item ${activeNav === 'active' ? 'active' : ''}`}
                onClick={() => { setFilter('active'); setActiveNav('active'); }}
                aria-pressed={activeNav === 'active'}
                data-testid="button-nav-active"
              >
                <Clock3 /><span>Active</span>
              </button>
              <button
                type="button"
                className={`nav-item ${activeNav === 'completed' ? 'active' : ''}`}
                onClick={() => { setFilter('completed'); setActiveNav('completed'); }}
                aria-pressed={activeNav === 'completed'}
                data-testid="button-nav-completed"
              >
                <CheckCircle2 /><span>Completed</span>
              </button>
            </nav>
          </div>
        </div>
        <div className="sidebar-note">
          <strong>Small steps make big progress.</strong>
          <span aria-hidden="true">·</span>
        </div>
      </aside>

      <main className="main-content">
        <div className="content-wrap">
          <header className="topbar">
            <div>
              <p className="eyebrow">A clear place to begin</p>
              <h1 className="page-title" data-testid="text-page-title">My Tasks</h1>
              <p className="page-subtitle" data-testid="text-page-subtitle">
                Stay organized, focused and productive.
              </p>
            </div>
            <button
              type="button"
              className="theme-toggle"
              onClick={() => setTheme((current) => current === 'light' ? 'dark' : 'light')}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              data-testid="button-theme-toggle"
            >
              {theme === 'light' ? <Moon /> : <Sun />}
            </button>
          </header>

          <form className="composer" onSubmit={addTask}>
            <label className="sr-only" htmlFor="new-task">What do you need to get done?</label>
            <input
              id="new-task"
              className="task-input"
              value={newTitle}
              onChange={(event) => setNewTitle(event.target.value)}
              placeholder="What do you need to get done?"
              autoComplete="off"
              data-testid="input-new-task"
            />
            <button type="submit" className="add-button" data-testid="button-add-task">
              <Plus /> Add Task
            </button>
          </form>

          <div className="toolbar">
            <div className="filter-tabs" role="tablist" aria-label="Filter tasks">
              {(['all', 'active', 'completed'] as Filter[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`filter-tab ${filter === item ? 'active' : ''}`}
                  onClick={() => { setFilter(item); setActiveNav(item); }}
                  role="tab"
                  aria-selected={filter === item}
                  data-testid={`button-filter-${item}`}
                >
                  {item[0].toUpperCase() + item.slice(1)}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="clear-button"
              onClick={() => setTasks((current) => current.filter((task) => !task.completed))}
              disabled={completedCount === 0}
              data-testid="button-clear-completed"
            >
              <Trash2 /> Clear Completed
            </button>
          </div>

          <section aria-live="polite" aria-label={filterLabel}>
            {visibleTasks.length > 0 ? (
              <div className="task-list">
                {visibleTasks.map((task, index) => (
                  <article
                    className={`task-card ${task.completed ? 'completed' : ''}`}
                    key={task.id}
                    style={{ animationDelay: `${Math.min(index * 45, 180)}ms` }}
                    data-testid={`card-task-${task.id}`}
                  >
                    <button
                      type="button"
                      className={`task-check ${task.completed ? 'checked' : ''}`}
                      onClick={() => toggleTask(task.id)}
                      aria-label={task.completed ? `Mark "${task.title}" active` : `Complete "${task.title}"`}
                      aria-pressed={task.completed}
                      data-testid={`button-toggle-task-${task.id}`}
                    >
                      {task.completed && <Check />}
                    </button>
                    <div className="task-body">
                      {editingId === task.id ? (
                        <input
                          className="edit-input"
                          value={editingTitle}
                          onChange={(event) => setEditingTitle(event.target.value)}
                          onBlur={finishEditing}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') finishEditing();
                            if (event.key === 'Escape') {
                              setEditingId(null);
                              setEditingTitle('');
                            }
                          }}
                          aria-label="Edit task title"
                          autoFocus
                          data-testid={`input-edit-task-${task.id}`}
                        />
                      ) : (
                        <button
                          type="button"
                          className={`task-title ${task.completed ? 'completed' : ''}`}
                          onClick={() => startEditing(task)}
                          aria-label={`Edit task "${task.title}"`}
                          data-testid={`button-edit-title-${task.id}`}
                        >
                          {task.title}
                        </button>
                      )}
                      <div className="task-meta">
                        <span><Clock3 />{task.due}</span>
                        <span className="tag">{task.category}</span>
                      </div>
                    </div>
                    <div className="task-actions">
                      <button
                        type="button"
                        className="icon-button"
                        onClick={() => startEditing(task)}
                        aria-label={`Edit "${task.title}"`}
                        title="Edit task"
                        data-testid={`button-edit-task-${task.id}`}
                      >
                        <Pencil />
                      </button>
                      <button
                        type="button"
                        className="icon-button danger"
                        onClick={() => removeTask(task.id)}
                        aria-label={`Delete "${task.title}"`}
                        title="Delete task"
                        data-testid={`button-delete-task-${task.id}`}
                      >
                        <Trash2 />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-state" data-testid="empty-task-state">
                <div className="empty-icon" aria-hidden="true">
                  {filter === 'completed' ? <CheckCircle2 /> : <ClipboardList />}
                </div>
                <h2>{filter === 'completed' ? 'Nothing completed yet' : filter === 'active' ? 'You are all caught up' : 'Your list is clear'}</h2>
                <p>
                  {filter === 'completed'
                    ? 'Finished tasks will collect here as you make progress.'
                    : filter === 'active'
                      ? 'Take a breath. Enjoy the space, or add the next small step.'
                      : 'Add one small step above to get moving.'}
                </p>
              </div>
            )}
          </section>

          <footer className="summary" data-testid="task-summary">
            <strong data-testid="text-active-count">{activeCount} {activeCount === 1 ? 'task' : 'tasks'} remaining</strong>
            <div className="progress-track" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label={`${progress}% complete`}>
              <div className="progress-bar" style={{ width: `${progress}%` }} />
            </div>
            <span data-testid="text-completion-progress">{progress}% complete</span>
          </footer>
        </div>
      </main>
    </div>
  );
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={TaskFlow} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;