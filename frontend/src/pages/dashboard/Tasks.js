import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(process.env.REACT_APP_BACKEND_URL + '/api/tasks', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTasks(response.data);
      } catch (err) {
        setError('Error fetching tasks.');
      }
    };
    fetchTasks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('token');
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
      setTitle('');
      setDescription('');
      setDate('');
      setStatus('Pending');
      setObservation('');
      setStartTime('');
      setEndTime('');
    } catch (err) {
      setError('Error creating task.');
    }
  };

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
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

  return (
    <div className="tasks-component full-screen-tasks with-list">
      <div className="tasks-panels-row" style={{ display: 'flex', width: '100%', height: '100%' }}>
        <div className="task-form-container" style={{ maxWidth: 420, width: '100%' }}>
          <form onSubmit={handleSubmit} className="task-form">
            <h2>Tasks</h2>
            <p className="task-subtitle">Add a new task to organize your day.</p>

            <div style={{ display: 'flex', gap: 12, marginBottom: 18, alignItems: 'flex-end', width: '100%' }}>
              <div style={{ flex: 1, width: '100%' }}>
                <label htmlFor="task-title" style={{ display: 'block', textAlign: 'left', fontWeight: 500, color: '#555', marginBottom: 2, lineHeight: 1.2 }}>Task Title *</label>
                <input
                  id="task-title"
                  type="text"
                  placeholder="Enter the task title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                  style={{ marginBottom: 0, width: '100%', height: 44, fontSize: '0.98rem', padding: '8px 12px' }}
                />
              </div>
              <div style={{ flex: 1, width: '100%' }}>
                <label htmlFor="status" style={{ display: 'block', textAlign: 'left', fontWeight: 500, color: '#555', marginBottom: 2, lineHeight: 1.2 }}>Status *</label>
                <select
                  id="status"
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  required
                  style={{ marginBottom: 0, width: '100%', height: 44, fontSize: '0.98rem', padding: '8px 12px' }}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginBottom: 18, width: '100%' }}>
              <div style={{ flex: 1, width: '100%' }}>
                <label htmlFor="task-date" style={{ display: 'block', textAlign: 'left', fontWeight: 500, color: '#555', marginBottom: 2 }}>Date *</label>
                <input
                  id="task-date"
                  type="date"
                  placeholder="dd/mm/yyyy"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  required
                  style={{ width: '100%', marginBottom: 0, height: 44, fontSize: '0.98rem', padding: '8px 12px' }}
                />
              </div>
              <div style={{ flex: 1, width: '100%' }}>
                <label htmlFor="start-time" style={{ display: 'block', textAlign: 'left', fontWeight: 500, color: '#555', marginBottom: 2 }}>Start Time *</label>
                <input
                  id="start-time"
                  type="time"
                  placeholder="Start Time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  required
                  style={{ width: '100%', marginBottom: 0, height: 44, fontSize: '0.98rem', padding: '8px 8px' }}
                />
              </div>
              <div style={{ flex: 1, width: '100%' }}>
                <label htmlFor="end-time" style={{ display: 'block', textAlign: 'left', fontWeight: 500, color: '#555', marginBottom: 2 }}>End Time *</label>
                <input
                  id="end-time"
                  type="time"
                  placeholder="End Time"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  required
                  style={{ width: '100%', marginBottom: 0, height: 44, fontSize: '0.98rem', padding: '8px 8px' }}
                />
              </div>
            </div>

            <label htmlFor="task-desc" style={{ display: 'block', textAlign: 'left', fontWeight: 500, color: '#555', marginBottom: 2 }}>Description</label>
            <textarea
              id="task-desc"
              placeholder="Describe the task (optional)"
              value={description}
              onChange={e => setDescription(e.target.value)}
              style={{ marginBottom: 10, width: '100%', fontSize: '0.98rem', padding: '8px 12px', height: 90, resize: 'vertical' }}
            />

            <label htmlFor="observation" style={{ display: 'block', textAlign: 'left', fontWeight: 500, color: '#555', marginBottom: 2 }}>Observation</label>
            <textarea
              id="observation"
              placeholder="Any additional notes (optional)"
              value={observation}
              onChange={e => setObservation(e.target.value)}
              style={{ marginBottom: 16, width: '100%', fontSize: '0.98rem', padding: '8px 12px', height: 60, resize: 'vertical' }}
            />

            {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}

            <button
              type="submit"
              disabled={!title || !date || !startTime || !endTime || !status}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <span style={{ fontSize: 18, fontWeight: 600 }}>+</span> Create Task
            </button>
          </form>
        </div>
        <div className="task-list-panel">
          <div className="task-list-filters">
            <input type="text" placeholder="Search by task name..." className="task-filter-input" />
            <input type="date" className="task-filter-input" />
            <select className="task-filter-input">
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div className="task-list-scroll" style={{ maxWidth: 420, margin: '0 auto' }}>
            {tasks.length === 0 ? (
              <div className="no-tasks-message">No tasks found.</div>
            ) : (
              tasks.map(task => (
                <div className="task-card" key={task.id} style={{ maxWidth: 420, margin: '0 auto' }}>
                  <div className="task-card-title">{task.title}</div>
                  <div className="task-card-date" style={{ marginBottom: 4 }}>{formatDate(task.date)}</div>
                  <div className="task-card-row">
                    <span className="task-card-status">{task.status}</span>
                  </div>
                  <div>{task.description}</div>
                  {task.observation && (
                    <div className="task-card-observation">{task.observation}</div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tasks; 