import React, { useState } from 'react';
import axios from 'axios';
import {useNavigate} from 'react-router-dom'

function CreateStudent() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
   e.preventDefault();

    
   axios.post('http://localhost:8000/create', { name, email })
     .then((res) => {
       console.log(res)
       navigate('/')

    })
     .catch((err) => {
       console.error('Error adding student:', err);
     });
   };

  return (
    
    <div className='d-flex vh-100 bg-primary justify-content-center align-items-center'>
      <div className='w-50 bg-white rounded p-4'>
        <form onSubmit={handleSubmit}>
        <h3 className="mb-4 text-center">Add New Student</h3>
          <div className="form-group mb-3">
            <label htmlFor="name" className="form-label">Name</label>
            <input
              type="text"
              id="name"
              className="form-control"
              placeholder="Enter Student Name"
              onChange={e=>setName(e.target.value)}
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
              onChange={e=>setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-success w-100">submit</button>
        </form>
      </div>
    </div>
  );
}

export default CreateStudent;
