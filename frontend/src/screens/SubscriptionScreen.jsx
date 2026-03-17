import React, { useEffect, useState, useRef } from 'react'
import { Row, Col, Card, Alert } from 'react-bootstrap'
import axios from 'axios'

export default function SubscriptionScreen() {
  const [tiers, setTiers] = useState([])
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const scriptLoadedRef = useRef(false)

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

  // Load PayPal SDK (vault=true needed for subscriptions)
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (scriptLoadedRef.current) return
    const clientId = process.env.REACT_APP_PAYPAL_CLIENT_ID
    if (!clientId) {
      console.warn('REACT_APP_PAYPAL_CLIENT_ID not set')
      return
    }
    const s = document.createElement('script')
    s.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&vault=true&components=buttons`
    s.async = true
    s.onload = () => { scriptLoadedRef.current = true }
    document.body.appendChild(s)
    return () => { try { document.body.removeChild(s) } catch (e) {} }
  }, [])

  // Render PayPal Buttons for tiers with paypal_plan_id
  useEffect(() => {
    if (!scriptLoadedRef.current) return
    if (!tiers || !tiers.length) return
    tiers.forEach((t) => {
      const containerId = `paypal-button-container-${t.id}`
      const el = document.getElementById(containerId)
      if (!el) return
      if (el.dataset.rendered) return
      if (!t.paypal_plan_id) return
      try {
        window.paypal.Buttons({
          style: { layout: 'vertical' },
          createSubscription: function (data, actions) {
            return actions.subscription.create({ plan_id: t.paypal_plan_id })
          },
          onApprove: async function (data, actions) {
            try {
              await axios.post('/api/v1/subscriptions/activate/', { subscription_id: data.subscriptionID, plan_id: t.paypal_plan_id })
              setSuccess(`Subscribed to ${t.name}`)
            } catch (e) {
              console.error('Activation failed', e)
              setError('Subscription activation failed')
            }
          },
          onError: function (err) {
            console.error('PayPal Buttons error', err)
            setError('PayPal error')
          }
        }).render(`#${containerId}`)
        el.dataset.rendered = '1'
      } catch (err) {
        console.error('Failed to render PayPal Buttons', err)
      }
    })
  }, [tiers])

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
                {t.paypal_plan_id ? (
                  <div id={`paypal-button-container-${t.id}`} />
                ) : (
                  <div><em>No PayPal Plan ID configured for this tier.</em></div>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  )
}
