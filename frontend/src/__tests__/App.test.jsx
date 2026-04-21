import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'

function renderAt(route) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>
  )
}

test('/ renders LandingPage', () => {
  renderAt('/')
  expect(screen.getByText(/build your perfect resume/i)).toBeInTheDocument()
})

test('/build renders BuildPage', () => {
  renderAt('/build')
  expect(screen.getByText(/step 1 of 7/i)).toBeInTheDocument()
})

test('/preview renders PreviewPage', () => {
  renderAt('/preview')
  expect(screen.getByText(/resume preview/i)).toBeInTheDocument()
})
