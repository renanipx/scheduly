import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../../assets/Dashboard.css';
import '../../assets/Tasks.css';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('Pending');
  const [observation, setObservation] = useState('');
  const [error, setError] = useState('');
  const today = new Date().toISOString().slice(0, 10);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const formContainerRef = useRef(null);
  const [formHeight, setFormHeight] = useState(0);
  const [filterTitle, setFilterTitle] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem('token');
        const params = new URLSearchParams();
        if (filterTitle) params.append('title', filterTitle);
        if (filterDate) params.append('date', filterDate);
        if (filterStatus) params.append('status', filterStatus);
        const response = await axios.get(
          process.env.REACT_APP_BACKEND_URL + '/api/tasks?' + params.toString(),
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTasks(response.data);
      } catch (err) {
        setError('Error fetching tasks.');
      }
    };
    fetchTasks();
  }, [filterTitle, filterDate, filterStatus]);

  useEffect(() => {
    function updateFormHeight() {
      if (formContainerRef.current) {
        setFormHeight(formContainerRef.current.offsetHeight);
      }
    }
    updateFormHeight();

    // Usar ResizeObserver para detectar mudanças de tamanho
    let observer = null;
    if (formContainerRef.current && 'ResizeObserver' in window) {
      observer = new ResizeObserver(() => {
        updateFormHeight();
      });
      observer.observe(formContainerRef.current);
    }

    window.addEventListener('resize', updateFormHeight);

    return () => {
      window.removeEventListener('resize', updateFormHeight);
      if (observer && formContainerRef.current) {
        observer.unobserve(formContainerRef.current);
      }
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate required fields
    if (!title || !date || !startTime || !endTime || !status) {
      setError("Please fill in all required fields.");
      return;
    }

    // Validate if end time is after start time
    if (startTime && endTime && startTime >= endTime) {
      setError('End time must be after start time.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (isEditing && selectedTask) {
        // Atualizar tarefa existente
        const response = await axios.put(
          `${process.env.REACT_APP_BACKEND_URL}/api/tasks/${selectedTask._id}`,
          {
            title,
            description,
            date,
            status,
            observation,
            startTime,
            endTime
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setTasks(tasks =>
          tasks.map(t => t._id === selectedTask._id ? response.data : t)
        );
        setSelectedTask(response.data);
        setIsEditing(false);
      } else {
        // Criar nova tarefa
        const response = await axios.post(
          process.env.REACT_APP_BACKEND_URL + '/api/tasks',
          {
            title,
            description,
            date,
            status,
            observation,
            startTime,
            endTime
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setTasks([...tasks, response.data]);
      }
      // Limpar formulário após salvar/criar
      setTitle('');
      setDescription('');
      setDate('');
      setStatus('Pending');
      setObservation('');
      setStartTime('');
      setEndTime('');
      setSelectedTask(null);
      setIsEditing(false);
    } catch (err) {
      setError(isEditing ? 'Error updating task.' : 'Error creating task.');
    }
  };

  function formatDate(dateStr) {
    if (!dateStr) return '';
    let year, month, day;
    if (dateStr.includes('T')) {
      // ISO format: use UTC to get the correct day
      const d = new Date(dateStr);
      year = d.getUTCFullYear();
      month = d.getUTCMonth() + 1;
      day = d.getUTCDate();
    } else {
      // 'YYYY-MM-DD'
      [year, month, day] = dateStr.split('-').map(Number);
    }
    // Always show as local string, but with correct day
    const date = new Date(year, month - 1, day);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function calculateTotalHours(start, end) {
    if (!start || !end) return '';
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    let diff = (endH * 60 + endM) - (startH * 60 + startM);
    if (diff < 0) diff += 24 * 60;
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  // Quick summary of tasks
  const summary = tasks.reduce(
    (acc, t) => {
      const isOverdue = t.status !== 'Completed' && new Date(t.date) < new Date();
      acc.total++;
      if (isOverdue) {
        acc.overdue++;
      } else if (t.status === 'Pending') {
        acc.pending++;
      } else if (t.status === 'In Progress') {
        acc.inProgress++;
      } else if (t.status === 'Completed') {
        acc.completed++;
      }
      return acc;
    },
    { total: 0, pending: 0, inProgress: 0, completed: 0, overdue: 0 }
  );

  // Function to get the color of the status badge
  function getStatusColor(status) {
    switch (status) {
      case 'Completed': return '#4caf50';
      case 'In Progress': return '#ff9800';
      case 'Pending': return '#2196f3';
      default: return '#888';
    }
  }

  // Function to check if the task is overdue
  function isOverdue(task) {
    return task.status !== 'Completed' && new Date(task.date) < new Date();
  }

  const sortedTasks = [...tasks].sort((a, b) => new Date(b.date) - new Date(a.date));

  const handleSelectTask = (task) => {
    setSelectedTask(task);
    setTitle(task.title || '');
    setDescription(task.description || '');
    let dateValue = '';
    if (task.date) {
      if (task.date.length >= 10) {
        dateValue = task.date.slice(0, 10);
      }
    }
    setDate(dateValue);
    setStatus(task.status || 'Pending');
    setObservation(task.observation || '');
    setStartTime(task.startTime || '');
    setEndTime(task.endTime || '');
  };

  const handleEdit = (task) => {
    setSelectedTask(task);
    setIsEditing(true);
    setTitle(task.title || '');
    setDescription(task.description || '');
    let dateValue = '';
    if (task.date) {
      if (task.date.length >= 10) {
        dateValue = task.date.slice(0, 10);
      }
    }
    setDate(dateValue);
    setStatus(task.status || 'Pending');
    setObservation(task.observation || '');
    setStartTime(task.startTime || '');
    setEndTime(task.endTime || '');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedTask(null);
    setTitle('');
    setDescription('');
    setDate('');
    setStatus('Pending');
    setObservation('');
    setStartTime('');
    setEndTime('');
  };

  const handleComplete = async (task) => {
    setSelectedTask(task);
    if (!task || task.status === 'Completed') return;
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/tasks/${task._id}`,
        { ...task, status: 'Completed' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks(tasks =>
        tasks.map(t => t._id === task._id ? { ...t, status: 'Completed' } : t)
      );
      setSelectedTask({ ...task, status: 'Completed' });
    } catch (err) {
      setError('Error completing task.');
    }
  };

  const askDeleteTask = (task) => {
    setTaskToDelete(task);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;
    setShowDeleteConfirm(false);
    setTaskToDelete(null);
    await handleDelete(taskToDelete);
  };

  const cancelDeleteTask = () => {
    setShowDeleteConfirm(false);
    setTaskToDelete(null);
  };

  const handleDelete = async (task) => {
    setSelectedTask(task);
    if (!task) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${process.env.REACT_APP_BACKEND_URL}/api/tasks/${task._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks(tasks => tasks.filter(t => t._id !== task._id));
      setSelectedTask(null);
      setIsEditing(false);
      setTitle('');
      setDescription('');
      setDate('');
      setStatus('Pending');
      setObservation('');
      setStartTime('');
      setEndTime('');
    } catch (err) {
      setError('Error deleting task.');
    }
  };

  return (
    <div className="tasks-component full-screen-tasks with-list">
      <div className="tasks-panels-row" style={{ display: 'flex', width: '100%', height: '100%' }}>
        <div className="task-form-container" ref={formContainerRef} style={{ maxWidth: 420, width: '100%' }}>
          <form onSubmit={handleSubmit} className="task-form">
            <h2>Tasks</h2>
            <p className="task-subtitle">Add a new task to organize your day.</p>

            <div className="task-form-row">
              <div className="task-form-col">
                <label htmlFor="task-title" className="task-form-label">Task Title *</label>
                <input
                  id="task-title"
                  type="text"
                  placeholder="Enter the task title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                  className="task-form-input"
                  disabled={!isEditing && selectedTask}
                />
              </div>
              <div className="task-form-col">
                <label htmlFor="status" className="task-form-label">Status *</label>
                <select
                  id="status"
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  required
                  className="task-form-input"
                  disabled={!isEditing && selectedTask}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="task-form-row">
              <div className="task-form-col">
                <label htmlFor="task-date" className="task-form-label">Date *</label>
                <input
                  id="task-date"
                  type="date"
                  placeholder="dd/mm/yyyy"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  required
                  className="task-form-input"
                  disabled={!isEditing && selectedTask}
                />
              </div>
              <div className="task-form-col">
                <label htmlFor="start-time" className="task-form-label">Start Time *</label>
                <input
                  id="start-time"
                  type="time"
                  placeholder="Start Time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  required
                  className="task-form-input"
                  disabled={!isEditing && selectedTask}
                />
              </div>
              <div className="task-form-col">
                <label htmlFor="end-time" className="task-form-label">End Time *</label>
                <input
                  id="end-time"
                  type="time"
                  placeholder="End Time"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  required
                  className="task-form-input"
                  disabled={!isEditing && selectedTask}
                />
              </div>
            </div>

            <label htmlFor="task-desc" className="task-form-label">Description</label>
            <textarea
              id="task-desc"
              placeholder="Describe the task (optional)"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="task-form-textarea"
              disabled={!isEditing && selectedTask}
            />

            <label htmlFor="observation" className="task-form-label">Observation</label>
            <textarea
              id="observation"
              placeholder="Any additional notes (optional)"
              value={observation}
              onChange={e => setObservation(e.target.value)}
              className="task-form-textarea"
              disabled={!isEditing && selectedTask}
            />

            {error && <div className="task-form-error">{error}</div>}

            {/* Botões do formulário organizados em flex, com lógica para cada estado */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              {isEditing ? (
                <>
                  <button
                    type="button"
                    className="task-form-cancel"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="task-form-submit"
                  >
                    <span className="task-form-submit-icon">💾</span> Save Changes
                  </button>
                </>
              ) : selectedTask ? (
                <button
                  type="button"
                  className="task-form-submit"
                  onClick={() => {
                    setSelectedTask(null);
                    setIsEditing(false);
                    setTitle('');
                    setDescription('');
                    setDate('');
                    setStatus('Pending');
                    setObservation('');
                    setStartTime('');
                    setEndTime('');
                  }}
                >
                  Create New Task
                </button>
              ) : (
                <button
                  type="submit"
                  className="task-form-submit"
                >
                  <span className="task-form-submit-icon">+</span> Create Task
                </button>
              )}
            </div>
          </form>
        </div>
        <div className="task-list-panel"
          style={{ maxHeight: formHeight ? `${formHeight}px` : undefined, overflowY: "auto" }}
        >
          <div className="stats-grid" style={{ marginBottom: '18px', marginTop: '0', width: '100%' }}>
            <div className="stat-card total">
              <div className="stat-icon"><i className="fas fa-list-alt"></i></div>
              <div className="stat-info">
                <h3>Total Tasks</h3>
                <p>{summary.total}</p>
              </div>
            </div>
            <div className="stat-card completed">
              <div className="stat-icon"><i className="fas fa-check-circle"></i></div>
              <div className="stat-info">
                <h3>Completed</h3>
                <p>{summary.completed}</p>
              </div>
            </div>
            <div className="stat-card inprogress">
              <div className="stat-icon"><i className="fas fa-spinner"></i></div>
              <div className="stat-info">
                <h3>In Progress</h3>
                <p>{summary.inProgress}</p>
              </div>
            </div>
            <div className="stat-card pending">
              <div className="stat-icon"><i className="fas fa-hourglass-half"></i></div>
              <div className="stat-info">
                <h3>Pending</h3>
                <p>{summary.pending}</p>
              </div>
            </div>
            <div className="stat-card overdue">
              <div className="stat-icon"><i className="fas fa-exclamation-triangle"></i></div>
              <div className="stat-info">
                <h3>Overdue</h3>
                <p>{summary.overdue}</p>
              </div>
            </div>
          </div>
          <div className="task-list-filters">
            <input
              type="text"
              placeholder="Search by task name..."
              className="task-filter-input"
              value={filterTitle}
              onChange={e => setFilterTitle(e.target.value)}
            />
            <input
              type="date"
              className="task-filter-input"
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
            />
            <select
              className="task-filter-input"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="status-legend">
            <span className="status-legend-item">
              <span className="status-legend-color status-legend-pending"></span>
              Pending
            </span>
            <span className="status-legend-item">
              <span className="status-legend-color status-legend-inprogress"></span>
              In Progress
            </span>
            <span className="status-legend-item">
              <span className="status-legend-color status-legend-completed"></span>
              Completed
            </span>
            <span className="status-legend-item">
              <span className="status-legend-color status-legend-overdue"></span>
              Overdue
            </span>
          </div>
          <div
            className="task-list-scroll"

          >
            {sortedTasks.length === 0 ? (
              <div className="no-tasks-message">No tasks found.</div>
            ) : (
              <table className="tasks-table">
                <thead>
                  <tr>
                    <th className="col-title">Title</th>
                    <th className="col-date">Date</th>
                    <th className="col-time">Start/End</th>
                    <th className="col-status">Status</th>
                    <th className="col-overdue">Overdue</th>
                    <th className="col-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedTasks.map(task => (
                    <tr
                      key={task._id}
                      onClick={() => handleSelectTask(task)}
                      className={selectedTask && selectedTask._id === task._id ? 'selected-task-row' : ''}
                      style={{ cursor: 'pointer' }}
                    >
                      <td className="col-title">{task.title && task.title.length > 100 ? task.title.slice(0, 100) + '...' : task.title}</td>
                      <td className="col-date">{formatDate(task.date)}</td>
                      <td className="col-time">{task.startTime} - {task.endTime}</td>
                      <td className="col-status">
                        <span className={`status-badge status-badge--${task.status.replace(/ /g, '').toLowerCase()}`}>{task.status}</span>
                      </td>
                      <td className="col-overdue">
                        {isOverdue(task) ? (
                          <span className="overdue-badge">Yes</span>
                        ) : (
                          <span className="not-overdue-badge">No</span>
                        )}
                      </td>
                      <td className="col-actions">
                        <div className="action-btns">
                          <button
                            title="Edit"
                            className="edit-btn"
                            onClick={e => { e.stopPropagation(); handleEdit(task); }}
                          >
                            ✏️
                          </button>
                          <button
                            title="Delete"
                            className="delete-btn"
                            onClick={e => { e.stopPropagation(); askDeleteTask(task); }}
                          >
                            🗑️
                          </button>
                          <button
                            title="Complete"
                            className="complete-btn"
                            disabled={task.status === 'Completed'}
                            onClick={e => { e.stopPropagation(); handleComplete(task); }}
                          >
                            ✔️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      {showDeleteConfirm && (
        <div className="delete-confirm-modal">
          <div className="delete-confirm-content">
            <p>Are you sure you want to delete this task?</p>
            <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
              <button onClick={confirmDeleteTask} className="delete-btn">Yes, delete</button>
              <button onClick={cancelDeleteTask} className="task-form-cancel">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks; 