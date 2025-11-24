import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppHeader } from './AppHeader';

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#F1F5F9]">
      <AppHeader />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
