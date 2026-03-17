import React, { useState, useEffect } from 'react'
import { Form, Button, Row, Col } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { register } from '../actions/authActions'

function SignUp() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [phone, setPhone] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [location, setLocation] = useState('')
  const [gender, setGender] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const userRegister = useSelector(state => state.userRegister)
  const { userInfo, loading, error } = userRegister

  useEffect(() => {
    if (userInfo) {
      navigate('/')
    }
  }, [userInfo, navigate])

  const submitHandler = (e) => {
    e.preventDefault()
    if (password !== confirmPassword) return alert('Passwords do not match')
    const form = {
      email,
      username,
      phone_number: phone,
      first_name: firstName,
      last_name: lastName,
      location,
      gender,
      password,
    }
    dispatch(register(form))
  }

  return (
    <Row className='justify-content-md-center'>
      <Col xs={12} md={8}>
        <h2>Sign Up</h2>
        {error && <div className='alert alert-danger'>{error}</div>}
        <Form onSubmit={submitHandler}>
          <Form.Group controlId='email' className='my-2'>
            <Form.Label>Email</Form.Label>
            <Form.Control type='email' placeholder='Enter email' value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Form.Group>

          <Form.Group controlId='username' className='my-2'>
            <Form.Label>Username</Form.Label>
            <Form.Control type='text' placeholder='Username' value={username} onChange={(e) => setUsername(e.target.value)} required />
          </Form.Group>

          <Form.Group controlId='phone' className='my-2'>
            <Form.Label>Phone Number</Form.Label>
            <Form.Control type='text' placeholder='Phone number' value={phone} onChange={(e) => setPhone(e.target.value)} />
          </Form.Group>

          <Row>
            <Col>
              <Form.Group controlId='firstName' className='my-2'>
                <Form.Label>First Name</Form.Label>
                <Form.Control type='text' value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId='lastName' className='my-2'>
                <Form.Label>Last Name</Form.Label>
                <Form.Control type='text' value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group controlId='location' className='my-2'>
            <Form.Label>Location</Form.Label>
            <Form.Control type='text' value={location} onChange={(e) => setLocation(e.target.value)} />
          </Form.Group>

          <Form.Group controlId='gender' className='my-2'>
            <Form.Label>Gender</Form.Label>
            <Form.Control as='select' value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value=''>Select</option>
              <option value='M'>Male</option>
              <option value='F'>Female</option>
              <option value='O'>Other</option>
            </Form.Control>
          </Form.Group>

          <Form.Group controlId='password' className='my-2'>
            <Form.Label>Password</Form.Label>
            <Form.Control type='password' placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)} required />
          </Form.Group>

          <Form.Group controlId='confirmPassword' className='my-2'>
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control type='password' placeholder='Confirm password' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          </Form.Group>

          <Button type='submit' variant='primary' className='my-2' disabled={loading}>{loading ? 'Registering…' : 'Register'}</Button>
        </Form>
      </Col>
    </Row>
  )
}

export default SignUp
