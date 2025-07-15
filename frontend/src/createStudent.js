import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function CreateStudent() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post(`${process.env.REACT_APP_API_URL}/create`, { name, email })
      .then(res => {
        console.log('Student added:', res.data);
        navigate('/');
      })
      .catch(err => console.error('Error adding student:', err));
  };

  return (
    <div className='d-flex vh-100 bg-primary justify-content-center align-items-center'>
      <div className='w-50 bg-white rounded p-4'>
        <form onSubmit={handleSubmit}>
          <h3 className="mb-4 text-center">Add New Student</h3>
          <div className="form-group mb-3">
            <label>Name</label>
            <input type="text" className="form-control" required
              onChange={e => setName(e.target.value)} />
          </div>
          <div className="form-group mb-3">
            <label>Email</label>
            <input type="email" className="form-control" required
              onChange={e => setEmail(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-success w-100">Submit</button>
        </form>
      </div>
    </div>
  );
}

export default CreateStudent;
