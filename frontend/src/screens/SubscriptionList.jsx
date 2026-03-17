import React, { useEffect, useState } from 'react'
import { Table, Alert } from 'react-bootstrap'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function SubscriptionList() {
  const [list, setList] = useState([])
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null
    if (!userInfo || !(userInfo.user && (userInfo.user.role === 'Admin' || userInfo.user.is_staff))) {
      navigate('/signin')
      return
    }

    async function fetchList() {
      try {
        const { data } = await axios.get('/api/v1/subscriptions/list/')
        setList(data)
      } catch (err) {
        setError(err.response && err.response.data ? JSON.stringify(err.response.data) : err.message)
      }
    }
    fetchList()
  }, [navigate])

  return (
    <div>
      <h2>Subscriptions</h2>
      {error && <Alert variant='danger'>{error}</Alert>}
      <Table striped bordered hover responsive className='table-sm'>
        <thead>
          <tr>
            <th>User</th>
            <th>Tier</th>
            <th>Usage Left</th>
            <th>Subscribed At</th>
          </tr>
        </thead>
        <tbody>
          {list.map(s => (
            <tr key={s.id}>
              <td>{s.user_email}</td>
              <td>{s.tier_name}</td>
              <td>{s.usage_left}</td>
              <td>{new Date(s.subscribed_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  )
}
