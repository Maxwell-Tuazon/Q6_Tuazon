import React, { useEffect, useState } from 'react'
import { Row, Col } from 'react-bootstrap'
import Product from '../components/Product'
import axios from 'axios'
import Loader from '../components/Loader'
import Message from '../components/Message'

function HomeScreen() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [services, setServices] = useState([])

    useEffect(() => {
        async function fetchServices() {
            try {
                setLoading(true)
                const { data } = await axios.get('/api/v1/services/list/')
                setServices(data)
            } catch (err) {
                setError(err.response && err.response.data.detail ? err.response.data.detail : err.message)
            } finally {
                setLoading(false)
            }
        }
        fetchServices()
    }, [])

    return (
        <>
            {loading ? (
                <Loader />
            ) : error ? (
                <Message variant="danger">{error}</Message>
            ) : (
                services && services.length > 0 ? (
                    <Row>
                        {services.map((service) => (
                            <Col key={service._id} sm={12} md={6} lg={4} xl={3}>
                                <Product product={service} />
                            </Col>
                        ))}
                    </Row>
                ) : (
                    <Message variant="info">No services available.</Message>
                )
            )}
        </>
    )
}

export default HomeScreen
