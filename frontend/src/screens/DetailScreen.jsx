import {useParams, Link} from 'react-router-dom';

import {Row, Col, Image, ListGroup, Card, Button} from 'react-bootstrap';
import Rating from '../components/Rating';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useRef } from 'react';

export default function DetailScreen() {
    const {id} = useParams();
    const [service, setService] = useState({});

    useEffect(() => {
        async function fetchService() {
            try {
                const { data } = await axios.get(`/api/v1/services/${id}/`);
                setService(data);
            } catch (err) {
                console.error(err);
            }
        }
        fetchService();
    }, [id]);

    const [paypalReady, setPaypalReady] = useState(false)
    const paypalRef = useRef()
    const [paypalError, setPaypalError] = useState(null)

    useEffect(() => {
        // load PayPal SDK script if not already loaded
        const addPaypalScript = async () => {
            if (window.paypal) {
                setPaypalReady(true)
                return
            }
            const clientId = process.env.REACT_APP_PAYPAL_CLIENT_ID || ''
            if (!clientId) {
                console.warn('REACT_APP_PAYPAL_CLIENT_ID not set')
                return
            }
            const script = document.createElement('script')
            script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`
            script.async = true
            script.onload = () => setPaypalReady(true)
            document.body.appendChild(script)
        }
        addPaypalScript()
    }, [])

    // Suppress noisy cross-origin "Script error." messages from third-party SDKs
    useEffect(() => {
        const handler = (event) => {
            try {
                const msg = event && event.message
                const src = event && event.filename
                if (msg === 'Script error.' && src && src.includes('paypal')) {
                    setPaypalError('Cross-origin PayPal script error (safe to ignore)')
                    event.preventDefault && event.preventDefault()
                    return true
                }
            } catch (e) {
                // ignore
            }
        }
        window.addEventListener('error', handler)
        return () => window.removeEventListener('error', handler)
    }, [])

    useEffect(() => {
        // render PayPal Buttons when SDK and service are ready
        if (!paypalReady || !service || !service.price) return
        // ensure a valid payee identifier exists
        const payee = service.seller_merchant_id || service.seller_email || (service.seller && service.seller.merchant_id) || (service.seller && service.seller.email)
        if (!payee) return

        // cleanup previous buttons
        if (paypalRef.current) paypalRef.current.innerHTML = ''
        let buttons = null
        try {
            setPaypalError(null)
            buttons = window.paypal.Buttons({
                createOrder: (data, actions) => {
                    return actions.order.create({
                        purchase_units: [{
                            amount: { value: String(service.price) || '0.00' },
                            payee: { email_address: payee },
                            description: service.service_name || 'Service purchase'
                        }]
                    })
                },
                onApprove: async (data, actions) => {
                    try {
                        const details = await actions.order.capture()
                        // extract capture id
                        let transactionId = ''
                        try {
                            transactionId = details.purchase_units[0].payments.captures[0].id
                        } catch (e) {
                            transactionId = details.id || ''
                        }

                        // record order in backend
                        await axios.post('/api/v1/orders/create/', {
                            service: service.id,
                            paypal_transaction_id: transactionId,
                            price_paid: service.price
                        })
                        alert('Payment successful and order recorded. Thank you!')
                        window.location.reload()
                    } catch (err) {
                        console.error('PayPal capture error', err)
                        alert('Payment succeeded but failed to record order: ' + (err.response && err.response.data ? JSON.stringify(err.response.data) : err.message))
                    }
                },
                onError: (err) => {
                    console.error('PayPal Buttons error', err)
                    setPaypalError(String(err))
                }
            })

            // Defer render slightly and ensure container still exists to avoid
            // "Detected container element removed from DOM" from the SDK.
            const timeoutId = setTimeout(() => {
                try {
                    if (paypalRef.current) {
                        buttons.render(paypalRef.current)
                    } else {
                        console.warn('PayPal button container not present, skipping render')
                    }
                } catch (err) {
                    console.error('Error during deferred PayPal render', err)
                    setPaypalError(err && err.message ? err.message : String(err))
                }
            }, 50)

            // cleanup function for this effect will clear the timeout and remove buttons
            return () => {
                clearTimeout(timeoutId)
                try {
                    if (buttons && typeof buttons.close === 'function') {
                        buttons.close()
                    }
                } catch (e) {
                    // ignore
                }
                if (paypalRef.current) paypalRef.current.innerHTML = ''
            }
        } catch (err) {
            // some third-party script errors are opaque (cross-origin); surface what we can
            console.error('Error rendering PayPal Buttons', err)
            setPaypalError(err && err.message ? err.message : String(err))
        }
        
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paypalReady, service])

    const imageUrl = service && (service.sample_image || service.image || service.image_url)
        ? ((service.sample_image || service.image || service.image_url).startsWith('http') ? (service.sample_image || service.image || service.image_url) : `${window.location.origin}${(service.sample_image || service.image || service.image_url)}`)
        : null

    return (
        <div>
            <Link className='btn btn-light my-3' to='/'>Go Back</Link>
            <Row>
                <Col md={6}>
                    {imageUrl ? (
                        <Image src={imageUrl} alt={service.service_name} fluid />
                    ) : (
                        <div className='border p-5 text-center text-muted'>No image available</div>
                    )}
                </Col>
                <Col md={6}>
                    <ListGroup variant='flush'>
                        <ListGroup.Item>
                            <h3>{service.service_name}</h3>
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <Rating value={service.rating} color={'#f8e825'} />
                        </ListGroup.Item>
                        <ListGroup.Item>
                            Price: ${service.price || 'N/A'}
                        </ListGroup.Item>
                        <ListGroup.Item>
                            Duration: {service.duration_of_service || 'N/A'}
                        </ListGroup.Item>
                        <ListGroup.Item>
                            Expert: {service.seller_first_name || (service.seller && (service.seller.first_name + ' ' + service.seller.last_name)) || service.seller_email || 'Unknown'}
                        </ListGroup.Item>
                        <ListGroup.Item>
                            Description: {service.description || 'No description available.'}
                        </ListGroup.Item>
                    </ListGroup>
                    <Card className='my-3'>
                        <Card.Body>
                            {paypalReady && (service.seller_merchant_id || service.seller_email || (service.seller && (service.seller.merchant_id || service.seller.email))) ? (
                                <div ref={paypalRef} />
                            ) : (
                                <>
                                  <Button variant='primary' onClick={() => alert('PayPal not configured. Set REACT_APP_PAYPAL_CLIENT_ID and/or seller merchant id.')}>Pay with PayPal</Button>
                                                                    <div className='mt-2 text-muted small'>
                                                                        <div>PayPal SDK loaded: {paypalReady ? 'yes' : 'no'}</div>
                                                                        <div>Detected payee: {service.seller_merchant_id || service.seller_email || (service.seller && (service.seller.merchant_id || service.seller.email)) || 'none'}</div>
                                                                        {paypalError && <div className='text-danger'>PayPal error: {paypalError}</div>}
                                                                    </div>
                                </>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
