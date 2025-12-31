import { Routes, Route } from 'react-router'
import HomePage from '@pages/HomePage'
import LoginPage from '@pages/auth/LoginPage'
import RegisterPage from '@pages/auth/RegisterPage'
import UnauthorizedPage from '@pages/auth/UnauthorizedPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
    </Routes>
  )
}

export default App
