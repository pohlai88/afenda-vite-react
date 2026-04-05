import { Link } from 'react-router-dom'

export function NotFoundView() {
  return (
    <div className="not-found">
      <h1>404 - Page Not Found</h1>
      <p>{"The page you're looking for doesn't exist."}</p>
      <Link to="/app/dashboard">Go back to Dashboard</Link>
    </div>
  )
}
