import React from 'react'
import { Card } from 'react-bootstrap'
import Rating from './Rating'
import { Link } from 'react-router-dom'

function Service({ service }) {
  return (
    <Card className='my-3 p-3 rounded'>
        <Link to={`/service/${service.id || service._id}`}>
          <Card.Img src={service.sample_image || service.image || service.image_url} />
        </Link>

        <Card.Body>
            <Link to={`/service/${service.id || service._id}`}>
                <Card.Title as='div'>
                <strong>{service.service_name || service.name}</strong>
                </Card.Title>
            </Link>

            <Card.Text as='div'>
                <div className='my-3'>
                  <Rating value={service.rating} color={'#f8e825'} />
                </div>
                <div>{service.description && service.description.substring(0, 120)}{service.description && service.description.length > 120 ? '...' : ''}</div>
            </Card.Text>

            {service.price !== undefined && (
              <Card.Text as='h5'>
                ${service.price}
              </Card.Text>
            )}
        </Card.Body>

    </Card>
  )
}

export default Service
