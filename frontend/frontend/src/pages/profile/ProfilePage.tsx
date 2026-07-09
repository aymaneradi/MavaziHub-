import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../../auth/AuthContext'

export function ProfilePage() {
  const auth = useAuth()
  const navigate = useNavigate()
  const user = auth.user

  async function handleLogout() {
    await auth.logout()
    navigate('/', { replace: true })
  }

  if (!user) {
    return null
  }

  const adminAreaLabel = auth.hasAnyRole(['ROLE_ADMIN']) ? 'Adminbereich' : 'Mitarbeiterbereich'

  return (
    <section className="profile-page">
      <div className="profile-header">
        <div>
          <p className="eyebrow">Kundenbereich</p>
          <h1>Hallo, {user.firstname}</h1>
          <p>Hier findest du dein Profil und die wichtigsten geschützten Kundenfunktionen.</p>
        </div>
        <button type="button" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="profile-grid">
        <article className="profile-panel">
          <h2>Kontodaten</h2>
          <dl>
            <div>
              <dt>Name</dt>
              <dd>
                {user.firstname} {user.lastname}
              </dd>
            </div>
            <div>
              <dt>E-Mail</dt>
              <dd>{user.email}</dd>
            </div>
            <div>
              <dt>Telefon</dt>
              <dd>{user.phoneNumber}</dd>
            </div>
          </dl>
        </article>

        <article className="profile-panel">
          <h2>Kundenkonto</h2>
          <p>Dein Konto ist aktiv. Hier verwaltest du Bestellungen, Rücksendungen und deinen Warenkorb.</p>
        </article>
      </div>

      <div className="profile-actions">
        <Link to="/orders">Bestellungen</Link>
        <Link to="/returns">Rücksendungen</Link>
        <Link to="/cart">Warenkorb</Link>
        {auth.hasAnyRole(['ROLE_ADMIN', 'ROLE_EMPLOYEE']) && <Link to="/admin">{adminAreaLabel}</Link>}
      </div>
    </section>
  )
}
