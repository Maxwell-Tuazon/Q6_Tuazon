import React, { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Alert } from 'react-bootstrap'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function AdminApplications() {
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showApprove, setShowApprove] = useState(false)
  const [showDecline, setShowDecline] = useState(false)
  const [currentApp, setCurrentApp] = useState(null)
  const [merchantId, setMerchantId] = useState('')
  const [declineReason, setDeclineReason] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const raw = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null
    const role = raw && raw.user ? raw.user.role : raw && raw.role
    if (!raw || role !== 'Admin') {
      navigate('/signin')
      return
    }

    async function load() {
      try {
        const { data } = await axios.get('/api/v1/applications/admin/list/')
        setApps(data)
      } catch (err) {
        setError(err.response && err.response.data ? JSON.stringify(err.response.data) : err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [navigate])

  const openApprove = (app) => {
    setCurrentApp(app)
    setMerchantId(app.user && app.user.merchant_id ? app.user.merchant_id : '')
    setShowApprove(true)
  }

  const confirmApprove = async () => {
    try {
      await axios.post(`/api/v1/applications/admin/approve/${currentApp.id}/`, { merchant_id: merchantId })
      setApps(apps.filter(a => a.id !== currentApp.id))
      setShowApprove(false)
    } catch (err) {
      alert('Approve failed: ' + (err.response && err.response.data ? JSON.stringify(err.response.data) : err.message))
    }
  }

  const openDecline = (app) => {
    setCurrentApp(app)
    setDeclineReason('')
    setShowDecline(true)
  }

  const confirmDecline = async () => {
    try {
      await axios.post(`/api/v1/applications/admin/decline/${currentApp.id}/`, { reason: declineReason })
      setApps(apps.filter(a => a.id !== currentApp.id))
      setShowDecline(false)
    } catch (err) {
      alert('Decline failed: ' + (err.response && err.response.data ? JSON.stringify(err.response.data) : err.message))
    }
  }

  return (
    <div>
      <h2>Seller Applications</h2>
      {error && <Alert variant='danger'>{error}</Alert>}
      <Table striped bordered hover responsive className='table-sm'>
        <thead>
          <tr>
            <th>User</th>
            <th>Submitted</th>
            <th>Message</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {apps.map(a => (
            <tr key={a.id}>
              <td>{a.user ? `${a.user.first_name || ''} ${a.user.last_name || ''}`.trim() || a.user.email : '—'}</td>
              <td>{new Date(a.created_at).toLocaleString()}</td>
              <td>{a.message}</td>
              <td>
                <Button size='sm' variant='success' onClick={() => openApprove(a)}>Approve</Button>{' '}
                <Button size='sm' variant='danger' onClick={() => openDecline(a)}>Decline</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showApprove} onHide={() => setShowApprove(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Approve Application</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className='mb-2'>
              <Form.Label>Merchant ID</Form.Label>
              <Form.Control value={merchantId} onChange={(e) => setMerchantId(e.target.value)} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={() => setShowApprove(false)}>Cancel</Button>
          <Button variant='primary' onClick={confirmApprove}>Confirm Approve</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDecline} onHide={() => setShowDecline(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Decline Application</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className='mb-2'>
              <Form.Label>Reason</Form.Label>
              <Form.Control as='textarea' value={declineReason} onChange={(e) => setDeclineReason(e.target.value)} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={() => setShowDecline(false)}>Cancel</Button>
          <Button variant='danger' onClick={confirmDecline}>Confirm Decline</Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
