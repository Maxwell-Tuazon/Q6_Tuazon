import React, { useState } from 'react'
import { Form, Button, Row, Col } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const submitHandler = async (e) => {
    e.preventDefault()
    try {
      const { data } = await axios.post('/api/v1/users/login/', { email, password })
      localStorage.setItem('userInfo', JSON.stringify(data))
      navigate('/')
    } catch (err) {
      const msg = err.response && err.response.data.detail ? err.response.data.detail : err.message
      alert('Login failed: ' + msg)
    }
  }

  return (
    <Row className='justify-content-md-center'>
      <Col xs={12} md={6}>
        <h2>Sign In</h2>
        <Form onSubmit={submitHandler}>
          <Form.Group controlId='email' className='my-2'>
            <Form.Label>Email</Form.Label>
            <Form.Control type='email' placeholder='Enter email' value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Form.Group>

          <Form.Group controlId='password' className='my-2'>
            <Form.Label>Password</Form.Label>
            <Form.Control type='password' placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)} required />
          </Form.Group>

          <Button type='submit' variant='primary' className='my-2'>Sign In</Button>
        </Form>
      </Col>
    </Row>
  )
}

export default SignIn
