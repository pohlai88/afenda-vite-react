import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <main className="page">
      <h1>Afenda ERP Platform</h1>
      <p>Marketing and product entry page for the ERP web platform.</p>
      <div className="placeholder">
        <p>Use this area for product messaging, pricing, and onboarding flows.</p>
        <p>
          <Link to="/app/login">Sign in</Link> or{' '}
          <Link to="/app/dashboard">open the ERP app</Link>.
        </p>
      </div>
    </main>
  )
}
