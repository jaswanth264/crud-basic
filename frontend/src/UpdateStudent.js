import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

function UpdateStudent() {
  const { id } = useParams();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    axios.get(`${API_URL}/student/${id}`)
      .then(res => {
        const student = res.data;
        setName(student.name);
        setEmail(student.email);
      })
      .catch(err => console.error('Error fetching student:', err));
  }, [id, API_URL]);

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.put(`${API_URL}/update/${id}`, { name, email })
      .then(() => navigate('/'))
      .catch(err => console.error('Error updating student:', err));
  };

  return (
    <div className='d-flex vh-100 bg-primary justify-content-center align-items-center'>
      <div className='w-50 bg-white rounded p-4'>
        <form onSubmit={handleSubmit}>
          <h3 className="mb-4 text-center">Update Student</h3>
          <div className="form-group mb-3">
            <label htmlFor="name" className="form-label">Name</label>
            <input
              type="text"
              id="name"
              className="form-control"
              placeholder="Enter Student Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              className="form-control"
              placeholder="Enter Student Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-success w-100">Update</button>
        </form>
      </div>
    </div>
  );
}

export default UpdateStudent;
