import React from 'react'
import { Row, Col, Card, Button } from 'react-bootstrap'

export default function SubscriptionScreen() {
  const tiers = [
    { id: 1, name: 'Basic', price: 5, max_usage: 3 },
    { id: 2, name: 'Plus', price: 9, max_usage: 5 },
    { id: 3, name: 'Pro', price: 15, max_usage: 10 },
  ]

  return (
    <Row>
      {tiers.map(t => (
        <Col md={4} key={t.id}>
          <Card className='mb-3'>
            <Card.Body>
              <Card.Title>{t.name}</Card.Title>
              <Card.Text>Price: ${t.price}/month</Card.Text>
              <Card.Text>Chatbot usages: {t.max_usage}</Card.Text>
              <Button variant='primary'>Subscribe with PayPal</Button>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  )
}
