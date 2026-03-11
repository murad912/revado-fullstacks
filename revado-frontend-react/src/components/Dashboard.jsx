import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [todos, setTodos] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [editingId, setEditingId] = useState(null); // Tracks which task is being renamed
  const [editValue, setEditValue] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const token = localStorage.getItem('revaDoToken');
      const response = await axios.get('http://localhost:8080/api/todos', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTodos(response.data);
    } catch (err) {
      if (err.response?.status === 403) navigate('/auth');
    }
  };

  // --- MAIN TASK ACTIONS ---
  const addTask = async () => {
    if (!newTaskTitle.trim()) return;
    try {
      const token = localStorage.getItem('revaDoToken');
      await axios.post('http://localhost:8080/api/todos', 
        { title: newTaskTitle, completed: false, subtasks: [] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewTaskTitle('');
      fetchTodos();
    } catch (err) { console.error(err); }
  };

  const startEditing = (todo) => {
    setEditingId(todo.id);
    setEditValue(todo.title);
  };

  const saveEdit = async (id) => {
    try {
      const token = localStorage.getItem('revaDoToken');
      await axios.put(`http://localhost:8080/api/todos/${id}`, 
        { title: editValue }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingId(null);
      fetchTodos();
    } catch (err) { console.error(err); }
  };

  const deleteMainTask = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      const token = localStorage.getItem('revaDoToken');
      await axios.delete(`http://localhost:8080/api/todos/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTodos();
    } catch (err) { console.error(err); }
  };

  // --- SUBTASK ACTIONS ---
  const handleAddSubtask = async (todoId, subtaskTitle) => {
    try {
      const token = localStorage.getItem('revaDoToken');
      await axios.post(`http://localhost:8080/api/todos/${todoId}/subtasks`, 
        { title: subtaskTitle, completed: false },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTodos();
    } catch (err) { console.error(err); }
  };

  const handleToggleSubtask = async (todoId, subtaskId, currentStatus) => {
    try {
      const token = localStorage.getItem('revaDoToken');
      await axios.put(`http://localhost:8080/api/todos/${todoId}/subtasks/${subtaskId}`, 
        { completed: !currentStatus }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTodos();
    } catch (err) { console.error(err); }
  };

  const handleDeleteSubtask = async (todoId, subtaskId) => {
    try {
      const token = localStorage.getItem('revaDoToken');
      await axios.delete(`http://localhost:8080/api/todos/${todoId}/subtasks/${subtaskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTodos();
    } catch (err) { console.error(err); }
  };

  const calculateProgress = (subtasks) => {
    if (!subtasks || subtasks.length === 0) return 0;
    const completed = subtasks.filter(s => s.completed).length;
    return Math.round((completed / subtasks.length) * 100);
  };

  const handleLogout = () => {
    localStorage.removeItem('revaDoToken');
    navigate('/auth');
  };

  return (
    <div style={{ width: '100vw', minHeight: '100vh', backgroundColor: '#f8f9fa', display: 'block' }}>
      <nav className="navbar navbar-dark bg-primary shadow-sm mb-5">
        <div className="container">
          <span className="navbar-brand fw-bold fs-3">RevaDo</span>
          <button onClick={handleLogout} className="btn btn-outline-light px-4">Logout</button>
        </div>
      </nav>

      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-10 col-lg-8" style={{ margin: '0 auto' }}>
            
            <div className="card shadow-sm border-0 mb-5 p-2">
              <div className="card-body">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control border-0 bg-light"
                    placeholder="New master task..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addTask()}
                  />
                  <button onClick={addTask} className="btn btn-primary px-4 fw-bold">Add Task</button>
                </div>
              </div>
            </div>

            {todos.map((todo) => {
              const progress = calculateProgress(todo.subtasks);
              return (
                <div key={todo.id} className="card shadow-sm border-0 mb-4 overflow-hidden">
                  <div className="card-body p-4">
                    
                    {/* TASK HEADER WITH EDIT/DELETE */}
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      {editingId === todo.id ? (
                        <input 
                          className="form-control form-control-lg border-primary"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveEdit(todo.id)}
                          onKeyDown={(e) => e.key === 'Enter' && saveEdit(todo.id)}
                          autoFocus
                        />
                      ) : (
                        <h4 className="mb-0 fw-bold" onClick={() => startEditing(todo)} style={{cursor: 'pointer'}}>
                          {todo.title} ✏️
                        </h4>
                      )}
                      
                      <div>
                        <button onClick={() => deleteMainTask(todo.id)} className="btn btn-sm text-danger fw-bold">Delete</button>
                      </div>
                    </div>

                    {/* PROGRESS BAR */}
                    <div className="mb-4">
                        <div className="d-flex justify-content-between small text-muted mb-1">
                            <span>Progress</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="progress" style={{ height: '8px' }}>
                            <div 
                                className={`progress-bar ${progress === 100 ? 'bg-success' : 'bg-primary'}`} 
                                style={{ width: `${progress}%`, transition: 'width 0.5s ease' }}
                            ></div>
                        </div>
                    </div>

                    {/* SUBTASKS */}
                    <div className="ps-3 border-start border-4 border-primary bg-light p-3 rounded">
                      {todo.subtasks && todo.subtasks.map((sub) => (
                        <div key={sub.id} className="d-flex align-items-center justify-content-between mb-2 subtask-row">
                          <div className="d-flex align-items-center">
                            <input
                              className="form-check-input me-3"
                              type="checkbox"
                              checked={sub.completed}
                              onChange={() => handleToggleSubtask(todo.id, sub.id, sub.completed)}
                            />
                            <span className={sub.completed ? 'text-decoration-line-through text-muted' : ''}>
                              {sub.title}
                            </span>
                          </div>
                          {/* DELETE SUBTASK BUTTON */}
                          <button 
                            onClick={() => handleDeleteSubtask(todo.id, sub.id)}
                            className="btn btn-sm text-muted p-0 border-0"
                            style={{fontSize: '0.8rem'}}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <div className="mt-3">
                        <input
                          type="text"
                          className="form-control form-control-sm border-0"
                          placeholder="+ Add subtask..."
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddSubtask(todo.id, e.target.value);
                              e.target.value = "";
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;