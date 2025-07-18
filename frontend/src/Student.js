import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css'; // custom styles

function Student() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({ name: '', email: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = () => {
    axios.get(`${process.env.REACT_APP_API_URL}/`)
      .then(res => setStudents(res.data))
      .catch(err => console.error('Error fetching students:', err));
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (editingId) {
      axios.put(`${process.env.REACT_APP_API_URL}/update/${editingId}`, form)
        .then(() => {
          fetchStudents();
          setForm({ name: '', email: '' });
          setEditingId(null);
        })
        .catch(err => console.error('Error updating student:', err));
    } else {
      axios.post(`${process.env.REACT_APP_API_URL}/create`, form)
        .then(() => {
          fetchStudents();
          setForm({ name: '', email: '' });
        })
        .catch(err => console.error('Error creating student:', err));
    }
  };

  const handleEdit = student => {
    setForm({ name: student.name, email: student.email });
    setEditingId(student.id);
  };

  const handleDelete = id => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      axios.delete(`${process.env.REACT_APP_API_URL}/delete/${id}`)
        .then(() => {
          setStudents(students.filter(student => student.id !== id));
        })
        .catch(err => console.error('Error deleting student:', err));
    }
  };

  return (
    <div className='container'>
      <div className='form-card'>
        <h2>{editingId ? 'Update Student' : 'Add New Student'}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <button type="submit" className="btn submit-btn">
            {editingId ? 'Update' : 'Add'}
          </button>
          {editingId && (
            <button
              type="button"
              className="btn cancel-btn"
              onClick={() => {
                setForm({ name: '', email: '' });
                setEditingId(null);
              }}
            >
              Cancel
            </button>
          )}
        </form>
      </div>

      <div className='table-card'>
        <h2>Student List</h2>
        <table className='student-table'>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {students.map(student => (
              <tr key={student.id}>
                <td>{student.name}</td>
                <td>{student.email}</td>
                <td>
                  <button className='btn edit-btn' onClick={() => handleEdit(student)}>Edit</button>
                  <button className='btn delete-btn' onClick={() => handleDelete(student.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Student;
