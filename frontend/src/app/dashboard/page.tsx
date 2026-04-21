"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  api,
  Task,
  TaskListResponse,
  CreateTaskData,
  UpdateTaskData,
  ApiError,
} from "@/lib/api";

type ToastType = "success" | "error" | "info";

interface Toast {
  message: string;
  type: ToastType;
  id: number;
}

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  // Task state
  const [taskData, setTaskData] = useState<TaskListResponse | null>(null);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [search, setSearch] = useState("");
  const [searchDebounce, setSearchDebounce] = useState("");

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

  // Toast state
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { message, type, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setSearchDebounce(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoadingTasks(true);
    try {
      const data = await api.getTasks({
        page,
        per_page: 10,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        search: searchDebounce || undefined,
      });
      setTaskData(data);
    } catch (err) {
      const apiErr = err as ApiError;
      showToast(apiErr.detail || "Failed to load tasks", "error");
    } finally {
      setLoadingTasks(false);
    }
  }, [isAuthenticated, page, statusFilter, priorityFilter, searchDebounce]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Handlers
  const handleCreateTask = async (data: CreateTaskData) => {
    try {
      await api.createTask(data);
      showToast("Task created successfully!", "success");
      setShowCreateModal(false);
      fetchTasks();
    } catch (err) {
      const apiErr = err as ApiError;
      showToast(apiErr.detail || "Failed to create task", "error");
    }
  };

  const handleUpdateTask = async (id: string, data: UpdateTaskData) => {
    try {
      await api.updateTask(id, data);
      showToast("Task updated successfully!", "success");
      setEditingTask(null);
      fetchTasks();
    } catch (err) {
      const apiErr = err as ApiError;
      showToast(apiErr.detail || "Failed to update task", "error");
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await api.deleteTask(id);
      showToast("Task deleted successfully!", "success");
      setDeletingTaskId(null);
      fetchTasks();
    } catch (err) {
      const apiErr = err as ApiError;
      showToast(apiErr.detail || "Failed to delete task", "error");
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Stats
  const stats = {
    total: taskData?.total || 0,
    todo: taskData?.tasks.filter((t) => t.status === "todo").length || 0,
    inProgress:
      taskData?.tasks.filter((t) => t.status === "in_progress").length || 0,
    done: taskData?.tasks.filter((t) => t.status === "done").length || 0,
  };

  if (isLoading) {
    return (
      <div className="page-loader">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Toasts */}
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      ))}

      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-brand">
          <div className="logo-icon">⚡</div>
          <span>PrimeTrade</span>
        </div>

        <div className="navbar-actions">
          <div className="navbar-user">
            <span>{user?.username}</span>
            <span className={`role-badge role-${user?.role}`}>
              {user?.role}
            </span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </nav>

      {/* Dashboard */}
      <main className="dashboard">
        <div className="dashboard-header">
          <div>
            <h1>Task Dashboard</h1>
            <p>
              Welcome back, {user?.full_name || user?.username}. Here are your
              tasks.
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            + New Task
          </button>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-label">Total Tasks</div>
            <div className="stat-value">{stats.total}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📝</div>
            <div className="stat-label">To Do</div>
            <div className="stat-value" style={{ color: "var(--status-todo)" }}>
              {stats.todo}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🔄</div>
            <div className="stat-label">In Progress</div>
            <div
              className="stat-value"
              style={{ color: "var(--status-progress)" }}
            >
              {stats.inProgress}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-label">Done</div>
            <div className="stat-value" style={{ color: "var(--status-done)" }}>
              {stats.done}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <div className="search-input">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <select
            className="form-select"
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        {/* Tasks List */}
        {loadingTasks ? (
          <div className="page-loader" style={{ minHeight: "30vh" }}>
            <div className="spinner"></div>
            <p>Loading tasks...</p>
          </div>
        ) : taskData && taskData.tasks.length > 0 ? (
          <>
            <div className="tasks-list">
              {taskData.tasks.map((task) => (
                <div key={task.id} className="task-card">
                  <div className="task-content">
                    <div className="task-title">{task.title}</div>
                    {task.description && (
                      <div className="task-description">{task.description}</div>
                    )}
                    <div className="task-meta">
                      <span className={`badge badge-${task.status}`}>
                        {task.status === "in_progress"
                          ? "In Progress"
                          : task.status === "todo"
                          ? "To Do"
                          : "Done"}
                      </span>
                      <span className={`badge badge-${task.priority}`}>
                        {task.priority}
                      </span>
                      {task.due_date && (
                        <span className="task-date">
                          Due:{" "}
                          {new Date(task.due_date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      )}
                      <span className="task-date">
                        Created:{" "}
                        {new Date(task.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="task-actions">
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setEditingTask(task)}
                      title="Edit task"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setDeletingTaskId(task.id)}
                      title="Delete task"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {taskData.total_pages > 1 && (
              <div className="pagination">
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  ← Prev
                </button>
                <span className="pagination-info">
                  Page {taskData.page} of {taskData.total_pages} ({taskData.total}{" "}
                  tasks)
                </span>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={page >= taskData.total_pages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No tasks yet</h3>
            <p>Create your first task to get started</p>
            <button
              className="btn btn-primary"
              onClick={() => setShowCreateModal(true)}
            >
              + Create Task
            </button>
          </div>
        )}
      </main>

      {/* Create Task Modal */}
      {showCreateModal && (
        <TaskFormModal
          title="Create New Task"
          onSubmit={handleCreateTask}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <TaskFormModal
          title="Edit Task"
          initialData={editingTask}
          onSubmit={(data) => handleUpdateTask(editingTask.id, data)}
          onClose={() => setEditingTask(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingTaskId && (
        <div
          className="modal-overlay"
          onClick={() => setDeletingTaskId(null)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Task</h2>
              <button
                className="btn btn-ghost btn-icon"
                onClick={() => setDeletingTaskId(null)}
              >
                ✕
              </button>
            </div>
            <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>
              Are you sure you want to delete this task? This action cannot be
              undone.
            </p>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setDeletingTaskId(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleDeleteTask(deletingTaskId)}
              >
                Delete Task
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ===== Task Form Modal Component ===== */

interface TaskFormModalProps {
  title: string;
  initialData?: Task;
  onSubmit: (data: CreateTaskData | UpdateTaskData) => Promise<void>;
  onClose: () => void;
}

function TaskFormModal({
  title,
  initialData,
  onSubmit,
  onClose,
}: TaskFormModalProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    status: initialData?.status || "todo",
    priority: initialData?.priority || "medium",
    due_date: initialData?.due_date
      ? new Date(initialData.due_date).toISOString().slice(0, 16)
      : "",
  });
  const [submitting, setSubmitting] = useState(false);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const payload: CreateTaskData | UpdateTaskData = {
      title: formData.title,
      description: formData.description || undefined,
      status: formData.status,
      priority: formData.priority,
      due_date: formData.due_date
        ? new Date(formData.due_date).toISOString()
        : undefined,
    };
    await onSubmit(payload);
    setSubmitting(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            ✕
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="task-title">
              Title
            </label>
            <input
              id="task-title"
              type="text"
              className="form-input"
              placeholder="Enter task title"
              value={formData.title}
              onChange={(e) => updateField("title", e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="task-desc">
              Description
            </label>
            <textarea
              id="task-desc"
              className="form-textarea"
              placeholder="Optional description..."
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="task-status">
                Status
              </label>
              <select
                id="task-status"
                className="form-select"
                value={formData.status}
                onChange={(e) => updateField("status", e.target.value)}
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="task-priority">
                Priority
              </label>
              <select
                id="task-priority"
                className="form-select"
                value={formData.priority}
                onChange={(e) => updateField("priority", e.target.value)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="task-due">
              Due Date
            </label>
            <input
              id="task-due"
              type="datetime-local"
              className="form-input"
              value={formData.due_date}
              onChange={(e) => updateField("due_date", e.target.value)}
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }}></span>
                  Saving...
                </>
              ) : initialData ? (
                "Update Task"
              ) : (
                "Create Task"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
