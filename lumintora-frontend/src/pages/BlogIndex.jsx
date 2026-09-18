import { Link } from 'react-router-dom'
import Logo from '../components/Logo'
import { ArrowRight, BookOpen } from 'lucide-react'
import '../components/UI.css'
import SiteFooter from '../components/SiteFooter'

const POSTS = [
  {
    slug: 'staying-consistent',
    tag: 'HABITS & MOTIVATION',
    title: 'The Consistency Problem: Why Most People Quit Learning',
    excerpt: "The people who get good at something aren't the ones who started with the most motivation — they're the ones who stayed consistent after it ran out. Here's why consistency is the real skill, and how to build it even when you don't feel like it.",
    readTime: '8 min read',
    date: 'August 22, 2026',
    author: 'Bobby Nandigam',
    tags: ['Habits', 'Motivation', 'Streaks', 'Learning Systems'],
    gradient: 'linear-gradient(155deg, #2e1607 0%, #7a3d0c 55%, #1a0c03 100%)',
  },
  {
    slug: 'ai-changing-how-we-learn',
    tag: 'AI & LEARNING',
    title: 'AI Is Changing How We Learn: What the Next Generation of Learning Looks Like',
    excerpt: "For decades, learning meant find a course, watch, quiz, repeat. But the hard part was never access to content — it was knowing what to learn next. Here's how AI is quietly turning courses into learning systems that start with you.",
    readTime: '9 min read',
    date: 'August 15, 2026',
    author: 'Bobby Nandigam',
    tags: ['AI & Learning', 'Adaptive Systems', 'AI Tutors', 'Learning Systems'],
    gradient: 'linear-gradient(155deg, #06231d 0%, #0c4a3a 55%, #03150f 100%)',
  },
  {
    slug: 'future-of-learning',
    tag: 'EDUCATION',
    title: 'The Future of Learning: Why One-Size-Fits-All Education No Longer Works',
    excerpt: "For too long, education has been built for the average. AI changes that. A look at why adaptive learning isn't just a buzzword — and what it actually means for every student who's ever felt left behind.",
    readTime: '8 min read',
    date: 'June 28, 2026',
    author: 'Bobby Nandigam',
    tags: ['Traditional Education', 'AI & Learning', 'Adaptive Systems', 'Future of Ed'],
    gradient: 'linear-gradient(155deg, #1a0e40 0%, #2d1b69 55%, #0e0726 100%)',
  },
  {
    slug: 'ai-personalized-learning-path',
    tag: 'AI',
    title: 'How AI Creates a Personalized Learning Path for Every Student',
    excerpt: "Not all learners start at the same place. Here's how AI maps your gaps, sequences your path, and adapts in real time — so every step you take is exactly the one you need next.",
    readTime: '7 min read',
    date: 'July 1, 2026',
    author: 'Bobby Nandigam',
    tags: ['Personalization', 'AI', 'Learning Science', 'Path Design'],
    gradient: 'linear-gradient(155deg, #061a2e 0%, #0d3a5c 55%, #031120 100%)',
  },
]

function BlogCard({ post }) {
  return (
    <Link to={`/blog/${post.slug}`} className="lp-blog-card">
      <div className="lp-blog-card-header" style={{ background: post.gradient }}>
        <BookOpen size={20} style={{ position: 'absolute', top: 16, right: 16, color: 'rgba(255,255,255,0.35)' }} />
        <div className="lp-blog-header-tags">
          {post.tags.map(t => <span key={t} className="lp-blog-header-tag">{t}</span>)}
        </div>
      </div>
      <div className="lp-blog-card-inner">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <span className="lp-blog-tag">{post.tag}</span>
          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{post.readTime}</span>
        </div>
        <h3 className="lp-blog-title">{post.title}</h3>
        <p className="lp-blog-excerpt">{post.excerpt}</p>
        <div className="lp-blog-meta">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="lp-blog-ava">{post.author[0]}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{post.author}</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{post.date}</div>
            </div>
          </div>
          <span className="lp-blog-cta">Read article <ArrowRight size={14} /></span>
        </div>
      </div>
    </Link>
  )
}

export default function BlogIndex() {
  return (
    <div className="blog-page">
      <header className="blog-header">
        <Link to="/" className="blog-logo"><Logo size={26} /></Link>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/login"    className="btn btn-ghost btn-sm">Sign in</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Get started free <ArrowRight size={13} /></Link>
        </div>
      </header>

      <main className="blog-main">
        <div style={{ marginBottom: 48 }}>
          <div className="section-label" style={{ marginBottom: 10 }}>Blog</div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 40px)',
            fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)', margin: '0 0 12px',
          }}>
            Thinking about learning.
          </h1>
          <p style={{ color: 'var(--text-2)', fontSize: 16, margin: 0, maxWidth: 520 }}>
            Ideas on education, AI, and what it means to actually get good at something.
          </p>
        </div>

        <div className="lp-blog-grid" style={{ maxWidth: 1040 }}>
          {[...POSTS].sort((a, b) => new Date(b.date) - new Date(a.date)).map(p => <BlogCard key={p.slug} post={p} />)}
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
