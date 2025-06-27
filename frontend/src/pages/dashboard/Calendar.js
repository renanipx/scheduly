import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CalendarLib from 'react-calendar'; 
import 'react-calendar/dist/Calendar.css';

const STATUS_COLORS = {
  'Completed': '#14532d', 
  'Pending': '#facc15',   
  'In Progress': '#4ade80', 
};

function getStatusColor(status) {
  return STATUS_COLORS[status] || '#e5e7eb';
}

const Calendar = () => {
  const [tasks, setTasks] = useState([]);
  const [view, setView] = useState('week');
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(process.env.REACT_APP_BACKEND_URL + '/api/tasks', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTasks(response.data);
      } catch (err) {
      }
    };
    fetchTasks();
  }, []);

  const tasksByDate = tasks.reduce((acc, task) => {
    const d = new Date(task.date).toISOString().slice(0, 10);
    if (!acc[d]) acc[d] = [];
    acc[d].push(task);
    return acc;
  }, {});

  function tileContent({ date, view }) {
    const d = date.toISOString().slice(0, 10);
    if (tasksByDate[d]) {
      const statuses = Array.from(new Set(tasksByDate[d].map(t => t.status)));
      return (
        <div style={{ display: 'flex', gap: 2, marginTop: 2 }}>
          {statuses.map(status => (
            <span key={status} style={{ width: 8, height: 8, borderRadius: '50%', background: getStatusColor(status), display: 'inline-block' }} title={status}></span>
          ))}
        </div>
      );
    }
    return null;
  }

  function renderTasksForSelectedDay() {
    const d = date.toISOString().slice(0, 10);
    if (!tasksByDate[d]) return <p>No tasks for this day.</p>;
    return (
      <ul style={{ padding: 0, listStyle: 'none' }}>
        {tasksByDate[d].map(task => (
          <li key={task.id} style={{ background: getStatusColor(task.status), color: '#222', margin: '4px 0', borderRadius: 4, padding: 6 }}>
            <strong>{task.title}</strong> <span style={{ fontSize: 12 }}>({task.status})</span>
            <div style={{ fontSize: 12 }}>{task.description}</div>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="calendar-component">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Calendar</h2>
        <div>
          <button onClick={() => setView('week')} style={{ marginRight: 8, background: view === 'week' ? '#4ade80' : '#e5e7eb' }}>Week</button>
          <button onClick={() => setView('month')} style={{ background: view === 'month' ? '#4ade80' : '#e5e7eb' }}>Month</button>
        </div>
      </div>
      <CalendarLib
        onChange={setDate}
        value={date}
        view={view}
        onViewChange={({ activeStartDate, view }) => setView(view)}
        tileContent={tileContent}
        calendarType="iso8601"
        showNeighboringMonth={false}
      />
      <div style={{ marginTop: 16 }}>
        <h4>Tasks for {date.toLocaleDateString()}</h4>
        {renderTasksForSelectedDay()}
      </div>
    </div>
  );
};

export default Calendar; 