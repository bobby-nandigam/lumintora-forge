import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Logo from '../components/Logo'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import '../components/UI.css'
import SiteFooter from '../components/SiteFooter'

export default function Terms() {
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

        <h1 className="blog-h1" style={{ marginTop: 8 }}>Terms of Service</h1>
        <p style={{ color: 'var(--text-3)', fontSize: 14, marginBottom: 32 }}>Last updated: August 2026</p>

        <article className="blog-body">
          <p className="blog-p">
            Welcome to Lumintora. By creating an account or using the platform, you agree to these terms. Please read them carefully — they explain the rules for using the service and what you can expect from us.
          </p>

          <h2 className="blog-h2">Using Lumintora</h2>
          <ul className="blog-list">
            <li>You must provide accurate information when you create an account, and you're responsible for keeping your login credentials secure.</li>
            <li>You agree to use the platform for lawful, personal learning purposes and not to abuse, disrupt, or attempt to break the service.</li>
            <li>You may not scrape, resell, or redistribute platform content, or attempt to access other users' accounts or data.</li>
          </ul>

          <h2 className="blog-h2">Your content</h2>
          <p className="blog-p">
            The goals, code, and answers you submit remain yours. By using the platform, you grant us permission to process this content solely to operate features like the AI tutor, the coding judge, and your adaptive learning path.
          </p>

          <h2 className="blog-h2">AI-generated content</h2>
          <p className="blog-p">
            Lumintora uses AI to generate learning paths, explanations, and feedback. While we work hard to make it accurate and useful, AI-generated content can occasionally be incomplete or wrong. Use your judgement, and treat it as a learning aid rather than an infallible authority.
          </p>

          <h2 className="blog-h2">Availability</h2>
          <p className="blog-p">
            Lumintora is offered free of charge and is actively being developed. Features may change, and the service is provided "as is" without warranties of any kind. We aim for high reliability but can't guarantee uninterrupted access.
          </p>

          <h2 className="blog-h2">Account termination</h2>
          <p className="blog-p">
            You can stop using Lumintora and request deletion of your account at any time. We reserve the right to suspend or terminate accounts that violate these terms or abuse the service.
          </p>

          <h2 className="blog-h2">Contact us</h2>
          <p className="blog-p">
            Questions about these terms? Email us at <a href="mailto:lumintoraai@gmail.com" style={{ color: 'var(--accent-ink)' }}>lumintoraai@gmail.com</a>.
          </p>
        </article>
      </main>

      <SiteFooter />
    </div>
  )
}
