import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../assets/Calendar.css';

const STATUS_COLORS = {
  'Completed': '#4caf50',
  'Pending': '#2196f3',
  'In Progress': '#ff9800',
  'Overdue': '#fca5a5',
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
  today.setHours(0, 0, 0, 0);
  const taskDay = new Date(year, month - 1, day);
  taskDay.setHours(0, 0, 0, 0);

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

  // Returns only tasks that start in this slot
  const getTasksForTimeSlot = (day, timeSlot) => {
    const hour = parseInt(timeSlot.split(':')[0]);
    const isSameDay = (d1, d2) =>
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();

    return tasks.filter(task => {
      let taskDateObj;
      if (typeof task.date === 'string' && task.date.includes('T')) {
        const d = new Date(task.date);
        taskDateObj = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
      } else if (typeof task.date === 'string') {
        const [year, month, dayNum] = task.date.split('-').map(Number);
        taskDateObj = new Date(year, month - 1, dayNum);
      } else {
        taskDateObj = new Date(task.date);
      }
      if (!isSameDay(taskDateObj, day)) return false;
      if (!task.startTime) return false;
      const [startH] = task.startTime.split(':').map(Number);
      return startH === hour;
    });
  };

  // Calculate how many slots the task occupies
  const getTaskDurationSlots = (task) => {
    if (!task.startTime || !task.endTime) return 1;
    const [startH, startM] = task.startTime.split(':').map(Number);
    const [endH, endM] = task.endTime.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    return Math.max(1, Math.ceil((endMinutes - startMinutes) / 60));
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
              <span className="calendar-legend-item">
                <span className="calendar-legend-color calendar-legend-pending"></span>
                Pending
              </span>
              <span className="calendar-legend-item">
                <span className="calendar-legend-color calendar-legend-inprogress"></span>
                In Progress
              </span>
              <span className="calendar-legend-item">
                <span className="calendar-legend-color calendar-legend-completed"></span>
                Completed
              </span>
              <span className="calendar-legend-item">
                <span className="calendar-legend-color calendar-legend-overdue"></span>
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
              const taskCount = tasksForSlot.length;
              const gap = 4; // px
              const totalGap = gap * (taskCount - 1);
              const widthPercent = `calc(${100 / taskCount}% - ${(totalGap / taskCount).toFixed(2)}px)`;
              return (
                <div key={timeSlot} className="time-cell" style={{ minHeight: 40, verticalAlign: 'top', paddingTop: 0, paddingBottom: 0, position: 'relative' }}>
                  {tasksForSlot.map((task, i) => {
                    const shortTitle = task.title.length > 50 ? task.title.slice(0, 50) + '...' : task.title;
                    const durationSlots = getTaskDurationSlots(task);
                    return (
                      <div
                        key={task.id}
                        className="task-item"
                        style={{
                          backgroundColor: getTaskColor(task),
                          borderLeft: `4px solid ${getTaskColor(task)}`,
                          width: widthPercent,
                          left: `calc(${(100 / taskCount) * i}% + ${i * gap}px)`,
                          position: 'absolute',
                          top: 0,
                          height: `${durationSlots * 40}px`, // 40px por slot
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 1
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