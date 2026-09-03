import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "@/App.css";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Debates from "./pages/Debates";
import DebateDetail from "./pages/DebateDetail";
import TopLists from "./pages/TopLists";
import Hunt from "./pages/Hunt";
import Collection from "./pages/Collection";
import Profile from "./pages/Profile";
import People from "./pages/People";
import Login from "./pages/Login";
import ListDetail from "./pages/ListDetail";
import ListRemix from "./pages/ListRemix";
import ListAddAlbum from "./pages/ListAddAlbum";
import ListSearch from "./pages/ListSearch";
import ListForm from "./pages/ListForm";
import HuntForm from "./pages/HuntForm";
import Marketplace from "./pages/Marketplace";
import AlbumDetail from "./pages/AlbumDetail";
import CollectionAlbumForm from "./pages/CollectionAlbumForm";
import HuntDetails from "./pages/HuntDetail";
import MarketplaceDetail from "./pages/MarketplaceDetail";
import CollectionAlbumDetail from "./pages/CollectionAlbumDetail";
import SignUp from "./pages/SingUp";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/debates" element={<Layout showRightPanel={false}><Debates /></Layout>} />
          <Route path="/debates/:id" element={<Layout showRightPanel={false}><DebateDetail /></Layout>} />
          <Route path="/topLists" element={<Layout><TopLists /></Layout>} />
          <Route path="/listForm/new" element={<Layout showRightPanel={false}><ListForm /></Layout>} />
          <Route path="/huntForm/new" element={<Layout showRightPanel={false}><HuntForm /></Layout>} />
          <Route path="/huntForm/:id/edit" element={<Layout showRightPanel={false}><HuntForm /></Layout>} />
          <Route path="/huntDetail/:id" element={<Layout showRightPanel={false}><HuntDetails /></Layout>} />
          <Route path="/collectionAlbumForm/new" element={<Layout showRightPanel={false}><CollectionAlbumForm /></Layout>} />
          <Route path="/collectionAlbumForm/:id/edit" element={<Layout showRightPanel={false}><CollectionAlbumForm /></Layout>} />
          <Route path="/hunt" element={<Layout><Hunt /></Layout>} />
          <Route path="/marketplace" element={<Layout showRightPanel={false}><Marketplace /></Layout>} />
          <Route path="/marketplace/:id" element={<Layout showRightPanel={false}><MarketplaceDetail /></Layout>} />
          <Route path="/collection" element={<Layout><Collection /></Layout>} />
          <Route path="/collection/:id" element={<Layout showRightPanel={false}><CollectionAlbumDetail /></Layout>} />
          <Route path="/people" element={<Layout><People /></Layout>} />
          <Route path="/lists/:id" element={<Layout showRightPanel={false}><ListDetail /></Layout>} />
          <Route path="/listsRemix/:id" element={<Layout showRightPanel={false}><ListRemix /></Layout>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/profile" element={<Layout showRightPanel={false}><Profile /></Layout>} />
          <Route path="/profile/:username" element={<Layout showRightPanel={false}><Profile /></Layout>} />
          <Route path="/listAddAlbum/:id" element={<Layout showRightPanel={false}><ListAddAlbum /></Layout>} />
          <Route path="/listAddAlbum" element={<Layout showRightPanel={false}><ListAddAlbum /></Layout>} />
          <Route path="/listsSearch/:id" element={<Layout showRightPanel={false}><ListSearch /></Layout>} />
          <Route path="/listsSearch" element={<Layout showRightPanel={false}><ListSearch /></Layout>} />
          <Route path="/listsSearch" element={<Layout showRightPanel={false}><ListSearch /></Layout>} />
          <Route path="/albums/:id" element={<Layout showRightPanel={false}><AlbumDetail /></Layout>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
