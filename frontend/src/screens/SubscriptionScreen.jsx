import React, { useEffect, useState } from 'react'
import { Row, Col, Card, Button, Alert } from 'react-bootstrap'
import axios from 'axios'

export default function SubscriptionScreen() {
  const [tiers, setTiers] = useState([])
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const { data } = await axios.get('/api/v1/subscriptions/tiers/')
        setTiers(data)
      } catch (err) {
        setError(err.response && err.response.data ? JSON.stringify(err.response.data) : err.message)
      }
    }
    load()
  }, [])

  const subscribe = async (tierId) => {
    setError(null)
    setSuccess(null)
    try {
      const { data } = await axios.post('/api/v1/subscriptions/subscribe/', { tier: tierId })
      setSuccess(`Subscribed to ${data.tier_name}. Usages: ${data.usage_left}`)
    } catch (err) {
      setError(err.response && err.response.data ? JSON.stringify(err.response.data) : err.message)
    }
  }

  return (
    <>
      {error && <Alert variant='danger'>{error}</Alert>}
      {success && <Alert variant='success'>{success}</Alert>}
      <Row>
        {tiers.map(t => (
          <Col md={4} key={t.id}>
            <Card className='mb-3'>
              <Card.Body>
                <Card.Title>{t.name}</Card.Title>
                <Card.Text>Price: ${t.price}/month</Card.Text>
                <Card.Text>Chatbot usages: {t.max_usage}</Card.Text>
                <Button variant='primary' onClick={() => subscribe(t.id)}>Subscribe</Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  )
}
