import {useParams, Link} from 'react-router-dom';

import {Row, Col, Image, ListGroup, Card, Button} from 'react-bootstrap';
import Rating from '../components/Rating';
// compatibility service detail view

import axios from 'axios';
import { useEffect, useState } from 'react';

export default function ProductScreen() {
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

    return (
        <div>
            <Link className='btn btn-light my-3' to='/'>Go Back</Link>
            <Row>
                <Col md={6}>
                    <Image src={service.sample_image || service.image} alt={service.service_name} fluid />
                </Col>
                <Col md={3}>
                    <ListGroup variant='flush'>
                        <ListGroup.Item>
                            <h3>{service.service_name}</h3>
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <Rating value={service.rating} text={`${service.numReviews || 0} reviews`} color={'#f8e825'} />
                        </ListGroup.Item>
                        <ListGroup.Item>
                            Price: ${service.price}
                        </ListGroup.Item>
                        <ListGroup.Item>
                            Description: {service.description}
                        </ListGroup.Item>
                    </ListGroup>
                </Col>
                <Col md={3}>
                    <Card>
                        <ListGroup variant='flush'>
                            <ListGroup.Item>
                                <Row>
                                    <Col>Price:</Col>
                                    <Col>
                                        <strong>${service.price}</strong>
                                    </Col>
                                </Row>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <Row>
                                    <Col>Duration:</Col>
                                    <Col>
                                        {service.duration_of_service}
                                    </Col>
                                </Row>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <Button className='btn-block' type='button'>
                                    Book Service / PayPal
                                </Button>
                            </ListGroup.Item>
                        </ListGroup>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}