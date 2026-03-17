import React, { useState } from 'react'
import { Form, Button, Row, Col } from 'react-bootstrap'
import axios from 'axios'

export default function ApplySeller() {
  const [message, setMessage] = useState('')

  const submitHandler = async (e) => {
    e.preventDefault()
    try {
      const { data } = await axios.post('/api/v1/applications/apply/', { message })
      alert('Application submitted')
    } catch (err) {
      const msg = err.response && err.response.data.detail ? err.response.data.detail : err.message
      alert('Application failed: ' + msg)
    }
  }

  return (
    <Row className='justify-content-md-center'>
      <Col xs={12} md={8}>
        <h2>Apply to Become a Seller</h2>
        <Form onSubmit={submitHandler}>
          <Form.Group controlId='message' className='my-2'>
            <Form.Label>Tell us about your services</Form.Label>
            <Form.Control as='textarea' rows={4} value={message} onChange={(e) => setMessage(e.target.value)} />
          </Form.Group>
          <Button type='submit' variant='primary'>Submit Application</Button>
        </Form>
      </Col>
    </Row>
  )
}
