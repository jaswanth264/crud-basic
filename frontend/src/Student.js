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

ModuleRegistry.registerModules([AllCommunityModule]);

function Student() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "" });
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [searchActive, setSearchActive] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const gridApi = useRef(null);

  const apiUrl = process.env.REACT_APP_API_URL;

  // Fetch students (memoized, for no lint warnings)
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${apiUrl}/students`);
      setStudents(res.data);
      setTimeout(() => setLoading(false), 250);
      // Restore active search if needed
      if (gridApi.current && typeof gridApi.current.setQuickFilter === "function" && searchActive) {
        gridApi.current.setQuickFilter(search);
      }
    } catch {
      setLoading(false);
      toast.error("Failed to load data");
    }
  }, [apiUrl, search, searchActive]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // --- CRUD handlers ---
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

  // Custom React-Toast confirm dialog
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

  // Actions buttons in each row
  const ActionCellRenderer = (params) => (
    <div className="d-flex flex-wrap gap-2 justify-content-center">
      <button
        className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
        title="Edit"
        onClick={() => handleEdit(params.data)}
        aria-label="Edit"
      >
        <i className="bi bi-pencil-square"></i>
        Edit
      </button>
      <button
        className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
        title="Delete"
        aria-label="Delete"
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
      cellRenderer: ActionCellRenderer,
      width: 180,
      pinned: "right",
    }
  ];

  const onGridReady = (params) => {
    gridApi.current = params.api;
    if (searchActive && search && typeof params.api.setQuickFilter === "function")
      params.api.setQuickFilter(search);
  };

  // Responsive search: sets quick filter and shows clear button if active
  const handleSearch = () => {
    if (gridApi.current && typeof gridApi.current.setQuickFilter === "function") {
      gridApi.current.setQuickFilter(search);
      setSearchActive(!!search);
    }
  };

  const handleClearSearch = () => {
    setSearch("");
    setSearchActive(false);
    if (gridApi.current && typeof gridApi.current.setQuickFilter === "function") {
      gridApi.current.setQuickFilter("");
    }
  };

  // (for UX) get number of displayed students in grid after search
  const [displayedCount, setDisplayedCount] = useState(null);
  const onFilterChanged = () => {
    if (gridApi.current && typeof gridApi.current.getDisplayedRowCount === "function") {
      setDisplayedCount(gridApi.current.getDisplayedRowCount());
    }
  };

  // Grid label
  const getGridLabel = () =>
    loading
      ? "Loading students..."
      : (searchActive && displayedCount === 0)
        ? (<span className="text-muted">No students found.</span>)
        : (<span className="text-secondary" style={{ fontSize: 14 }}>
            Showing {displayedCount ?? students.length} student{(displayedCount ?? students.length) !== 1 && "s"}
          </span>);

  return (
    <div className="custom-bg min-vh-100 py-4">
      <ToastContainer position="top-center" draggable={false} transition={Slide} />
      <div className="container">
        <h2 className="text-gradient text-center mb-4" style={{ fontWeight: 700, letterSpacing: 1 }}>
          Student Management
        </h2>

        <div className="row g-3 mb-3 justify-content-center">
          <div className="col-12 col-lg-6">
            <form className="custom-form p-4" onSubmit={handleSubmit} autoComplete="off">
              <div className="mb-3">
                <input
                  className="form-control"
                  placeholder="Name"
                  name="name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  autoFocus
                />
              </div>
              <div className="mb-3">
                <input
                  className="form-control"
                  placeholder="Email"
                  name="email"
                  required
                  type="email"
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
          </div>
        </div>

        {/* SEARCH BAR, Single Row */}
        <div className="row justify-content-center mb-2">
          <div className="col-12 col-lg-6">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                aria-label="Search students"
              />
              {searchActive ? (
                <button className="btn btn-outline-danger" type="button" onClick={handleClearSearch} title="Clear search">
                  <i className="bi bi-x-lg"></i>
                </button>
              ) : null}
              <button
                className="btn btn-outline-primary"
                type="button"
                onClick={handleSearch}
                title="Search"
              >
                <i className="bi bi-search"></i>
                <span className="d-none d-sm-inline ms-1">Search</span>
              </button>
            </div>
          </div>
        </div>

        {/* GRID/INFO */}
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10">
            <div className="d-flex justify-content-between align-items-center mb-1">
              {getGridLabel()}
              {loading && <div className="spinner-border spinner-border-sm text-primary ms-2" role="status" />}
            </div>
            <div className="ag-theme-alpine custom-grid"
                 style={{ minHeight: 350, maxWidth: "100vw", borderRadius: 16, fontFamily: "inherit", fontSize: 15 }}>
              <AgGridReact
                rowData={students}
                columnDefs={columnDefs}
                pagination
                paginationPageSize={6}
                onGridReady={onGridReady}
                onFilterChanged={onFilterChanged}
                theme="legacy"
                domLayout="autoHeight"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Student;
