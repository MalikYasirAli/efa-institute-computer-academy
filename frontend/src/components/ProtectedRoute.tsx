import React from 'react'

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Lightweight placeholder — real auth check handled via supabase client in Admin area
  // In-app checks will use supabase.auth.getSession() or user context
  return <>{children}</>
}

export default ProtectedRoute
