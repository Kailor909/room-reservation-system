import { NavLink } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
      <div className="container">
        <span className="navbar-brand fw-bold">Office Booking</span>
        <div className="navbar-nav">
          <NavLink 
            to="/rooms" 
            className={({ isActive }) => `nav-link ${isActive ? 'active fw-bold' : ''}`}
          >
            Kambariai
          </NavLink>
          <NavLink 
            to="/reservations" 
            className={({ isActive }) => `nav-link ${isActive ? 'active fw-bold' : ''}`}
          >
            Rezervacijos
          </NavLink>
          <NavLink 
            to="/users" 
            className={({ isActive }) => `nav-link ${isActive ? 'active fw-bold' : ''}`}
          >
            Vartotojai
          </NavLink>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;