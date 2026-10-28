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
import MyLists from "./pages/MyLists";
import MySavedLists from "./pages/MySavedLists";
import MyLikedLists from "./pages/MyLikedLists";
import PeopleFollowing from "./pages/PeopleFollowing";
import PeopleFollowers from "./pages/PeopleFollowers";
import ProfileDetail from "./pages/ProfileDetail";
import ProfileForm from "./pages/ProfileForm";
import ShoppingCart from "./pages/ShoppingCart";
import ShippingAddressForm from "./pages/ShippingAddressForm";
import Checkout from "./pages/Checkout";
import MyActiveOrders from "./pages/MyActiveOrders";
import MyCancelledOrders from "./pages/MyCancelledOrders";
import MyCompletedOrders from "./pages/MyCompletedOrders";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout><Home /></Layout>} />
          {/* Debates */}
          <Route path="/debates" element={<Layout showRightPanel={false}><Debates /></Layout>} />
          <Route path="/debates/:id" element={<Layout showRightPanel={false}><DebateDetail /></Layout>} />
          {/* List */}
          <Route path="/topLists" element={<Layout><TopLists /></Layout>} />
          <Route path="/topLists/mine" element={<Layout><MyLists /></Layout>} />
          <Route path="/topLists/saved" element={<Layout><MySavedLists /></Layout>} />
          <Route path="/topLists/liked" element={<Layout><MyLikedLists /></Layout>} />
          <Route path="/listForm/new" element={<Layout showRightPanel={false}><ListForm /></Layout>} />          
          <Route path="/listForm/:id/edit" element={<Layout showRightPanel={false}><ListForm /></Layout>} />
          <Route path="/lists/:id" element={<Layout showRightPanel={false}><ListDetail /></Layout>} />
          <Route path="/listsRemix/:id" element={<Layout showRightPanel={false}><ListRemix /></Layout>} />
          <Route path="/listAddAlbum/:id" element={<Layout showRightPanel={false}><ListAddAlbum /></Layout>} />
          <Route path="/listAddAlbum" element={<Layout showRightPanel={false}><ListAddAlbum /></Layout>} />
          {/* Hunt */}
          <Route path="/huntForm/new" element={<Layout showRightPanel={false}><HuntForm /></Layout>} />
          <Route path="/huntForm/:id/edit" element={<Layout showRightPanel={false}><HuntForm /></Layout>} />
          <Route path="/huntDetail/:id" element={<Layout showRightPanel={false}><HuntDetails /></Layout>} />
          <Route path="/hunt" element={<Layout><Hunt /></Layout>} />
          {/* Collection */}
          <Route path="/collectionAlbumForm/new" element={<Layout showRightPanel={false}><CollectionAlbumForm /></Layout>} />
          <Route path="/collectionAlbumForm/:id/edit" element={<Layout showRightPanel={false}><CollectionAlbumForm /></Layout>} />
          <Route path="/collection" element={<Layout><Collection /></Layout>} />
          <Route path="/collection/:username" element={<Layout><Collection /></Layout>} />
          <Route path="/collectionDetail/:id" element={<Layout showRightPanel={false}><CollectionAlbumDetail /></Layout>} />
          {/* Marketplace */}
          <Route path="/marketplace" element={<Layout showRightPanel={false}><Marketplace /></Layout>} />
          <Route path="/marketplaceDetail/:id" element={<Layout showRightPanel={false}><MarketplaceDetail /></Layout>} />
          {/* User */}
          <Route path="/people" element={<Layout><People /></Layout>} />
          <Route path="/people/following" element={<Layout><PeopleFollowing /></Layout>} />
          <Route path="/people/followers" element={<Layout><PeopleFollowers /></Layout>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/profile" element={<Layout showRightPanel={false}><ProfileDetail /></Layout>} />
          <Route path="/profileForm/edit" element={<Layout showRightPanel={false}><ProfileForm /></Layout>} />
           {/* List search */}
          <Route path="/listsSearch/:id" element={<Layout showRightPanel={false}><ListSearch /></Layout>} />
          <Route path="/listsSearch" element={<Layout showRightPanel={false}><ListSearch /></Layout>} />
          <Route path="/albumDetail/:id" element={<Layout showRightPanel={false}><AlbumDetail /></Layout>} />
            {/* Shopping cart */}
          <Route path="/shoppingCart" element={<Layout showRightPanel={false}><ShoppingCart /></Layout>} />
          <Route path="/checkout" element={<Layout showRightPanel={false}><Checkout /></Layout>} />
          <Route path="/shippingAddressForm/new" element={<Layout showRightPanel={false}><ShippingAddressForm /></Layout>} />
          <Route path="/shippingAddressForm/:id/edit" element={<Layout showRightPanel={false}><ShippingAddressForm /></Layout>} />
          {/* Orders */}
          <Route path="/orders/active" element={<Layout showRightPanel={false}><MyActiveOrders /></Layout>} />
          <Route path="/orders/cancelled" element={<Layout showRightPanel={false}><MyCancelledOrders /></Layout>} />
          <Route path="/orders/completed" element={<Layout showRightPanel={false}><MyCompletedOrders /></Layout>} />

        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
