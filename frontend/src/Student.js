import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { AgGridReact } from "ag-grid-react";
// Styles
import "ag-grid-community/styles/ag-theme-quartz.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import "./Student.css";

import { ToastContainer, toast, Slide } from "react-toastify";
import { useSearch } from "./context/SearchContext";


// AG Grid Required Modules
import {
  ModuleRegistry,
  ClientSideRowModelModule,
  PaginationModule,
  QuickFilterModule,
  RowApiModule,
  ValidationModule,
  TextEditorModule,
} from "ag-grid-community";

// Register Modules
ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  PaginationModule,
  QuickFilterModule,
  RowApiModule,
  ValidationModule,
  TextEditorModule,
]);


function Student() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingRowId, setEditingRowId] = useState(null);
  const [displayedCount, setDisplayedCount] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const gridApi = useRef(null);
  const apiUrl = process.env.REACT_APP_API_URL;
  const { search, setSearch, searchActive, setSearchActive } = useSearch();

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${apiUrl}/students`);
      setStudents(res.data);
      setTimeout(() => setLoading(false), 300);
    } catch {
      setLoading(false);
      toast.error("Failed to fetch students");
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // --- Row Editing Helpers ---
  const getRowIndex = (id) => {
    let rowIndex = -1;
    gridApi.current.forEachNode((node) => {
      if (String(node.data.id) === String(id)) rowIndex = node.rowIndex;
    });
    return rowIndex;
  };

  const startEditing = (id) => {
    setEditingRowId(id);
    setTimeout(() => {
      const index = getRowIndex(id);
      if (index >= 0 && gridApi.current) {
        gridApi.current.startEditingCell({ rowIndex: index, colKey: "name" });
      }
    }, 100);
  };

  const cancelEditingRow = () => {
    if (gridApi.current) gridApi.current.stopEditing(true);
    setEditingRowId(null);
  };

  const saveEditingRow = async (row) => {
    try {
      await axios.put(`${apiUrl}/students/${row.id}`, {
        name: row.name,
        email: row.email,
      });
      toast.success("Student updated!");
      setEditingRowId(null);
      fetchStudents();
    } catch {
      toast.error("Update failed");
    }
  };

  // Auto Suggest Search
  const handleSearchChange = (value) => {
    setSearch(value);
    if (!value) {
      setSuggestions([]);
      setSearchActive(false);
      return;
    }

    const lower = value.toLowerCase();
    const filtered = students.filter(
      (s) => s.name.toLowerCase().includes(lower) || s.email.toLowerCase().includes(lower)
    );

    const matches = filtered.flatMap((s) => [s.name, s.email]);
    setSuggestions([...new Set(matches)].slice(0, 6));
  };

  const handleSearch = () => {
    if (gridApi.current) {
      gridApi.current.setGridOption("quickFilterText", search);
      setSearchActive(!!search);
      setDisplayedCount(gridApi.current.getDisplayedRowCount());
      setSuggestions([]);
    }
  };

  const handleClearSearch = () => {
    setSearch("");
    setSuggestions([]);
    setSearchActive(false);
    if (gridApi.current) {
      gridApi.current.setGridOption("quickFilterText", "");
      setDisplayedCount(gridApi.current.getDisplayedRowCount());
    }
  };

  // --- Delete Modal ---
  const confirmDelete = (student) => {
    setDeleteTarget(student);
    setShowDeleteModal(true);
  };

  const performDelete = async () => {
    if (!deleteTarget) return;
    try {
      await axios.delete(`${apiUrl}/students/${deleteTarget.id}`);
      toast.success("Student deleted!");
      fetchStudents();
    } catch {
      toast.error("Delete failed!");
    }
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  // --- AG Grid Events ---
  const onGridReady = (params) => {
    gridApi.current = params.api;
    params.api.setGridOption("quickFilterText", search);
    setDisplayedCount(params.api.getDisplayedRowCount());
  };

  const onFilterChanged = () => {
    if (gridApi.current) {
      setDisplayedCount(gridApi.current.getDisplayedRowCount());
    }
  };

  const columnDefs = [
    {
      headerName: "Name",
      field: "name",
      flex: 1,
      editable: (params) => params.data.id === editingRowId,
    },
    {
      headerName: "Email",
      field: "email",
      flex: 1,
      editable: (params) => params.data.id === editingRowId,
    },
    {
      headerName: "Actions",
      pinned: "right",
      width: 200,
      cellRenderer: (params) => {
        const row = params.data;
        const isEditing = editingRowId === row.id;
        return (
          <div className="d-flex gap-2 justify-content-center">
            {isEditing ? (
              <>
                <button className="btn btn-sm btn-success" onClick={() => {
                  params.api.stopEditing(false);
                  saveEditingRow(row);
                }}>Save</button>
                <button className="btn btn-sm btn-secondary" onClick={cancelEditingRow}>Cancel</button>
              </>
            ) : (
              <>
                <button className="btn btn-sm btn-outline-primary" onClick={() => startEditing(row.id)}>Edit</button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => confirmDelete(row)}>Delete</button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  const getGridLabel = () => (
    loading ? "Loading..." :
    searchActive && displayedCount === 0 ? (
      <span className="text-muted">No students found.</span>
    ) : (
      <span className="text-secondary" style={{ fontSize: 14 }}>
        Showing {displayedCount ?? students.length} student{(displayedCount ?? students.length) !== 1 && "s"}
      </span>
    )
  );

  return (
    <div className="custom-bg min-vh-100 py-4">
      <ToastContainer position="top-center" transition={Slide} />
      <div className="container">
        <h2 className="text-gradient text-center mb-4 fw-bold">Student Management</h2>

        {/* ➕ Add Student Form */}
        <div className="row mb-4 justify-content-center">
          <div className="col-12 col-md-6">
            <form
              className="custom-form p-4 bg-white rounded shadow-sm"
              onSubmit={async (e) => {
                e.preventDefault();
                const name = e.target.name.value.trim();
                const email = e.target.email.value.trim();
                if (!name || !email) return toast.error("All fields required");
                try {
                  await axios.post(`${apiUrl}/students`, { name, email });
                  toast.success("Added!");
                  fetchStudents();
                  e.target.reset();
                } catch {
                  toast.error("Failed to add student.");
                }
              }}
            >
              <h5 className="mb-3">Add Student</h5>
              <input name="name" className="form-control mb-2" placeholder="Name" required />
              <input name="email" type="email" className="form-control mb-2" placeholder="Email" required />
              <button type="submit" className="btn btn-submit w-100">Add</button>
            </form>
          </div>
        </div>

        {/* 🔍 Search */}
        <div className="row justify-content-center mb-3">
          <div className="col-12 col-lg-6">
            <div className="input-group position-relative">
              <input
                type="text"
                className="form-control"
                placeholder="Search..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              {search && (
                <button className="btn btn-outline-danger" onClick={handleClearSearch}>❌</button>
              )}
              <button className="btn btn-outline-primary" onClick={handleSearch}>🔍</button>

              {suggestions.length > 0 && (
                <div className="autocomplete-dropdown position-absolute w-100 bg-white border shadow-sm" style={{ top: "100%", zIndex: 10 }}>
                  {suggestions.map((s, i) => (
                    <div
                      key={i}
                      className="p-2 search-suggestion-item"
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        setSearch(s);
                        setSuggestions([]);
                        handleSearch();
                      }}
                    >
                      {s}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 📊 AG Grid */}
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10">
            <div className="d-flex justify-content-between align-items-center mb-2">
              {getGridLabel()}
              {loading && <div className="spinner-border spinner-border-sm text-primary" />}
            </div>
            <div className="ag-theme-quartz" style={{ minHeight: 400, borderRadius: 16 }}>
              <AgGridReact
                rowData={students}
                columnDefs={columnDefs}
                pagination
                paginationPageSize={6}
                paginationPageSizeSelector={[6, 10, 20]}
                domLayout="autoHeight"
                onGridReady={onGridReady}
                onFilterChanged={onFilterChanged}
                stopEditingWhenCellsLoseFocus={false}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 🔴 Delete Modal */}
      {showDeleteModal && deleteTarget && (
        <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">Confirm Deletion</h5>
                <button className="btn-close" onClick={() => setShowDeleteModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this student?</p>
                <ul>
                  <li><strong>Name:</strong> {deleteTarget.name}</li>
                  <li><strong>Email:</strong> {deleteTarget.email}</li>
                </ul>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                <button className="btn btn-danger" onClick={performDelete}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Student;
