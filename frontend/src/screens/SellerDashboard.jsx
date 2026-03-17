import React, { useEffect, useState } from 'react'
import { Row, Col, Form, Button, Card, ListGroup } from 'react-bootstrap'
import axios from 'axios'

export default function SellerDashboard() {
  const [services, setServices] = useState([])
  const [form, setForm] = useState({service_name: '', description: '', price: '', duration_of_service: ''})

  useEffect(() => {
    async function fetchServices() {
      try {
        const { data } = await axios.get('/api/v1/services/manage/')
        setServices(data)
      } catch (err) {
        console.error(err)
      }
    }
    fetchServices()
  }, [])

  const submitHandler = async (e) => {
    e.preventDefault()
    try {
      const { data } = await axios.post('/api/v1/services/manage/', form)
      setServices(prev => [data, ...prev])
      setForm({service_name: '', description: '', price: '', duration_of_service: ''})
    } catch (err) {
      alert('Failed to add service')
    }
  }

  return (
    <Row>
      <Col md={6}>
        <h2>Add Service</h2>
        <Form onSubmit={submitHandler}>
          <Form.Group className='my-2'>
            <Form.Label>Service Name</Form.Label>
            <Form.Control value={form.service_name} onChange={(e) => setForm({...form, service_name: e.target.value})} required />
          </Form.Group>
          <Form.Group className='my-2'>
            <Form.Label>Description</Form.Label>
            <Form.Control as='textarea' rows={4} value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} />
          </Form.Group>
          <Form.Group className='my-2'>
            <Form.Label>Price</Form.Label>
            <Form.Control type='number' value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} />
          </Form.Group>
          <Form.Group className='my-2'>
            <Form.Label>Duration</Form.Label>
            <Form.Control value={form.duration_of_service} onChange={(e) => setForm({...form, duration_of_service: e.target.value})} />
          </Form.Group>
          <Button type='submit' className='my-2'>Add Service</Button>
        </Form>
      </Col>

      <Col md={6}>
        <h2>Your Services</h2>
        {services.map(s => (
          <Card key={s._id} className='mb-2'>
            <ListGroup variant='flush'>
              <ListGroup.Item><strong>{s.service_name}</strong></ListGroup.Item>
              <ListGroup.Item>Price: ${s.price}</ListGroup.Item>
              <ListGroup.Item>Duration: {s.duration_of_service}</ListGroup.Item>
            </ListGroup>
          </Card>
        ))}
      </Col>
    </Row>
  )
}
