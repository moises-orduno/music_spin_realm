import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "@/App.css";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Debates from "./pages/Debates";
import Tops from "./pages/Tops";
import Hunt from "./pages/Hunt";
import Collection from "./pages/Collection";
import People from "./pages/People";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/debates" element={<Layout><Debates /></Layout>} />
          <Route path="/tops" element={<Layout><Tops /></Layout>} />
          <Route path="/hunt" element={<Layout><Hunt /></Layout>} />
          <Route path="/marketplace" element={<Layout><Hunt /></Layout>} />
          <Route path="/collection" element={<Layout><Collection /></Layout>} />
          <Route path="/people" element={<Layout><People /></Layout>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
