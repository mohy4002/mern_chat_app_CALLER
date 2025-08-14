import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Link } from 'react-scroll';
import logo from '../../assets/caller.png';

function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);


  useEffect(() => {
    const handleResize = () => {
      setViewportHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  useEffect(() => {
    const handleScroll = () => {
      const position = window.pageYOffset;
      setScrollPosition(position);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <nav className={`nav-container ${menuOpen ? 'open' : ''} ${scrollPosition>=viewportHeight-10 ? 'passed' : '' }`}>
      <span className="logo">
        <h1>caller</h1>
      </span>


      <ul className={`nav-links ${menuOpen ? 'show' : ''}`}>
        <li><Link to="section1" smooth={true} duration={200} onClick={() => setMenuOpen(false)}>Home</Link></li>
        <li><Link to="section2" smooth={true} duration={200} onClick={() => setMenuOpen(false)}>About</Link></li>
        <li><Link to="section3" smooth={true} duration={200} onClick={() => setMenuOpen(false)}>Reviews</Link></li>
        <li><Link to="section4" smooth={true} duration={200} onClick={() => setMenuOpen(false)}>Our team</Link></li>
      </ul>

      <div className={`buttons ${menuOpen ? 'show' : ''}`}>
        <RouterLink to="/login" className='login'>Sign In</RouterLink>
        <RouterLink to="/sign_up" className='sign'>Sign Up</RouterLink>
      </div>
      {/* Hamburger menu for small screens */}
      <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </button>
    </nav>
  );
}

export default Navigation;
