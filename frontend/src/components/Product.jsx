import React from 'react'
import { Card } from 'react-bootstrap'
import Rating from './Rating'
import { Link } from 'react-router-dom'

function Product({ product }) {
  // product here is treated as a service
  return (
    <Card className='my-3 p-3 rounded'>
        <Link to={`/service/${product._id}`}>
            <Card.Img src={product.sample_image || product.image} />
        </Link>

        <Card.Body>
            <Link to={`/service/${product._id}`}>
                <Card.Title as='div'>
                    <strong>{product.service_name || product.name}</strong>
                </Card.Title>
            </Link>

            <Card.Text as='div'>
                <div className='my-3'>
                    <Rating value={product.rating} text={`${product.numReviews || 0} reviews`} color={'#f8e825'} />
                </div>
                <div>{product.description && product.description.substring(0, 120)}{product.description && product.description.length > 120 ? '...' : ''}</div>
            </Card.Text>

            {product.price !== undefined && (
              <Card.Text as='h5'>
                ${product.price}
              </Card.Text>
            )}
        </Card.Body>

    </Card>
  )
}

export default Product
