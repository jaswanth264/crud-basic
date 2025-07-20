import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";

// Register AG Grid Community modules
ModuleRegistry.registerModules([AllCommunityModule]);

function Student() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({ name: "", email: "" });
  const [editingId, setEditingId] = useState(null);
  const gridRef = useRef();

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/students`);
      setStudents(res.data);
    } catch {
      toast.error("Failed to load students");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${process.env.REACT_APP_API_URL}/students/${editingId}`, form);
        toast.success("Updated");
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL}/students`, form);
        toast.success("Created");
      }
      setForm({ name: "", email: "" });
      setEditingId(null);
      fetchStudents();
    } catch {
      toast.error("Error while submitting");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Confirm delete?")) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/students/${id}`);
        toast.success("Deleted");
        fetchStudents();
      } catch {
        toast.error("Failed to delete");
      }
    }
  };

  const columns = [
    { headerName: "ID", field: "id", width: 80, filter: "agNumberColumnFilter" },
    { headerName: "Name", field: "name", flex: 1, filter: "agTextColumnFilter" },
    { headerName: "Email", field: "email", flex: 1, filter: "agTextColumnFilter" },
    {
      headerName: "Actions",
      field: "id",
      width: 180,
      cellRendererFramework: (params) => (
        <div className="d-flex gap-2">
          <button
            className="btn btn-sm btn-primary"
            onClick={() => {
              setForm({ name: params.data.name, email: params.data.email });
              setEditingId(params.data.id);
            }}>
            Edit
          </button>
          <button
            className="btn btn-sm btn-danger"
            onClick={() => handleDelete(params.data.id)}>
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="container my-3">
      <ToastContainer />
      <form onSubmit={handleSubmit} className="mb-3">
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          className="form-control mb-2"
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
          className="form-control mb-2"
        />
        <button type="submit" className="btn btn-success me-2">
          {editingId ? "Update" : "Add"}
        </button>
        {editingId && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setForm({ name: "", email: "" });
              setEditingId(null);
            }}>
            Cancel
          </button>
        )}
      </form>
      <div className="mb-2">
        <input
          type="text"
          placeholder="Search..."
          onInput={(e) => gridRef.current.api.setQuickFilter(e.target.value)}
          className="form-control"
        />
      </div>
      <div className="ag-theme-alpine" style={{ height: 400 }}>
        <AgGridReact
          ref={gridRef}
          rowData={students}
          columnDefs={columns}
          defaultColDef={{ sortable: true, filter: true, resizable: true }}
          pagination
          paginationPageSize={5}
          theme="legacy"   // <-- Fixes AG Grid v33+ theming error
        />
      </div>
    </div>
  );
}

export default Student;
