import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../Header';
import './index.css';

const Layout = () => {
  return (
    <div className="layout-container">
      <Header />
      <main className="main-content container">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;