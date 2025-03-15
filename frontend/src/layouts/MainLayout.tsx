// src/layouts/MainLayout.tsx
import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from '../components/common/Header'
import Footer from '../components/common/Footer'

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col" style={{ '--header-height': '64px' } as React.CSSProperties}>
      <Header />
      <main className="flex-grow" style={{ marginTop: 'var(--header-height)' }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default MainLayout