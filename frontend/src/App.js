import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "@/App.css";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Debates from "./pages/Debates";
import DebateDetail from "./pages/DebateDetail";
import Tops from "./pages/Tops";
import Hunt from "./pages/Hunt";
import Collection from "./pages/Collection";
import Profile from "./pages/Profile";
import People from "./pages/People";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/debates" element={<Layout showRightPanel={false}><Debates /></Layout>} />
          <Route path="/debates/:id" element={<Layout showRightPanel={false}><DebateDetail /></Layout>} />
          <Route path="/tops" element={<Layout><Tops /></Layout>} />
          <Route path="/hunt" element={<Layout><Hunt /></Layout>} />
          <Route path="/marketplace" element={<Layout><Hunt /></Layout>} />
          <Route path="/collection" element={<Layout><Collection /></Layout>} />
          <Route path="/people" element={<Layout><People /></Layout>} />
          <Route path="/profile" element={<Layout showRightPanel={false}><Profile /></Layout>} />
          <Route path="/profile/:username" element={<Layout showRightPanel={false}><Profile /></Layout>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
