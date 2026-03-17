import React, { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Alert } from 'react-bootstrap'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showEdit, setShowEdit] = useState(false)
  const [editUser, setEditUser] = useState(null)
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
        const { data } = await axios.get('/api/v1/users/admin/users/')
        setUsers(data)
      } catch (err) {
        setError(err.response && err.response.data ? JSON.stringify(err.response.data) : err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [navigate])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return
    try {
      await axios.delete(`/api/v1/users/admin/users/${id}/`)
      setUsers(users.filter(u => u.id !== id))
    } catch (err) {
      alert('Delete failed: ' + (err.response && err.response.data ? JSON.stringify(err.response.data) : err.message))
    }
  }

  const openEdit = (user) => {
    setEditUser(user)
    setShowEdit(true)
  }

  const saveEdit = async () => {
    try {
      const payload = {
        first_name: editUser.first_name,
        username: editUser.username,
        last_name: editUser.last_name,
        email: editUser.email,
        role: editUser.role,
        merchant_id: editUser.merchant_id,
      }
      const { data } = await axios.put(`/api/v1/users/admin/users/${editUser.id}/`, payload)
      setUsers(users.map(u => (u.id === data.id ? data : u)))
      setShowEdit(false)
    } catch (err) {
      alert('Update failed: ' + (err.response && err.response.data ? JSON.stringify(err.response.data) : err.message))
    }
  }

  return (
    <div>
      <h2>Users</h2>
      {error && <Alert variant='danger'>{error}</Alert>}
      <Table striped bordered hover responsive className='table-sm'>
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Merchant ID</th>
            <th>Role</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.first_name}</td>
              <td>{u.last_name}</td>
              <td>{u.email}</td>
              <td>{u.merchant_id || ''}</td>
              <td>{u.role}</td>
              <td>
                <Button size='sm' variant='outline-primary' onClick={() => openEdit(u)}>Edit</Button>{' '}
                <Button size='sm' variant='outline-danger' onClick={() => handleDelete(u.id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showEdit} onHide={() => setShowEdit(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editUser && (
            <Form>
              <Form.Group className='mb-2'>
                <Form.Label>First Name</Form.Label>
                <Form.Control value={editUser.first_name || ''} onChange={(e) => setEditUser({...editUser, first_name: e.target.value})} />
              </Form.Group>
              <Form.Group className='mb-2'>
                <Form.Label>Username</Form.Label>
                <Form.Control value={editUser.username || ''} onChange={(e) => setEditUser({...editUser, username: e.target.value})} />
              </Form.Group>
              <Form.Group className='mb-2'>
                <Form.Label>Last Name</Form.Label>
                <Form.Control value={editUser.last_name || ''} onChange={(e) => setEditUser({...editUser, last_name: e.target.value})} />
              </Form.Group>
              <Form.Group className='mb-2'>
                <Form.Label>Email</Form.Label>
                <Form.Control value={editUser.email || ''} onChange={(e) => setEditUser({...editUser, email: e.target.value})} />
              </Form.Group>
              <Form.Group className='mb-2'>
                <Form.Label>Role</Form.Label>
                <Form.Select value={editUser.role || 'User'} onChange={(e) => setEditUser({...editUser, role: e.target.value})}>
                  <option value='User'>User</option>
                  <option value='Seller'>Seller</option>
                  <option value='Admin'>Admin</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className='mb-2'>
                <Form.Label>Merchant ID</Form.Label>
                <Form.Control value={editUser.merchant_id || ''} onChange={(e) => setEditUser({...editUser, merchant_id: e.target.value})} />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={() => setShowEdit(false)}>Cancel</Button>
          <Button variant='primary' onClick={saveEdit}>Save</Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
