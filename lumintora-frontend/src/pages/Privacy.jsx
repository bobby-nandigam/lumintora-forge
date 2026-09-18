import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Logo from '../components/Logo'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import '../components/UI.css'
import SiteFooter from '../components/SiteFooter'

export default function Privacy() {
  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <div className="blog-page">
      <header className="blog-header">
        <Link to="/" className="blog-logo"><Logo size={26} /></Link>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/login"    className="btn btn-ghost btn-sm">Sign in</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Get started free <ArrowRight size={13} /></Link>
        </div>
      </header>

      <main className="blog-main" style={{ maxWidth: 760 }}>
        <Link to="/" className="blog-back"><ArrowLeft size={15} /> Back to home</Link>

        <h1 className="blog-h1" style={{ marginTop: 8 }}>Privacy Policy</h1>
        <p style={{ color: 'var(--text-3)', fontSize: 14, marginBottom: 32 }}>Last updated: August 2026</p>

        <article className="blog-body">
          <p className="blog-p">
            At Lumintora, we take your privacy seriously. This policy explains what we collect, why we collect it, and the choices you have. By using Lumintora, you agree to the practices described here.
          </p>

          <h2 className="blog-h2">Information we collect</h2>
          <ul className="blog-list">
            <li><strong>Account information</strong> — your name, username, and email address when you sign up. If you sign in with Google, we receive your basic Google profile (name, email, and profile picture).</li>
            <li><strong>Learning data</strong> — the goals you set, the paths you generate, your quiz results, coding submissions, XP, and streaks. This is what makes your learning experience adaptive.</li>
            <li><strong>Usage data</strong> — basic technical information such as your browser type and how you interact with the platform, used to keep the service reliable and to improve it.</li>
          </ul>

          <h2 className="blog-h2">How we use your information</h2>
          <ul className="blog-list">
            <li>To build and continuously adapt your personalised learning path.</li>
            <li>To operate core features — the AI tutor, the coding judge, leaderboards, and progress tracking.</li>
            <li>To communicate with you about your account and important service updates.</li>
            <li>To understand what's working and improve the product over time.</li>
          </ul>

          <h2 className="blog-h2">Your data is yours</h2>
          <p className="blog-p">
            Each learner's data is kept isolated. We do not sell your personal information, and we do not share your learning data with third parties for advertising. We use trusted infrastructure providers (for hosting, databases, and AI processing) strictly to operate the service.
          </p>

          <h2 className="blog-h2">Data retention and deletion</h2>
          <p className="blog-p">
            We keep your data for as long as your account is active. You can request deletion of your account and associated learning data at any time by emailing us — we'll remove it promptly, except where we're required to retain certain records by law.
          </p>

          <h2 className="blog-h2">Cookies and local storage</h2>
          <p className="blog-p">
            We use your browser's local storage to keep you signed in and remember basic preferences. These are essential to how the platform works and are not used for cross-site tracking.
          </p>

          <h2 className="blog-h2">Contact us</h2>
          <p className="blog-p">
            Questions about your privacy, or want your data deleted? Email us at <a href="mailto:lumintoraai@gmail.com" style={{ color: 'var(--accent-ink)' }}>lumintoraai@gmail.com</a> and we'll get back to you.
          </p>
        </article>
      </main>

      <SiteFooter />
    </div>
  )
}
