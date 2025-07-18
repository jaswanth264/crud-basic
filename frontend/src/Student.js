import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { confirmAlert } from 'react-confirm-alert';
import { AgGridReact } from 'ag-grid-react';
import 'react-toastify/dist/ReactToastify.css';
import 'react-confirm-alert/src/react-confirm-alert.css';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import './App.css'; // your custom CSS

function Student() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({ name: '', email: '' });
  const [editingId, setEditingId] = useState(null);
  const [searchText, setSearchText] = useState('');
  const gridApi = useRef(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = () => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/students`)
      .then(res => {
        setStudents(res.data);
        toast.success('Student list loaded');
      })
      .catch(() => toast.error('Failed to load student list'));
  };

  const onGridReady = params => {
    gridApi.current = params.api;
  };

  const onSearchChange = e => {
    setSearchText(e.target.value);
    if (gridApi.current?.setQuickFilter) {
      gridApi.current.setQuickFilter(e.target.value);
    }
  };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = e => {
    e.preventDefault();
    const method = editingId ? axios.put : axios.post;
    const url = editingId
      ? `${process.env.REACT_APP_API_URL}/api/students/${editingId}`
      : `${process.env.REACT_APP_API_URL}/api/students`;

    method(url, form)
      .then(() => {
        toast.success(editingId ? 'Student updated successfully' : 'Student added successfully');
        fetchStudents();
        setForm({ name: '', email: '' });
        setEditingId(null);
      })
      .catch(() => toast.error('Action failed'));
  };

  const handleEdit = student => {
    setForm({ name: student.name, email: student.email });
    setEditingId(student.id);
  };

  const handleDelete = id => {
    confirmAlert({
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this student?',
      buttons: [
        {
          label: 'Yes',
          onClick: () => {
            axios.delete(`${process.env.REACT_APP_API_URL}/api/students/${id}`)
              .then(() => {
                toast.success('Student deleted');
                fetchStudents();
              })
              .catch(() => toast.error('Delete failed'));
          }
        },
        {
          label: 'No',
          onClick: () => toast.info('Delete cancelled')
        }
      ]
    });
  };

  const columnDefs = [
    { headerName: 'Name', field: 'name', sortable: true, filter: 'agTextColumnFilter', flex: 1 },
    { headerName: 'Email', field: 'email', sortable: true, filter: 'agTextColumnFilter', flex: 1 },
    {
      headerName: 'Actions',
      field: 'actions',
      cellRenderer: params => (
        <div className="d-flex gap-2 justify-content-center flex-wrap">
          <button
            className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
            onClick={() => handleEdit(params.data)}
          >
            <i className="bi bi-pencil-square"></i> Edit
          </button>
          <button
            className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
            onClick={() => handleDelete(params.data.id)}
          >
            <i className="bi bi-trash3"></i> Delete
          </button>
        </div>
      ),
      suppressMenu: true,
      flex: 1
    }
  ];

  return (
    <div className="container py-4 px-3 px-md-5">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="card p-4 mb-4 rounded shadow-lg bg-glass">
        <h3 className="text-center mb-3">{editingId ? 'Update Student' : 'Add Student'}</h3>
        <form onSubmit={handleSubmit} className="d-grid gap-3">
          <input type="text" name="name" placeholder="Name" value={form.name} onChange={handleChange} className="form-control" required />
          <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} className="form-control" required />
          <div className="text-center">
            <button type="submit" className="btn btn-success me-2">{editingId ? 'Update' : 'Add'}</button>
            {editingId && (
              <button type="button" className="btn btn-secondary" onClick={() => { setForm({ name: '', email: '' }); setEditingId(null); }}>Cancel</button>
            )}
          </div>
        </form>
      </div>

      <div className="d-flex flex-column flex-md-row justify-content-between gap-3 mb-3">
        <h4 className="mb-0">Students List</h4>
        <input
          type="text"
          placeholder="Search students..."
          className="form-control search-bar"
          value={searchText}
          onChange={onSearchChange}
          style={{ maxWidth: 300, minWidth: 200 }}
        />
      </div>

      <div className="ag-theme-alpine rounded shadow-lg" style={{ height: '60vh', width: '100%' }}>
        <AgGridReact
          onGridReady={onGridReady}
          rowData={students}
          columnDefs={columnDefs}
          defaultColDef={{ sortable: true, filter: true, resizable: true }}
          pagination
          paginationPageSize={5}
          quickFilterText={searchText}
          overlayNoRowsTemplate="No students found"
        />
      </div>
    </div>
  );
}

export default Student;
