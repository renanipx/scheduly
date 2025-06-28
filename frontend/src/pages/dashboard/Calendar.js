import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../assets/Calendar.css';

const STATUS_COLORS = {
  'Completed': '#14532d', 
  'Pending': '#facc15',   
  'In Progress': '#4ade80', 
  'Overdue': '#f87171', // soft red for better contrast
};

function getStatusColor(status) {
  return STATUS_COLORS[status] || '#e5e7eb';
}

// Returns the color for a task, including overdue logic
function getTaskColor(task) {
  const now = new Date();
  // Support both 'YYYY-MM-DD' and 'YYYY-MM-DDTHH:mm:ss.sssZ'
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

  // If status is completed, never overdue
  if (task.status === 'Completed') return STATUS_COLORS[task.status];

  // Build the task's end datetime
  if (task.endTime) {
    const [endHour, endMinute] = task.endTime.split(':').map(Number);
    taskEnd.setHours(endHour, endMinute, 0, 0);
  } else {
    // If no endTime, treat as end of day
    taskEnd.setHours(23, 59, 59, 999);
  }

  // Today logic
  const today = new Date();
  today.setHours(0,0,0,0);
  const taskDay = new Date(year, month - 1, day);
  taskDay.setHours(0,0,0,0);

  if (taskDay < today) {
    // Past day, not completed
    return STATUS_COLORS['Overdue'];
  } else if (taskDay.getTime() === today.getTime()) {
    // Today: only overdue if now > endTime
    if (now > taskEnd) {
      return STATUS_COLORS['Overdue'];
    }
  }
  // Future or still within time
  return STATUS_COLORS[task.status] || '#e5e7eb';
}

const Calendar = () => {
  const [tasks, setTasks] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(process.env.REACT_APP_BACKEND_URL + '/api/tasks', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTasks(response.data);
      } catch (err) {
        console.error('Error fetching tasks:', err);
      }
    };
    fetchTasks();
  }, []);

  // Handle date selection
  const handleDateSelect = (dateString) => {
    if (dateString) {
      const selectedDate = new Date(dateString);
      setCurrentWeek(selectedDate);
      setSelectedDate(dateString);
    }
  };

  // Get week days (Monday to Sunday)
  const getWeekDays = (date) => {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    start.setDate(diff);
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  };

  // Get time slots from 8:00 to 19:00
  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 19; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  };

  // Filter tasks for a specific day and time
  const getTasksForTimeSlot = (day, timeSlot) => {
    const dayStr = day.toISOString().slice(0, 10);
    const hour = parseInt(timeSlot.split(':')[0]);
    
    return tasks.filter(task => {
      const taskDate = new Date(task.date).toISOString().slice(0, 10);
      if (taskDate !== dayStr) return false;
      
      if (!task.startTime || !task.endTime) return false;
      
      const taskStartHour = parseInt(task.startTime.split(':')[0]);
      const taskEndHour = parseInt(task.endTime.split(':')[0]);
      
      return taskStartHour <= hour && taskEndHour > hour;
    });
  };

  const weekDays = getWeekDays(currentWeek);
  const timeSlots = getTimeSlots();

  const navigateWeek = (direction) => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + (direction * 7));
    setCurrentWeek(newWeek);
    setSelectedDate(''); // Clear selected date when navigating
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentWeek(today);
    setSelectedDate(today.toISOString().slice(0, 10));
  };

  const formatDate = (dateInput) => {
    if (!dateInput) return '';
    let year, month, day;
    if (typeof dateInput === 'string' && dateInput.includes('T')) {
      // ISO format: use UTC to get the correct day
      const d = new Date(dateInput);
      year = d.getUTCFullYear();
      month = d.getUTCMonth() + 1;
      day = d.getUTCDate();
    } else if (typeof dateInput === 'string') {
      // 'YYYY-MM-DD'
      [year, month, day] = dateInput.split('-').map(Number);
    } else if (dateInput instanceof Date) {
      year = dateInput.getFullYear();
      month = dateInput.getMonth() + 1;
      day = dateInput.getDate();
    } else {
      return '';
    }
    const date = new Date(year, month - 1, day);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="weekly-calendar">
      <div className="calendar-header">
        <button onClick={() => navigateWeek(-1)} className="nav-button">
          ← Previous Week
        </button>
        <div className="calendar-title-section">
          <h2>
            {weekDays[0].toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} - Week {Math.ceil((weekDays[0].getDate() + weekDays[0].getDay()) / 7)}
          </h2>
          <div className="date-controls">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateSelect(e.target.value)}
              className="date-picker"
              placeholder="Select date"
            />
            <button onClick={goToToday} className="today-button">
              Today
            </button>
            <div className="calendar-legend">
              <span style={{ display: 'inline-flex', alignItems: 'center', marginRight: 10 }}>
                <span style={{ width: 14, height: 14, borderRadius: '3px', background: STATUS_COLORS['Pending'], display: 'inline-block', marginRight: 4, border: '1px solid #e5e7eb' }}></span>
                Pending
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', marginRight: 10 }}>
                <span style={{ width: 14, height: 14, borderRadius: '3px', background: STATUS_COLORS['In Progress'], display: 'inline-block', marginRight: 4, border: '1px solid #e5e7eb' }}></span>
                In Progress
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', marginRight: 10 }}>
                <span style={{ width: 14, height: 14, borderRadius: '3px', background: STATUS_COLORS['Completed'], display: 'inline-block', marginRight: 4, border: '1px solid #e5e7eb' }}></span>
                Completed
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', marginRight: 0 }}>
                <span style={{ width: 14, height: 14, borderRadius: '3px', background: STATUS_COLORS['Overdue'], display: 'inline-block', marginRight: 4, border: '1px solid #e5e7eb' }}></span>
                Overdue
              </span>
            </div>
          </div>
        </div>
        <button onClick={() => navigateWeek(1)} className="nav-button">
          Next Week →
        </button>
      </div>

      <div className="calendar-grid">
        {/* Time column */}
        <div className="time-column">
          <div className="time-header">Time</div>
          {timeSlots.map((time) => (
            <div key={time} className="time-slot" style={{ height: 40, alignItems: 'flex-start', justifyContent: 'flex-start', paddingTop: 0, paddingBottom: 0 }}>
              {time}
            </div>
          ))}
        </div>

        {/* Days columns */}
        {weekDays.map((day, dayIndex) => (
          <div key={dayIndex} className="day-column">
            <div className={`day-header ${isToday(day) ? 'today' : ''}`}>
              <div className="day-name">{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
              <div className="day-date">{day.getDate()}</div>
            </div>
            
            {timeSlots.map((timeSlot, idx) => {
              // Last row (19:00) appears empty for visual closure
              if (idx === timeSlots.length - 1) {
                return <div key={timeSlot} className="time-cell" style={{ minHeight: 40 }}></div>;
              }
              const tasksForSlot = getTasksForTimeSlot(day, timeSlot);
              return (
                <div key={timeSlot} className="time-cell" style={{ minHeight: 40, verticalAlign: 'top', paddingTop: 0, paddingBottom: 0 }}>
                  {tasksForSlot.map(task => {
                    const shortTitle = task.title.length > 50 ? task.title.slice(0, 50) + '...' : task.title;
                    return (
                      <div 
                        key={task.id} 
                        className="task-item"
                        style={{ 
                          backgroundColor: getTaskColor(task),
                          borderLeft: `4px solid ${getTaskColor(task)}`
                        }}
                        title={task.title}
                      >
                        <div className="task-title">{shortTitle}</div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar; 