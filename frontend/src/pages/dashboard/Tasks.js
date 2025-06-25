import React, { useState } from 'react';
import '../../assets/Dashboard.css';
import '../../assets/Tasks.css';

const Tasks = () => {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Study React', description: 'Read the official documentation.' },
    { id: 2, title: 'Practice exercises', description: 'Work on hooks.' }
  ]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    const newTask = {
      id: tasks.length + 1,
      title,
      description
    };
    setTasks([...tasks, newTask]);
    setTitle('');
    setDescription('');
  };

  return (
    <div className="tasks-component" style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
      <form onSubmit={handleSubmit} className="task-form" style={{ flex: 1, minWidth: 250 }}>
        <h2>Tasks</h2>
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
        <button type="submit">Create Task</button>
      </form>
      <div className="task-list-container" style={{ flex: 2 }}>
        <h3>Task List</h3>
        <ul className="task-list">
          {tasks.map(task => (
            <li key={task.id} style={{ marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
              <strong>{task.title}</strong>
              <p>{task.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Tasks; 