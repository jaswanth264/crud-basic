import React, { useEffect, useState, useMemo, useRef } from 'react';
import axios from 'axios';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';


function Student() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({ name: '', email: '' });
  const [editingId, setEditingId] = useState(null);
  const gridRef = useRef(null);
  const [searchText, setSearchText] = useState('');

  const fetchStudents = () => {
    axios.get(`${process.env.REACT_APP_API_URL}/`)
      .then(res => setStudents(res.data))
      .catch(err => console.error('Error fetching students:', err));
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const endpoint = editingId
      ? `${process.env.REACT_APP_API_URL}/update/${editingId}`
      : `${process.env.REACT_APP_API_URL}/create`;

    const axiosMethod = editingId ? axios.put : axios.post;

    axiosMethod(endpoint, form)
      .then(() => {
        fetchStudents();
        setForm({ name: '', email: '' });
        setEditingId(null);
      })
      .catch(err => console.error('Error submitting form:', err));
  };

  const handleEdit = (student) => {
    setForm({ name: student.name, email: student.email });
    setEditingId(student.id);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure?')) {
      axios.delete(`${process.env.REACT_APP_API_URL}/delete/${id}`)
        .then(() => {
          fetchStudents();
        })
        .catch(err => console.error('Error deleting student:', err));
    }
  };

  const columns = useMemo(() => [
    { headerName: 'Name', field: 'name', filter: true, sortable: true },
    { headerName: 'Email', field: 'email', filter: true, sortable: true },
    {
      headerName: 'Actions',
      cellRenderer: (params) => (
        <div>
          <button className="btn btn-primary btn-sm me-2" onClick={() => handleEdit(params.data)}>Edit</button>
          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(params.data.id)}>Delete</button>
        </div>
      )
    }
  ], []);

  const handleSearch = () => {
    gridRef.current.api.setQuickFilter(searchText);
  };

  return (
    <div className="container my-5">
      <div className="card p-4 mb-4">
        <h3>{editingId ? 'Update Student' : 'Add New Student'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input type="text" className="form-control" name="name" placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="mb-3">
            <input type="email" className="form-control" name="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <button type="submit" className="btn btn-success me-2">{editingId ? 'Update' : 'Add'}</button>
          {editingId && (
            <button type="button" className="btn btn-secondary" onClick={() => {
              setForm({ name: '', email: '' });
              setEditingId(null);
            }}>
              Cancel
            </button>
          )}
        </form>
      </div>

      <div className="card p-4">
        <h3 className="mb-3">Student List</h3>
        <div className="mb-3">
          <input
            type="text"
            placeholder="Search..."
            className="form-control"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyUp={handleSearch}
          />
        </div>
        <div className="ag-theme-alpine" style={{ height: 400 }}>
          <AgGridReact
            ref={gridRef}
            rowData={students}
            columnDefs={columns}
            pagination={true}
            paginationPageSize={5}
            domLayout="autoHeight"
          />
        </div>
      </div>
    </div>
  );
}

export default Student;
