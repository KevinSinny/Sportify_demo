import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./components/LoginPage.jsx";
import SignPage from "./components/SignPage.jsx";
import HomePage from "./components/HomePage.jsx";


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignPage />} /> {/* Updated path */}
        <Route path="/home" element={<HomePage />} />
      </Routes>
    </Router>
  );
};

export default App;
