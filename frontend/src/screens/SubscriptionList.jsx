import React, { useEffect, useState } from 'react'
import { Table } from 'react-bootstrap'
import axios from 'axios'

export default function SubscriptionList() {
  const [list, setList] = useState([])

  useEffect(() => {
    async function fetchList() {
      try {
        const { data } = await axios.get('/api/v1/subscriptions/list/')
        setList(data)
      } catch (err) {
        console.error(err)
      }
    }
    fetchList()
  }, [])

  return (
    <div>
      <h2>Subscriptions</h2>
      <Table striped bordered hover responsive className='table-sm'>
        <thead>
          <tr>
            <th>User</th>
            <th>Tier</th>
            <th>Subscribed At</th>
          </tr>
        </thead>
        <tbody>
          {list.map(s => (
            <tr key={s._id}>
              <td>{s.user && s.user.email}</td>
              <td>{s.tier && s.tier.name}</td>
              <td>{new Date(s.subscribed_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  )
}
