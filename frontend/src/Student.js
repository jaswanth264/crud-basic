import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer, toast, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./StudentCustom.css";

// AG Grid module registration (fixes error #272)
ModuleRegistry.registerModules([AllCommunityModule]);

function Student() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({ name: "", email: "" });
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null); // For delete confirmation toast
  const gridApi = useRef(null);

  const apiUrl = process.env.REACT_APP_API_URL;

  // --- useCallback for ESLint compliance ---
  const fetchStudents = useCallback(async () => {
    try {
      const res = await axios.get(`${apiUrl}/students`);
      setStudents(res.data);
      if (gridApi.current && typeof gridApi.current.setQuickFilter === "function") {
        gridApi.current.setQuickFilter(search);
      }
    } catch {
      toast.error("Failed to load data");
    }
  }, [apiUrl, search]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${apiUrl}/students/${editingId}`, form);
        toast.success("Student updated!");
      } else {
        await axios.post(`${apiUrl}/students`, form);
        toast.success("Student added!");
      }
      setForm({ name: "", email: "" });
      setEditingId(null);
      fetchStudents();
    } catch {
      toast.error("Operation failed!");
    }
  };

  // Custom delete confirmation dialog with react-toastify, not JS alert
  const handleDelete = (id) => {
    setPendingDelete(id);
    toast.info(
      <span>
        <strong>Are you sure you want to delete?</strong>
        <div className="mt-2 d-flex gap-2">
          <button
            className="btn btn-sm btn-danger"
            onClick={async (e) => {
              e.stopPropagation();
              toast.dismiss();
              try {
                await axios.delete(`${apiUrl}/students/${id}`);
                fetchStudents();
                toast.success("Deleted successfully");
              } catch {
                toast.error("Failed to delete");
              }
              setPendingDelete(null);
            }}
          >
            Yes, Delete
          </button>
          <button
            className="btn btn-sm btn-secondary"
            onClick={() => { toast.dismiss(); setPendingDelete(null); }}
          >
            Cancel
          </button>
        </div>
      </span>,
      { autoClose: false, closeOnClick: false, closeButton: false }
    );
  };

  const handleEdit = (data) => {
    setForm({ name: data.name, email: data.email });
    setEditingId(data.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Always show Edit and Delete with icons
  const ActionCellRenderer = (params) => (
    <div className="d-flex flex-wrap gap-2 justify-content-center">
      <button
        className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
        onClick={() => handleEdit(params.data)}
      >
        <i className="bi bi-pencil-square"></i>
        Edit
      </button>
      <button
        className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
        onClick={() => handleDelete(params.data.id)}
        disabled={pendingDelete === params.data.id}
      >
        <i className="bi bi-trash"></i>
        Delete
      </button>
    </div>
  );

  // AG Grid columns (no id!)
  const columnDefs = [
    { headerName: "Name", field: "name", flex: 1 },
    { headerName: "Email", field: "email", flex: 1 },
    {
      headerName: "Actions",
      cellRenderer: ActionCellRenderer,     // <-- AG Grid v28+ : pass React function to cellRenderer
      width: 180
    }
  ];

  const onGridReady = (params) => {
    gridApi.current = params.api;
    // If you want the quick filter to always reflect the last search state (even after reload), do:
    if (search && typeof params.api.setQuickFilter === "function") {
      params.api.setQuickFilter(search);
    }
  };

  // Search (via Search button or Enter key)
  const handleSearch = () => {
    if (gridApi.current && typeof gridApi.current.setQuickFilter === "function") {
      gridApi.current.setQuickFilter(search);
    }
  };

  return (
    <div className="custom-bg min-vh-100 py-4">
      <ToastContainer position="top-center" draggable={false} transition={Slide} />
      <div className="container">
        <h2 className="text-gradient mb-4 text-center">Student Management</h2>

        <form className="custom-form p-4 mb-4" onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              className="form-control"
              placeholder="Name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <input
              className="form-control"
              placeholder="Email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-submit w-100" type="submit">
              {editingId ? "Update" : "Add Student"}
            </button>
            {editingId &&
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => { setEditingId(null); setForm({ name: "", email: "" }); }}
              >Cancel</button>
            }
          </div>
        </form>

        <div className="input-group mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
          <button
            className="btn btn-outline-primary"
            type="button"
            onClick={handleSearch}
          >
            <i className="bi bi-search"></i> Search
          </button>
        </div>

        <div className="ag-theme-alpine custom-grid" style={{ height: 400, width: "100%" }}>
          <AgGridReact
            rowData={students}
            columnDefs={columnDefs}
            pagination
            paginationPageSize={5}
            onGridReady={onGridReady}
            theme="legacy"  // <-- fixes AG Grid error #239
          />
        </div>
      </div>
    </div>
  );
}

export default Student;
