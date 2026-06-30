import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

function AppLayout() {
  return (
    <div className="mh-app">
      <Navbar />

      <main className="mh-main">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}

export default AppLayout