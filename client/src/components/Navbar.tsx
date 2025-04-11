import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          AI Dashboard
        </Link>
        <ul className="nav-menu">
          {/* <li className="nav-item">
            <Link to="/" className="nav-link">
              Dashboard
            </Link>
          </li> */}
          <li className="nav-item">
            <Link to="/screenshot" className="nav-link">
              Screenshot
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/websearch" className="nav-link">
              Web Search
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
