import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function Student() {
  const [students, setStudents] = useState([]);

  // Fetch students data
  useEffect(() => {
    axios.get('http://localhost:8000/')
      .then(res => setStudents(res.data))
      .catch(err => console.error(err));
  }, []);

  // Handle delete
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      axios.delete(`http://localhost:8000/delete/${id}`)
        .then(() => {
          setStudents(students.filter(student => student.id !== id));
        })
        .catch(err => {
          console.error('Error deleting student:', err);
        });
    }
  };

  return (
    <div className='d-flex vh-100 bg-primary justify-content-center align-items-center'>
      <div className='w-50 bg-white rounded p-3'>
        <Link to='/create' className="btn btn-success mb-3">Add +</Link>

        <table className='table table-bordered'>
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
                  <Link to={`update/${student.id}`} className='btn btn-primary'>Update</Link>
                  <button
                    className='btn btn-danger ms-2'
                    onClick={() => handleDelete(student.id)}
                  >
                    Delete
                  </button>
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
