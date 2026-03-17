import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import AdminApplications from '../screens/AdminApplications'
import { MemoryRouter } from 'react-router-dom'
import axios from 'axios'

jest.mock('axios')
jest.mock('react-redux', () => ({ useDispatch: () => jest.fn() }))

const sampleApps = [
  { id: 1, user: { email: 'u1@example.com' }, company_name: 'Acme', message: 'hello', created_at: new Date().toISOString() },
]

describe('AdminApplications', () => {
  beforeEach(() => {
    localStorage.setItem('userInfo', JSON.stringify({ user: { first_name: 'Admin', role: 'Admin', email: 'admin@example.com' } }))
    axios.get.mockResolvedValue({ data: sampleApps })
  })
  afterEach(() => {
    localStorage.clear()
    jest.resetAllMocks()
  })

  test('loads and displays applications', async () => {
    render(
      <MemoryRouter>
        <AdminApplications />
      </MemoryRouter>
    )

    await waitFor(() => expect(axios.get).toHaveBeenCalled())
    expect(screen.getByText('Acme')).toBeInTheDocument()
    expect(screen.getByText(/u1@example.com/i)).toBeInTheDocument()
  })
})
