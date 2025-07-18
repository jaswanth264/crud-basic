import React from 'react';
import Student from './Student';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <div className="container py-5">
      <h2 className="text-center mb-4">Student Management</h2>
      <Student />
      <ToastContainer />
    </div>
  );
}

export default App;
