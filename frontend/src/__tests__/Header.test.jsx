import React from 'react'
import { render, screen } from '@testing-library/react'
import Header from '../components/Header'
import { MemoryRouter } from 'react-router-dom'

// mock react-redux useDispatch to avoid needing a Provider
jest.mock('react-redux', () => ({
  useDispatch: () => jest.fn(),
}))

describe('Header admin links', () => {
  beforeEach(() => {
    localStorage.setItem('userInfo', JSON.stringify({ user: { first_name: 'Admin', role: 'Admin', email: 'admin@example.com' } }))
  })

  afterEach(() => {
    localStorage.clear()
  })

  test('renders Admin dropdown with Users and Applications links', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    )

    // Admin dropdown label
    expect(screen.getByText(/Admin/i)).toBeInTheDocument()
    // links inside dropdown (rendered as plain text even if hidden)
    expect(screen.getByText(/Users/i)).toBeInTheDocument()
    expect(screen.getByText(/Applications/i)).toBeInTheDocument()
  })
})
