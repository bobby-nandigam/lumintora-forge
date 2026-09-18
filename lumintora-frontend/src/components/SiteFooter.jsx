import { Link } from 'react-router-dom'
import { Mail, Github, Twitter } from 'lucide-react'
import Logo from './Logo'

export default function SiteFooter() {
  return (
    <footer className="lp-footer-full">
      <div className="lp-footer-top">
        <div className="lp-footer-brand">
          <Logo size={22} fontSize={15} wordColor="#fff" surface="#07060f" dark="rgba(255,255,255,0.5)" />
          <p className="lp-footer-tagline">Your adaptive learning platform — built around your goal, not a generic curriculum.</p>
          <div className="lp-footer-socials">
            <a href="mailto:lumintoraai@gmail.com" className="lp-footer-social" aria-label="Email"><Mail size={15} /></a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="lp-footer-social" aria-label="GitHub"><Github size={15} /></a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="lp-footer-social" aria-label="Twitter"><Twitter size={15} /></a>
          </div>
        </div>
        <div className="lp-footer-cols">
          <div className="lp-footer-col">
            <div className="lp-footer-col-head">Platform</div>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/paths/new">Path Builder</Link>
            <Link to="/playground">Code Playground</Link>
            <Link to="/leaderboard">Leaderboard</Link>
            <Link to="/resume">Resume Builder</Link>
          </div>
          <div className="lp-footer-col">
            <div className="lp-footer-col-head">Resources</div>
            <Link to="/blog">Blog</Link>
            <a href="#changelog" onClick={e => e.preventDefault()} style={{ opacity: 0.45, cursor: 'default' }}>Changelog <span className="lp-footer-soon">Soon</span></a>
            <a href="#roadmap" onClick={e => e.preventDefault()} style={{ opacity: 0.45, cursor: 'default' }}>Roadmap <span className="lp-footer-soon">Soon</span></a>
            <a href="#status" onClick={e => e.preventDefault()} style={{ opacity: 0.45, cursor: 'default' }}>Status <span className="lp-footer-soon">Soon</span></a>
          </div>
          <div className="lp-footer-col">
            <div className="lp-footer-col-head">Company</div>
            <Link to="/feedback">Give feedback</Link>
            <Link to="/register">Get started — it's free</Link>
          </div>
        </div>
      </div>
      <div className="lp-footer-word" aria-hidden="true">Lumintora</div>
      <div className="lp-footer-bottom">
        <span>© 2026 Lumintora · A project by Bobby Nandigam</span>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
          <span className="beta-tag-mini">v1</span>
        </div>
      </div>
    </footer>
  )
}
