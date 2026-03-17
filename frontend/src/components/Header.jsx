import React from 'react'
import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { logout } from '../actions/authActions'

function Header() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const rawUserInfo = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null
  const userInfo = rawUserInfo && rawUserInfo.user ? rawUserInfo.user : rawUserInfo

  const logoutHandler = () => {
    dispatch(logout())
    navigate('/signin')
  }
  return (
    <Navbar expand="lg" bg='primary' variant='dark' collapseOnSelect>
      <Container>
        <Navbar.Brand href="/">Pest & Wildlife Control</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
            {userInfo ? (
              <>
                {userInfo.role === 'Admin' && (
                  <NavDropdown title='Admin' id='admin-dropdown'>
                    <LinkContainer to="/admin/users"><NavDropdown.Item>Users</NavDropdown.Item></LinkContainer>
                    <LinkContainer to="/admin/applications"><NavDropdown.Item>Applications</NavDropdown.Item></LinkContainer>
                    <LinkContainer to="/admin/subscriptions"><NavDropdown.Item>Subscriptions</NavDropdown.Item></LinkContainer>
                  </NavDropdown>
                )}
                <NavDropdown title={userInfo.first_name || userInfo.username || userInfo.email || userInfo.email} id='username'>
                  <LinkContainer to="/profile"><NavDropdown.Item>Profile</NavDropdown.Item></LinkContainer>
                  <LinkContainer to="/seller/dashboard"><NavDropdown.Item>Seller Dashboard</NavDropdown.Item></LinkContainer>
                  <NavDropdown.Item onClick={logoutHandler}>Logout</NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <>
                <LinkContainer to="/signin"><Nav.Link>Sign In</Nav.Link></LinkContainer>
                <LinkContainer to="/signup"><Nav.Link>Sign Up</Nav.Link></LinkContainer>
              </>
            )}
          <Nav className="me-auto">
            <LinkContainer to="/"><Nav.Link>Home</Nav.Link></LinkContainer>
            <LinkContainer to="/apply-seller"><Nav.Link>Apply Seller</Nav.Link></LinkContainer>
            <LinkContainer to="/subscriptions"><Nav.Link>Subscriptions</Nav.Link></LinkContainer>
            <LinkContainer to="/chat"><Nav.Link>AI Chatbot</Nav.Link></LinkContainer>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header
