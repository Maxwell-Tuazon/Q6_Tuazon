import React, { useEffect, useState } from 'react'
import { Row, Col, Form, Button, Card, ListGroup } from 'react-bootstrap'
import axios from 'axios'

export default function SellerDashboard() {
  const [services, setServices] = useState([])
  const [form, setForm] = useState({service_name: '', description: '', price: '', duration_of_service: ''})
  const [file, setFile] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({service_name: '', description: '', price: '', duration_of_service: ''})
  const [editFile, setEditFile] = useState(null)

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
      const formData = new FormData()
      formData.append('service_name', form.service_name)
      formData.append('description', form.description)
      formData.append('price', form.price)
      formData.append('duration_of_service', form.duration_of_service)
      if (file) formData.append('sample_image', file)

      const { data } = await axios.post('/api/v1/services/manage/', formData)
      setServices(prev => [data, ...prev])
      setForm({service_name: '', description: '', price: '', duration_of_service: ''})
      setFile(null)
      // reset file input value
      const input = document.getElementById('sampleImageInput')
      if (input) input.value = null
    } catch (err) {
      const msg = err.response && err.response.data ? JSON.stringify(err.response.data) : err.message
      alert('Failed to add service: ' + msg)
      console.error('Add service error:', err.response || err)
    }
  }

  const startEdit = (s) => {
    setEditingId(s.id)
    setEditForm({
      service_name: s.service_name || '',
      description: s.description || '',
      price: s.price || '',
      duration_of_service: s.duration_of_service || ''
    })
    setEditFile(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({service_name: '', description: '', price: '', duration_of_service: ''})
    setEditFile(null)
  }

  const submitEdit = async (e) => {
    e.preventDefault()
    try {
      const formData = new FormData()
      formData.append('service_name', editForm.service_name)
      formData.append('description', editForm.description)
      formData.append('price', editForm.price)
      formData.append('duration_of_service', editForm.duration_of_service)
      if (editFile) formData.append('sample_image', editFile)

      const { data } = await axios.put(`/api/v1/services/manage/${editingId}/`, formData)
      setServices(prev => prev.map(s => (s.id === data.id ? data : s)))
      cancelEdit()
    } catch (err) {
      const msg = err.response && err.response.data ? JSON.stringify(err.response.data) : err.message
      alert('Failed to update service: ' + msg)
      console.error('Update service error:', err.response || err)
    }
  }

  const deleteService = async (id) => {
    if (!window.confirm('Delete this service?')) return
    try {
      await axios.delete(`/api/v1/services/manage/${id}/`)
      setServices(prev => prev.filter(s => s.id !== id))
    } catch (err) {
      const msg = err.response && err.response.data ? JSON.stringify(err.response.data) : err.message
      alert('Failed to delete service: ' + msg)
      console.error('Delete service error:', err.response || err)
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
          <Form.Group className='my-2'>
            <Form.Label>Sample Image</Form.Label>
            <Form.Control id='sampleImageInput' type='file' accept='image/*' onChange={(e) => setFile(e.target.files[0])} />
          </Form.Group>
          <Button type='submit' className='my-2'>Add Service</Button>
        </Form>
      </Col>

      <Col md={6}>
        <h2>Your Services</h2>
        {services.map(s => (
          <Card key={s.id || s._id} className='mb-2'>
            {s.sample_image && (
              <Card.Img variant='top' src={s.sample_image.startsWith('http') ? s.sample_image : `/media/${s.sample_image}`} />
            )}
            {editingId === s.id ? (
              <Card.Body>
                <Form onSubmit={submitEdit}>
                  <Form.Group className='my-2'>
                    <Form.Label>Service Name</Form.Label>
                    <Form.Control value={editForm.service_name} onChange={(e) => setEditForm({...editForm, service_name: e.target.value})} required />
                  </Form.Group>
                  <Form.Group className='my-2'>
                    <Form.Label>Description</Form.Label>
                    <Form.Control as='textarea' rows={3} value={editForm.description} onChange={(e) => setEditForm({...editForm, description: e.target.value})} />
                  </Form.Group>
                  <Form.Group className='my-2'>
                    <Form.Label>Price</Form.Label>
                    <Form.Control type='number' value={editForm.price} onChange={(e) => setEditForm({...editForm, price: e.target.value})} />
                  </Form.Group>
                  <Form.Group className='my-2'>
                    <Form.Label>Duration</Form.Label>
                    <Form.Control value={editForm.duration_of_service} onChange={(e) => setEditForm({...editForm, duration_of_service: e.target.value})} />
                  </Form.Group>
                  <Form.Group className='my-2'>
                    <Form.Label>Sample Image</Form.Label>
                    <Form.Control type='file' accept='image/*' onChange={(e) => setEditFile(e.target.files[0])} />
                  </Form.Group>
                  <Button type='submit' className='me-2'>Save</Button>
                  <Button variant='secondary' onClick={cancelEdit}>Cancel</Button>
                </Form>
              </Card.Body>
            ) : (
              <>
                <ListGroup variant='flush'>
                  <ListGroup.Item><strong>{s.service_name}</strong></ListGroup.Item>
                  {s.description && <ListGroup.Item>{s.description}</ListGroup.Item>}
                  <ListGroup.Item>Price: ${s.price}</ListGroup.Item>
                  <ListGroup.Item>Duration: {s.duration_of_service}</ListGroup.Item>
                </ListGroup>
                <Card.Body>
                  <Button className='me-2' onClick={() => startEdit(s)}>Edit</Button>
                  <Button variant='danger' onClick={() => deleteService(s.id)}>Delete</Button>
                </Card.Body>
              </>
            )}
          </Card>
        ))}
      </Col>
    </Row>
  )
}
