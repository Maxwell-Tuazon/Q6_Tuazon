import {useParams, Link} from 'react-router-dom';

import {Row, Col, Image, ListGroup, Card, Button} from 'react-bootstrap';
import Rating from '../components/Rating';
import axios from 'axios';
import { useEffect, useState } from 'react';

export default function DetailScreen() {
    const {id} = useParams();
    const [service, setService] = useState({});

    useEffect(() => {
        async function fetchService() {
            try {
                const { data } = await axios.get(`/api/services/${id}/`);
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
                <Col md={6}>
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
                            Duration: {service.duration_of_service}
                        </ListGroup.Item>
                        <ListGroup.Item>
                            Expert: {service.seller && (service.seller.first_name + ' ' + service.seller.last_name)}
                        </ListGroup.Item>
                        <ListGroup.Item>
                            Description: {service.description}
                        </ListGroup.Item>
                    </ListGroup>
                    <Card className='my-3'>
                        <Card.Body>
                            <Button variant='primary'>Pay with PayPal</Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
