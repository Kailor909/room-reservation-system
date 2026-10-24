import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import RoomsPage from './pages/RoomsPage';
import ReservationsPage from './pages/ReservationsPage';
import UsersPage from './pages/UsersPage';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="container pb-5">
        <Routes>
          <Route path="/" element={<Navigate to="/rooms" replace />} />
          <Route path="/rooms" element={<RoomsPage />} />
          <Route path="/reservations" element={<ReservationsPage />} />
          <Route path="/users" element={<UsersPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;