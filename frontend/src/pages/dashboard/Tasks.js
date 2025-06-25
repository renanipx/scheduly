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
          observation
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
    } catch (err) {
      setError('Error creating task.');
    }
  };

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  return (
    <div className="tasks-component full-screen-tasks with-list">
      <div className="task-form-container">
        <form onSubmit={handleSubmit} className="task-form">
          <h2>Tasks</h2>
          <p className="task-subtitle">Add a new task to organize your day.</p>
          <input
            type="text"
            placeholder="Task title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
          <input
            type="date"
            placeholder="Date"
            value={date}
            onChange={e => setDate(e.target.value)}
            required
          />
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            required
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          <textarea
            placeholder="Observation"
            value={observation}
            onChange={e => setObservation(e.target.value)}
          />
          <button type="submit">Create Task</button>
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
        <div className="task-list-scroll">
          {tasks.length === 0 ? (
            <div className="no-tasks-message">No tasks found.</div>
          ) : (
            tasks.map(task => (
              <div className="task-card" key={task.id}>
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
  );
};

export default Tasks; 