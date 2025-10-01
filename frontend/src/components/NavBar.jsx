import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/navlogo.png';
import { Navbar, Container, Nav } from 'react-bootstrap';

const NavBar = () => {
  return (
    <Navbar
      expand="lg"
      variant="light"
      fixed="top"
      className="shadow-sm"
      style={{
        backgroundColor: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(10px)',
        padding: '0.5rem 2rem',
      }}
    >
      <Container>
        <Navbar.Brand as={Link} to="/">
          <img
            src={logo}
            alt="Udhyan Setu"
            height="50"
            style={{ borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
          />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/" className="mx-2 fw-bold text-success hover-scale">Home</Nav.Link>
            <Nav.Link as={Link} to="/login" className="mx-2 fw-bold text-success hover-scale">Login</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>

      <style>{`
        .hover-scale:hover {
          transform: scale(1.08);
          transition: transform 0.2s ease;
        }
      `}</style>
    </Navbar>
  );
};

export default NavBar;
