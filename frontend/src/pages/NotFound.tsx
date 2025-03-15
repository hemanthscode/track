// src/pages/NotFound.tsx
import React from 'react'

const NotFound: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
      <p className="text-gray-600">Oops! Page not found.</p>
    </div>
  )
}

export default NotFound