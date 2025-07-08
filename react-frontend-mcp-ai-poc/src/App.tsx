import React from 'react';
import logo from './logo.svg';
import './App.css';
import { Routes, Route, Link } from 'react-router-dom';
import BusinessProposal from './components/BusinessProposal';

function App() {
  return (
    <div className="App">
      <div className="App-content">
        <nav>
          <Link to="/proposal">Generate Business Proposal</Link>
        </nav>
        <Routes>
          <Route path="/" element={<h1>Welcome</h1>} />
          <Route path="/proposal" element={<BusinessProposal />} />
        </Routes>
      </div>
      <footer>
        <p>Business Proposal App</p>
      </footer>
    </div>
  );
}

export default App;
