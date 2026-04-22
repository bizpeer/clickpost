import React from 'react';
import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
