import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

function UpdateStudent() {
  const { id } = useParams();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/student/${id}`)
      .then(res => {
        setName(res.data.name);
        setEmail(res.data.email);
      })
      .catch(err => console.error('Error fetching student:', err));
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.put(`${process.env.REACT_APP_API_URL}/update/${id}`, { name, email })
      .then(res => {
        console.log('Student updated:', res.data);
        navigate('/');
      })
      .catch(err => console.error('Error updating student:', err));
  };

  return (
    <div className='d-flex vh-100 bg-primary justify-content-center align-items-center'>
      <div className='w-50 bg-white rounded p-4'>
        <form onSubmit={handleSubmit}>
          <h3 className="mb-4 text-center">Update Student</h3>
          <div className="form-group mb-3">
            <label>Name</label>
            <input type="text" className="form-control" required
              value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="form-group mb-3">
            <label>Email</label>
            <input type="email" className="form-control" required
              value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-success w-100">Update</button>
        </form>
      </div>
    </div>
  );
}

export default UpdateStudent;
