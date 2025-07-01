import React, { useEffect, useState } from 'react';
import Calendar from './Calendar';
import '../../assets/Dashboard.css';
import { useUser } from '../../context/UserContext';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useUser();
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(process.env.REACT_APP_BACKEND_URL + '/api/tasks', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTasks(response.data);
      } catch (err) {
        setTasks([]);
      }
    };
    fetchTasks();
  }, []);

  // Helper to check if a task is overdue (same as calendar)
  function isTaskOverdue(task) {
    if (task.status === 'Completed') return false;
    let year, month, day;
    if (task.date.includes('T')) {
      const d = new Date(task.date);
      year = d.getUTCFullYear();
      month = d.getUTCMonth() + 1;
      day = d.getUTCDate();
    } else {
      [year, month, day] = task.date.split('-').map(Number);
    }
    let taskEnd = new Date(year, month - 1, day);
    if (task.endTime) {
      const [endHour, endMinute] = task.endTime.split(':').map(Number);
      taskEnd.setHours(endHour, endMinute, 0, 0);
    } else {
      taskEnd.setHours(23, 59, 59, 999);
    }
    const now = new Date();
    const today = new Date();
    today.setHours(0,0,0,0);
    const taskDay = new Date(year, month - 1, day);
    taskDay.setHours(0,0,0,0);

    if (taskDay < today) {
      return true;
    } else if (taskDay.getTime() === today.getTime()) {
      if (now > taskEnd) {
        return true;
      }
    }
    return false;
  }

  // Calculate stats
  let completedTasks = 0, inProgressTasks = 0, pendingTasks = 0, overdueTasks = 0;
  tasks.forEach(t => {
    const isOverdue = isTaskOverdue(t);
    if (isOverdue) {
      overdueTasks++;
    } else if (t.status === 'Pending') {
      pendingTasks++;
    } else if (t.status === 'In Progress') {
      inProgressTasks++;
    } else if (t.status === 'Completed') {
      completedTasks++;
    }
  });
  const totalTasks = tasks.length;

  return (
    <>
      <div className="welcome-section">
        <h1>Welcome back, {user?.name || user?.username || 'User'}!</h1>
        <p>Here's what's happening with your projects today.</p>
      </div>
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-icon"><i className="fas fa-list-alt"></i></div>
          <div className="stat-info">
            <h3>Total Tasks</h3>
            <p>{totalTasks}</p>
          </div>
        </div>
        <div className="stat-card completed">
          <div className="stat-icon"><i className="fas fa-check-circle"></i></div>
          <div className="stat-info">
            <h3>Completed</h3>
            <p>{completedTasks}</p>
          </div>
        </div>
        <div className="stat-card inprogress">
          <div className="stat-icon"><i className="fas fa-spinner"></i></div>
          <div className="stat-info">
            <h3>In Progress</h3>
            <p>{inProgressTasks}</p>
          </div>
        </div>
        <div className="stat-card pending">
          <div className="stat-icon"><i className="fas fa-hourglass-half"></i></div>
          <div className="stat-info">
            <h3>Pending</h3>
            <p>{pendingTasks}</p>
          </div>
        </div>
        <div className="stat-card overdue">
          <div className="stat-icon"><i className="fas fa-exclamation-triangle"></i></div>
          <div className="stat-info">
            <h3>Overdue</h3>
            <p>{overdueTasks}</p>
          </div>
        </div>
      </div>
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <Calendar />
        </div>
      </div>
    </>
  );
};

export default Dashboard; 