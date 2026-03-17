import React, { useEffect, useState } from 'react'
import { Row, Col, Card, ListGroup } from 'react-bootstrap'
import axios from 'axios'

export default function UserProfile() {
  const [user, setUser] = useState({})
  const [orders, setOrders] = useState([])

  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data } = await axios.get('/api/v1/users/profile/')
        setUser(data)
      } catch (err) {
        console.error(err)
      }
    }
    async function fetchOrders() {
      try {
        const { data } = await axios.get('/api/v1/orders/history/')
        setOrders(data)
      } catch (err) {
        console.error(err)
      }
    }
    fetchProfile()
    fetchOrders()
  }, [])

  return (
    <Row>
      <Col md={4}>
        <Card>
          <ListGroup variant='flush'>
            <ListGroup.Item><strong>{user.first_name} {user.last_name}</strong></ListGroup.Item>
            <ListGroup.Item>{user.email}</ListGroup.Item>
            <ListGroup.Item>{user.username}</ListGroup.Item>
          </ListGroup>
        </Card>
      </Col>
      <Col md={8}>
        <h2>Your Orders</h2>
        {orders.length === 0 ? (
          <div>No orders yet</div>
        ) : (
          orders.map(o => (
            <Card key={o.id} className='mb-2'>
              <ListGroup variant='flush'>
                <ListGroup.Item>Service: {o.service_name || (o.service && (o.service.service_name || o.service.name)) || 'Unknown'}</ListGroup.Item>
                <ListGroup.Item>Price: ${o.price_paid}</ListGroup.Item>
                <ListGroup.Item>Date: {new Date(o.date_purchased).toLocaleString()}</ListGroup.Item>
              </ListGroup>
            </Card>
          ))
        )}
      </Col>
    </Row>
  )
}
