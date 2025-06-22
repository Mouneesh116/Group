import React from 'react'

const ProtectedRoute = ({children,allowedRoles}) => {
    const { user } =useAuth();
  return (
    <div>

    </div>
  )
}

export default ProtectedRoute