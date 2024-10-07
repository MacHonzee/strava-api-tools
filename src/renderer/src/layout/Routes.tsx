import React from 'react'
import { Routes as ReactRouterRoutes, Route } from 'react-router-dom'
import Profile from '../routes/Profile'
import Activities from '../routes/Activities'

function Routes(): React.ReactNode {
  return (
    <ReactRouterRoutes>
      <Route path="/*" element={<Profile />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/activities" element={<Activities />} />
    </ReactRouterRoutes>
  )
}

export default Routes
