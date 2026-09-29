import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="header-bar" role="banner">
      <div className="header-inner">
        <Link to="/" className="brand-title" aria-label="ColorTrace Home">
          {/* Minimal 4-patch reference card mark */}
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true" style={{ verticalAlign: 'middle' }}>
            <rect x="1" y="1" width="9" height="9" fill="#f0f0f0" stroke="#333" strokeWidth="1.2" />
            <rect x="12" y="1" width="9" height="9" fill="#808080" stroke="#333" strokeWidth="1.2" />
            <rect x="1" y="12" width="9" height="9" fill="#2878c8" stroke="#333" strokeWidth="1.2" />
            <rect x="12" y="12" width="9" height="9" fill="#c83246" stroke="#333" strokeWidth="1.2" />
          </svg>
          <span>COLORTRACE</span>
        </Link>

        <nav aria-label="Main Navigation">
          <ul className="nav-links">
            <li>
              <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/test/new" className={`nav-link ${isActive('/test') ? 'active' : ''}`}>
                Start New Test
              </Link>
            </li>
            <li>
              <Link to="/records" className={`nav-link ${isActive('/records') ? 'active' : ''}`}>
                Test History
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};
