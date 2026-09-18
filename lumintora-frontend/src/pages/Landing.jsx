import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { api } from '../lib/api'
import Logo from '../components/Logo'
import { Button } from '../components/UI'
import {
  ArrowRight, Check, Route, Code2, Trophy, Bot, Flame,
  GraduationCap, Zap, Terminal, CheckCircle2, BookOpen, User,
  Play, Plus, LayoutDashboard, FileText, MessageSquare, LogOut,
  Mail, Globe, MapPin, ChevronDown, Users, Heart, Github, Twitter,
  GitBranch, Shield, Database, Sparkles, Menu, X,
} from 'lucide-react'
import '../components/UI.css'
import ChatWidget from '../components/ChatWidget'
import SiteFooter from '../components/SiteFooter'

/* ── Data ─────────────────────────────────────────────────── */

const steps = [
  { n: '01', title: 'Set a goal', desc: 'Tell Lumintora what you want to learn — a topic, a role, or a project.' },
  { n: '02', title: 'Get an adaptive path', desc: 'An AI generates a structured path with lessons, quizzes, and real coding problems.' },
  { n: '03', title: 'Practice & get judged', desc: 'Solve LeetCode-style problems against real test cases — Run the samples, Submit to judge them all.' },
  { n: '04', title: 'Build a streak', desc: 'Earn XP, watch your contribution heatmap fill in, and climb the leaderboard.' },
]

const features = [
  { icon: Route,        title: 'Adaptive learning paths',   desc: 'AI builds a path around your goal and reshapes it as you progress — not a fixed syllabus.' },
  { icon: Code2,        title: 'Real coding judge',         desc: 'LeetCode-style problems with sample + hidden test cases and per-case pass/fail verdicts.' },
  { icon: Bot,          title: 'Always-on AI tutor',        desc: 'Select any text and ask Lumi for a clear, concise explanation — right where you are.' },
  { icon: Flame,        title: 'Streaks & heatmap',         desc: 'A GitHub-style contribution heatmap, current & longest streaks, and XP that adds up.' },
  { icon: GraduationCap, title: 'Quizzes & XP',            desc: 'Adaptive quizzes pinpoint weak spots and turn effort into measurable progress.' },
  { icon: Trophy,       title: 'Leaderboard',               desc: 'Friendly competition — see how your XP and streak stack up against other learners.' },
  { icon: Terminal,     title: 'Code playground',           desc: 'JavaScript runs instantly in your browser; Python runs on a real server runtime.' },
  { icon: User,         title: 'Your profile',              desc: 'Phone, email, socials, avatar, and your activity heatmap — a profile you fully control.' },
  { icon: FileText,     title: 'AI Resume Builder',         desc: 'Fill in your experience and let AI write a polished professional summary — print-ready in seconds.' },
]

const topics = [
  { icon: Code2,    color: 'var(--accent)',     bg: 'var(--accent-soft)',  label: 'Web Development',              sub: 'Full Stack' },
  { icon: Terminal, color: 'var(--amber)',      bg: 'var(--amber-soft)',   label: 'Data Structures & Algorithms', sub: 'Competitive' },
  { icon: Shield,   color: 'var(--rose)',       bg: 'var(--rose-soft)',    label: 'Cybersecurity',                sub: 'Security' },
  { icon: Database, color: 'var(--green)',      bg: 'var(--green-soft)',   label: 'Data Science',                 sub: 'Analytics' },
  { icon: Globe,    color: '#0ea5e9',           bg: '#e0f2fe',             label: 'System Design',                sub: 'Architecture' },
  { icon: Bot,      color: 'var(--accent)',     bg: 'var(--accent-soft)',  label: 'Machine Learning',             sub: 'AI / ML' },
  { icon: Flame,    color: '#f97316',           bg: '#fff7ed',             label: 'Python Fundamentals',          sub: 'Beginner-friendly' },
  { icon: Route,    color: '#14b8a6',           bg: '#f0fdfa',             label: 'DevOps',                       sub: 'Cloud & CI/CD' },
  { icon: Trophy,   color: 'var(--amber)',      bg: 'var(--amber-soft)',   label: 'Mobile Development',           sub: 'iOS & Android' },
  { icon: Zap,      color: '#8b5cf6',           bg: '#f5f3ff',             label: 'Blockchain',                   sub: 'Web3' },
]

const FAQS = [
  { q: 'Is Lumintora really free?', a: 'Yes — completely free. Every feature on the platform is available at no cost.' },
  { q: 'How does the AI personalise my learning path?', a: 'You tell us your goal and experience level. The AI builds a structured path of lessons, quizzes, and coding problems tuned to where you are — and adapts it as you progress.' },
  { q: 'Do I need prior coding experience?', a: 'No. Lumintora works for absolute beginners as well as experienced developers looking to go deeper in a specific area.' },
  { q: 'What topics can I learn on Lumintora?', a: 'Practically any technical topic — Web Development, Data Structures & Algorithms, Machine Learning, Cybersecurity, System Design, Python, and more. Tell us your goal and the AI generates a path for it.' },
  { q: 'How is this different from Coursera or Udemy?', a: 'Courses give you fixed content. Lumintora builds a path around your specific goal and adjusts it based on what you actually know. You also get a real coding judge, not just videos.' },
  { q: 'Can I use Lumintora on my phone?', a: 'Yes — Lumintora is fully responsive. Lessons and quizzes work great on mobile, though the code editor is best on a larger screen.' },
]

const BLOG_POSTS = [
  {
    slug: 'staying-consistent',
    tag: 'HABITS & MOTIVATION',
    title: 'The Consistency Problem: Why Most People Quit Learning',
    excerpt: "The people who get good at something aren't the ones who started with the most motivation — they're the ones who stayed consistent after it ran out. Here's why consistency is the real skill, and how to build it.",
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

/* ── Components ───────────────────────────────────────────── */

function Shot({ url, children, className = '', bodyClass = '' }) {
  return (
    <div className={`lp-shot ${className}`}>
      <div className="lp-shot-bar">
        <span className="lp-shot-dot" style={{ background: '#ff5f57' }} />
        <span className="lp-shot-dot" style={{ background: '#febc2e' }} />
        <span className="lp-shot-dot" style={{ background: '#28c840' }} />
        <span className="lp-shot-url">{url}</span>
      </div>
      <div className={`lp-shot-body ${bodyClass}`}>{children}</div>
    </div>
  )
}

function MiniHeatmap() {
  const cells = Array.from({ length: 7 * 20 }, (_, i) => ((i * 37 + 11) % 11))
  const level = (v) => (v < 4 ? 0 : v < 6 ? 1 : v < 8 ? 2 : v < 10 ? 3 : 4)
  return (
    <div className="lp-heat">
      {Array.from({ length: 20 }).map((_, c) => (
        <div key={c} className="lp-heat-col">
          {Array.from({ length: 7 }).map((_, r) => (
            <span key={r} className={`lp-heat-cell lvl-${level(cells[c * 7 + r])}`} />
          ))}
        </div>
      ))}
    </div>
  )
}

function DashboardShot() {
  const stats = [
    ['Total XP', '1,240', Zap, 'var(--accent)'],
    ['Day Streak', '12', Flame, '#f87171'],
    ['Active Paths', '3', BookOpen, 'var(--accent-2)'],
    ['Completed', '8', CheckCircle2, 'var(--green)'],
  ]
  const paths = [
    { title: "Beginner's Cybersecurity Path", desc: 'A guided path to your first security role.', prog: 25, mods: '2/8 modules', hrs: '20h' },
    { title: 'Machine Learning with Python', desc: 'Land an ML role, one step at a time.', prog: 40, mods: '3/8 modules', hrs: '24h' },
  ]
  return (
    <Shot url="lumintora.in/dashboard" className="lp-shot-hero" bodyClass="lp-db-flush">
      <div className="lp-db-nav">
        <Logo size={18} />
        <div className="lp-db-navlinks">
          <span className="active">Dashboard</span><span>Playground</span><span>Leaderboard</span>
        </div>
        <div className="lp-db-navright">
          <span className="lp-db-xp"><Zap size={10} /> 1,240 XP</span>
          <span className="lp-db-new"><Plus size={11} /> New Path</span>
          <span className="lp-db-ava">J</span>
          <span style={{ display: 'flex', alignItems: 'center', color: 'var(--text-3)' }}><LogOut size={12} /></span>
        </div>
      </div>
      <div className="lp-db-main">
        <div className="lp-db-side">
          <span className="lp-db-side-h">LEARN</span>
          <span className="lp-db-side-i active"><LayoutDashboard size={13} /> Dashboard</span>
          <span className="lp-db-side-i"><Plus size={13} /> New Path</span>
          <span className="lp-db-side-i"><Code2 size={13} /> Code Playground</span>
          <span className="lp-db-side-h">COMMUNITY</span>
          <span className="lp-db-side-i"><Trophy size={13} /> Leaderboard</span>
          <span className="lp-db-side-h">ACCOUNT</span>
          <span className="lp-db-side-i"><User size={13} /> Profile</span>
          <span className="lp-db-side-i"><FileText size={13} /> Resume</span>
          <span className="lp-db-side-i"><MessageSquare size={13} /> Feedback</span>
        </div>
        <div className="lp-db-content">
          <div className="lp-db-eyebrow">GOOD TO SEE YOU</div>
          <div className="lp-db-title">Welcome back, John</div>
          <div className="lp-stat-row" style={{ marginTop: 14 }}>
            {stats.map(([l, v, I, c]) => (
              <div key={l} className="lp-stat">
                <span className="lp-stat-ico" style={{ background: `color-mix(in srgb, ${c} 14%, var(--bg-1))`, color: c }}><I size={14} /></span>
                <div><div className="lp-stat-v">{v}</div><div className="lp-stat-l">{l}</div></div>
              </div>
            ))}
          </div>
          <div className="lp-db-practice">
            <span className="lp-db-practice-ico"><Code2 size={16} /></span>
            <div className="lp-db-practice-body">
              <div className="lp-db-practice-t">Hands-on code practice</div>
              <div className="lp-db-practice-d">Write and <strong>actually run</strong> JavaScript in a safe sandbox — learn by doing.</div>
            </div>
            <span className="lp-db-practice-cta"><Play size={11} /> Open Playground</span>
          </div>
          <div className="lp-db-paths-head">
            <span>Your Learning Paths</span>
            <span className="lp-db-new"><Plus size={11} /> New Path</span>
          </div>
          <div className="lp-db-paths">
            {paths.map((p) => (
              <div key={p.title} className="lp-db-path">
                <span className="lp-db-badge">BEGINNER</span>
                <div className="lp-db-path-t">{p.title}</div>
                <div className="lp-db-path-d">{p.desc}</div>
                <div className="lp-db-path-progrow"><span>Progress</span><span>{p.prog}%</span></div>
                <div className="lp-path-prog"><div className="lp-path-prog-fill" style={{ width: `${p.prog}%` }} /></div>
                <div className="lp-db-path-meta"><span><BookOpen size={11} /> {p.mods}</span><span>{p.hrs}</span><ArrowRight size={12} color="var(--accent)" /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Shot>
  )
}

/* ── Scroll-showcase mockups (each is a swappable dashboard screen) ── */

function PathVisual() {
  const mods = [
    ['Python Basics', 'LESSON', 'done'],
    ['Variables & Data Types', 'LESSON', 'done'],
    ['Loops — hands-on', 'CODE', 'active'],
    ['Functions & Scope', 'LESSON', ''],
    ['Checkpoint Quiz', 'QUIZ', ''],
  ]
  return (
    <Shot url="lumintora.in/paths/new" className="lp-shot-hero">
      <div className="lp-gen-bar">
        <Zap size={15} color="var(--accent)" />
        <span className="lp-gen-text">Become a Python developer</span>
        <span className="lp-gen-btn"><Plus size={12} /> Generate</span>
      </div>
      <div className="lp-gen-meta"><span className="lp-spark"><Zap size={12} /> AI generated</span> · 8 modules · ~20h</div>
      <div className="lp-path-card">
        <div className="lp-path-title">Python Developer Path</div>
        <div className="lp-db-path-progrow"><span>Progress</span><span>35%</span></div>
        <div className="lp-path-prog"><div className="lp-path-prog-fill" style={{ width: '35%' }} /></div>
        <div className="lp-path-modules">
          {mods.map(([t, type, st]) => (
            <div key={t} className={`lp-mod ${st === 'done' ? 'done' : ''}`}>
              <span className="lp-mod-ico" style={{
                background: st === 'done' ? 'var(--green-soft)' : st === 'active' ? 'var(--accent-soft)' : 'var(--bg-3)',
                color: st === 'done' ? 'var(--green)' : st === 'active' ? 'var(--accent)' : 'var(--text-3)',
              }}>
                {st === 'done' ? <Check size={12} /> : <span className="lp-mod-dot" style={{ background: 'currentColor' }} />}
              </span>
              <span className="lp-mod-title">{t}</span>
              <span className="lp-mod-type" style={{ color: st === 'active' ? 'var(--accent-ink)' : 'var(--text-3)' }}>{type}</span>
            </div>
          ))}
        </div>
      </div>
    </Shot>
  )
}

function TutorVisual() {
  return (
    <Shot url="lumintora.in/learn" className="lp-shot-hero">
      <div className="lp-chat">
        <div className="lp-msg user">What does “Big-O” actually mean?</div>
        <div className="lp-msg ai">
          <span className="lp-ai-ava"><Bot size={12} /></span>
          <span>Big-O describes how an algorithm’s work grows as the input grows — a ceiling on time or space. <strong>O(n)</strong> scales linearly with the data; <strong>O(1)</strong> stays constant no matter the size.</span>
        </div>
        <div className="lp-msg user">Give me a one-line example.</div>
        <div className="lp-msg ai">
          <span className="lp-ai-ava"><Bot size={12} /></span>
          <span>Looking up <code>dict[key]</code> in Python is ~O(1); scanning a list with <code>in</code> is O(n).</span>
        </div>
        <div className="lp-chat-input">Ask Lumi anything… <span className="lp-send"><ArrowRight size={14} /></span></div>
      </div>
    </Shot>
  )
}

function StreakVisual() {
  return (
    <Shot url="lumintora.in/profile" className="lp-shot-hero">
      <div className="lp-streak-row">
        <div className="lp-streak-big">
          <span style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(248,113,113,0.14)', color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Flame size={22} />
          </span>
          <div><div className="lp-streak-v">12</div><div className="lp-streak-l">Day streak</div></div>
        </div>
        <div className="lp-streak-mini">
          <div><span className="lp-streak-mv">1,240</span><span className="lp-streak-ml">Total XP</span></div>
          <div><span className="lp-streak-mv">28</span><span className="lp-streak-ml">Longest</span></div>
        </div>
      </div>
      <MiniHeatmap />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-3)', marginTop: 10 }}>
        <span>Less</span><span>371 days of activity</span><span>More</span>
      </div>
    </Shot>
  )
}

const SHOWCASE = [
  { id: 'dashboard', icon: LayoutDashboard, title: 'Your whole journey on one screen', desc: 'XP, streaks, active paths and exactly what to do next — the moment you sign in.', visual: 'dashboard' },
  { id: 'path', icon: Route, title: 'A path built around your goal', desc: 'Tell Lumintora what you want to learn. It generates lessons, quizzes and real coding problems — then reshapes them as you progress.', visual: 'path' },
  { id: 'tutor', icon: Bot, title: 'An AI tutor, right where you are', desc: 'Stuck on a line? Ask Lumi for a clear, concise explanation without ever leaving your lesson.', visual: 'tutor' },
  { id: 'streak', icon: Flame, title: 'Momentum you can actually see', desc: 'A GitHub-style contribution heatmap, current and longest streaks, and XP that turns effort into visible progress.', visual: 'streak' },
]

function ShowcaseVisual({ kind }) {
  if (kind === 'path') return <PathVisual />
  if (kind === 'tutor') return <TutorVisual />
  if (kind === 'streak') return <StreakVisual />
  return <DashboardShot />
}

function ScrollShowcase() {
  const [active, setActive] = useState(0)
  const stepRefs = useRef([])

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(Number(e.target.dataset.i))
        })
      },
      { rootMargin: '-48% 0px -48% 0px', threshold: 0 },
    )
    stepRefs.current.forEach((el) => el && io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <div className="section lp-sc-section" style={{ background: 'var(--bg-1)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto 12px', textAlign: 'center' }}>
        <div className="section-label">A closer look</div>
        <h2 className="section-title">One platform. Every step of the way.</h2>
        <p className="section-sub" style={{ margin: '0 auto' }}>Scroll through what you actually get — the screens update as you go.</p>
      </div>

      <div className="lp-sc">
        <div className="lp-sc-steps">
          {SHOWCASE.map((s, i) => (
            <div
              key={s.id}
              ref={(el) => (stepRefs.current[i] = el)}
              data-i={i}
              className={`lp-sc-step ${active === i ? 'active' : ''}`}
            >
              <div className="lp-sc-step-ico"><s.icon size={18} /></div>
              <h3 className="lp-sc-step-title">{s.title}</h3>
              <p className="lp-sc-step-desc">{s.desc}</p>
              <div className="lp-sc-inline"><ShowcaseVisual kind={s.visual} /></div>
            </div>
          ))}
        </div>

        <div className="lp-sc-visual-wrap">
          <div className="lp-sc-visual">
            <div className="lp-sc-pane" key={active}><ShowcaseVisual kind={SHOWCASE[active].visual} /></div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, desc }) {
  return (
    <div className="feature-card">
      <div className="lp-feat-ico"><Icon size={18} /></div>
      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.55 }}>{desc}</div>
    </div>
  )
}

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="lp-faq-item">
      <button className="lp-faq-q" onClick={() => setOpen(!open)}>
        <span>{q}</span>
        <ChevronDown size={18} style={{ flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>
      {open && <div className="lp-faq-a">{a}</div>}
    </div>
  )
}

function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState('idle')
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))
  const submit = async (e) => {
    e.preventDefault()
    setStatus('loading')
    try {
      await api.submitContact({ name: form.name.trim(), email: form.email.trim(), message: form.message.trim() })
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }
  if (status === 'done') return (
    <div className="lp-contact-thanks">
      <CheckCircle2 size={36} color="var(--green)" />
      <h3>Message received!</h3>
      <p>We'll get back to you within 24 hours.</p>
    </div>
  )
  return (
    <form onSubmit={submit} className="lp-contact-form">
      <div className="lp-contact-row">
        <div className="lp-contact-field">
          <label>Your name</label>
          <input className="field-input" placeholder="John Doe" value={form.name} onChange={set('name')} required />
        </div>
        <div className="lp-contact-field">
          <label>Email address</label>
          <input className="field-input" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
        </div>
      </div>
      <div className="lp-contact-field">
        <label>Message</label>
        <textarea className="field-input" placeholder="Tell us how we can help..." value={form.message} onChange={set('message')} required rows={5} style={{ resize: 'vertical' }} />
      </div>
      {status === 'error' && <p style={{ color: 'var(--rose)', fontSize: 13, margin: 0 }}>Something went wrong. Please try again.</p>}
      <Button type="submit" loading={status === 'loading'} style={{ width: '100%', justifyContent: 'center' }}>
        Send message <ArrowRight size={15} />
      </Button>
      <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-3)', margin: '10px 0 0' }}>
        Or email us at <a href="mailto:lumintoraai@gmail.com" style={{ color: 'var(--accent-ink)' }}>lumintoraai@gmail.com</a>
      </p>
    </form>
  )
}

function BlogCard({ post }) {
  return (
    <Link to={`/blog/${post.slug}`} className="lp-blog-card">
      <div className="lp-blog-card-header" style={{ background: post.gradient }}>
        <BookOpen size={20} style={{ position: 'absolute', top: 16, right: 16, color: 'rgba(255,255,255,0.35)' }} />
        <div className="lp-blog-header-tags">
          {(post.tags ?? []).map(t => <span key={t} className="lp-blog-header-tag">{t}</span>)}
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

function UpdatesForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle')
  const submit = async (e) => {
    e.preventDefault()
    setStatus('loading')
    try {
      await api.submitContact({ name: 'Updates subscriber', email, message: 'Product updates subscription' })
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }
  if (status === 'done') return <p style={{ fontSize: 13, color: 'var(--green)', textAlign: 'center', margin: 0 }}>✓ You're on the list!</p>
  return (
    <form onSubmit={submit} className="lp-updates-form">
      <input
        className="lp-updates-input"
        type="email"
        placeholder="Email for product updates"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <button type="submit" className="btn btn-secondary btn-md" disabled={status === 'loading'}>
        Notify me
      </button>
    </form>
  )
}

/* ── Page ─────────────────────────────────────────────────── */

/* ── Header navigation menus ──────────────────────────────── */
const NAV_PRODUCT = [
  { to: '/paths/new',   icon: Route,    label: 'AI Path Builder',  desc: 'Generate a path around your goal' },
  { to: '/playground',  icon: Terminal, label: 'Code Playground',  desc: 'Write and run code in the browser' },
  { to: '/resume',      icon: FileText, label: 'Resume Builder',   desc: 'A polished resume in seconds' },
  { to: '/leaderboard', icon: Trophy,   label: 'Leaderboard',      desc: 'Climb the ranks, keep your streak' },
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard', desc: 'Your progress at a glance' },
]
const NAV_RESOURCES = [
  { to: '/blog',      icon: BookOpen,      label: 'Blog',          desc: 'Ideas on learning and AI' },
  { to: '/feedback',  icon: MessageSquare, label: 'Give feedback', desc: 'Tell us what to build next' },
]

function NavMenu({ label, items }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])
  return (
    <div
      className="lp-nav-item"
      ref={ref}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button type="button" className="lp-nav-trigger" onClick={() => setOpen(o => !o)} aria-expanded={open}>
        {label}
        <ChevronDown size={14} className="lp-nav-chev" style={{ transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>
      <div className={`lp-nav-drop ${open ? 'open' : ''}`}>
        {items.map(({ to, icon: Icon, label: l, desc }) => (
          <Link key={to} to={to} className="lp-nav-drop-item" onClick={() => setOpen(false)}>
            <span className="lp-nav-drop-ico"><Icon size={16} /></span>
            <span className="lp-nav-drop-text">
              <strong>{l}</strong>
              <span>{desc}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const row1 = [...topics, ...topics]
  const row2 = [...topics.slice(5), ...topics.slice(0, 5), ...topics.slice(5), ...topics.slice(0, 5)]

  // Scroll to a section when the URL carries a hash (e.g. /#contact from the footer),
  // both on first load and when the hash changes while already on this page.
  useEffect(() => {
    const scrollToHash = () => {
      const id = window.location.hash.replace('#', '')
      if (!id) return
      const el = document.getElementById(id)
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
    }
    scrollToHash()
    window.addEventListener('hashchange', scrollToHash)
    return () => window.removeEventListener('hashchange', scrollToHash)
  }, [location])

  return (
    <div className="lp-page" style={{ position: 'relative' }}>

      {/* ── Header ── */}
      <header className="lp-header">
        <Link to="/" style={{ display: 'inline-flex' }}><Logo size={30} /></Link>

        {/* Centered desktop nav */}
        <nav className="lp-nav">
          <NavMenu label="Product" items={NAV_PRODUCT} />
          <NavMenu label="Resources" items={NAV_RESOURCES} />
          <a href="/#features" className="lp-nav-link">Features</a>
        </nav>

        <div className="lp-header-actions">
          <Link to="/login" className="btn btn-ghost btn-md lp-hide-sm">Sign in</Link>
          <Link to="/register" className="btn btn-primary btn-md">Get started <ArrowRight size={15} /></Link>
          <button
            type="button"
            className="lp-nav-burger"
            aria-label="Menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(o => !o)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* Mobile menu panel */}
      {menuOpen && (
        <div className="lp-mobile-menu" onClick={() => setMenuOpen(false)}>
          <div className="lp-mobile-menu-inner" onClick={e => e.stopPropagation()}>
            <div className="lp-mm-group">
              <div className="lp-mm-head">Product</div>
              {NAV_PRODUCT.map(({ to, icon: Icon, label }) => (
                <Link key={to} to={to} className="lp-mm-link" onClick={() => setMenuOpen(false)}>
                  <Icon size={16} /> {label}
                </Link>
              ))}
            </div>
            <div className="lp-mm-group">
              <div className="lp-mm-head">Resources</div>
              {NAV_RESOURCES.map(({ to, icon: Icon, label }) => (
                <Link key={to} to={to} className="lp-mm-link" onClick={() => setMenuOpen(false)}>
                  <Icon size={16} /> {label}
                </Link>
              ))}
              <a href="/#features" className="lp-mm-link" onClick={() => setMenuOpen(false)}><Sparkles size={16} /> Features</a>
            </div>
            <div className="lp-mm-actions">
              <Link to="/login" className="btn btn-secondary btn-md" style={{ justifyContent: 'center' }} onClick={() => setMenuOpen(false)}>Sign in</Link>
              <Link to="/register" className="btn btn-primary btn-md" style={{ justifyContent: 'center' }} onClick={() => setMenuOpen(false)}>Get started <ArrowRight size={15} /></Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Hero ── */}
      <div className="landing-hero">
        <div className="landing-glow" />
        <div className="landing-glow" style={{ width: 540, height: 380, top: '30%', left: '65%', opacity: 0.55 }} />

        <div className="landing-hero-inner">
          <div className="landing-hero-text">
            <div className="beta-pill animate-fade">
              <span className="beta-pill-tag">LIVE</span>
              <span>Lumintora v1 is live — completely free</span>
            </div>

            <h1 className="landing-h1 animate-fade" style={{ animationDelay: '0.05s' }}>
              Your goal. Your path.<br />
              <span className="gradient-text" style={{ fontStyle: 'italic' }}>Your way to learn.</span>
            </h1>

            <p className="landing-sub animate-fade" style={{ animationDelay: '0.1s' }}>
              AI builds a learning path around where you are — not where it assumes you should be.
              Real coding practice. Adaptive quizzes. Free.
            </p>

            <div className="landing-cta animate-fade" style={{ animationDelay: '0.15s' }}>
              <Link to="/register" className="btn btn-primary btn-xl">Start learning free <ArrowRight size={16} /></Link>
              <Link to="/login" className="btn btn-secondary btn-xl">Sign in</Link>
            </div>

            <div className="animate-fade lp-hero-trust" style={{ animationDelay: '0.18s' }}>
              {['No credit card', 'AI-generated paths', 'Real coding judge', 'Completely free'].map((t) => (
                <span key={t} className="lp-trust-item">
                  <CheckCircle2 size={14} color="var(--green)" /> {t}
                </span>
              ))}
            </div>

            {/* ── Hero promo banners ── */}
            <div className="lp-hero-banners animate-fade" style={{ animationDelay: '0.22s' }}>
              <Link to="/register" className="lp-hero-banner">
                <span className="lp-hb-ico" style={{ color: 'var(--accent-ink)', background: 'var(--accent-soft)' }}><Sparkles size={16} /></span>
                <div className="lp-hb-text">
                  <strong>New — Forge</strong>
                  <span>Refresh what you've forgotten with a short, adaptive session.</span>
                </div>
                <ArrowRight size={15} className="lp-hb-arrow" />
              </Link>
              <Link to="/resume" className="lp-hero-banner">
                <span className="lp-hb-ico" style={{ color: 'var(--accent-ink)', background: 'var(--accent-soft)' }}><FileText size={16} /></span>
                <div className="lp-hb-text">
                  <strong>New — AI Resume Builder</strong>
                  <span>A polished, print-ready resume in seconds.</span>
                </div>
                <ArrowRight size={15} className="lp-hb-arrow" />
              </Link>
              <Link to="/leaderboard" className="lp-hero-banner">
                <span className="lp-hb-ico" style={{ color: '#c2790a', background: 'var(--amber-soft)' }}><Trophy size={16} /></span>
                <div className="lp-hb-text">
                  <strong>Compete on the leaderboard</strong>
                  <span>Earn XP, keep your streak, and see where you rank.</span>
                </div>
                <ArrowRight size={15} className="lp-hb-arrow" />
              </Link>
            </div>
          </div>

          <div className="landing-hero-shot animate-fade" style={{ animationDelay: '0.22s' }}>
            <DashboardShot />
          </div>
        </div>
      </div>

      {/* ── Scroll showcase (pinned visual changes with content) ── */}
      <ScrollShowcase />

      {/* ── How it works ── */}
      <div className="section">
        <div style={{ maxWidth: 1040, margin: '0 auto' }}>
          <div className="section-label" style={{ textAlign: 'center' }}>How it works</div>
          <h2 className="section-title" style={{ textAlign: 'center' }}>From a goal to mastery — in one loop.</h2>
          <div className="lp-flow">
            {steps.map((s, i) => (
              <div key={s.n} className="lp-flow-step">
                <div className="lp-flow-n">{s.n}</div>
                <div className="lp-flow-title">{s.title}</div>
                <div className="lp-flow-desc">{s.desc}</div>
                {i < steps.length - 1 && <ArrowRight className="lp-flow-arrow" size={16} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── What's included ── */}
      <div id="features" className="section" style={{ background: 'var(--bg-1)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', scrollMarginTop: 80 }}>
        <div style={{ maxWidth: 1040, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto 48px' }}>
            <div className="section-label">What's included</div>
            <h2 className="section-title">All of it, completely free.</h2>
            <p className="section-sub" style={{ margin: '0 auto' }}>Every feature below is live today. We're shipping more every week.</p>
          </div>
          <div className="lp-grid">
            {features.map(f => <FeatureCard key={f.title} {...f} />)}
          </div>
        </div>
      </div>

      {/* ── Learning Paths marquee ── */}
      <div className="lp-marquee-section">
        <div style={{ maxWidth: 1040, margin: '0 auto 36px', padding: '0 24px', textAlign: 'center' }}>
          <div className="section-label">Learning Paths</div>
          <h2 className="section-title" style={{ marginBottom: 10 }}>Any topic. One platform.</h2>
          <p style={{ color: 'var(--text-2)', fontSize: 16, margin: 0 }}>
            Tell us your goal and we'll generate a path — no matter the topic.
          </p>
        </div>
        <div className="lp-marquee-wrap" style={{ marginBottom: 14 }}>
          <div className="lp-marquee lp-marquee-left">
            {row1.map((t, i) => (
              <div key={i} className="lp-topic-card">
                <span className="lp-topic-ico" style={{ background: t.bg, color: t.color }}>
                  <t.icon size={18} />
                </span>
                <div className="lp-topic-text">
                  <div className="lp-topic-name">{t.label}</div>
                  <div className="lp-topic-sub">{t.sub}</div>
                </div>
                <ArrowRight size={15} className="lp-topic-arrow" />
              </div>
            ))}
          </div>
        </div>
        <div className="lp-marquee-wrap">
          <div className="lp-marquee lp-marquee-right">
            {row2.map((t, i) => (
              <div key={i} className="lp-topic-card">
                <span className="lp-topic-ico" style={{ background: t.bg, color: t.color }}>
                  <t.icon size={18} />
                </span>
                <div className="lp-topic-text">
                  <div className="lp-topic-name">{t.label}</div>
                  <div className="lp-topic-sub">{t.sub}</div>
                </div>
                <ArrowRight size={15} className="lp-topic-arrow" />
              </div>
            ))}
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: 36 }}>
          <Link to="/register" className="btn btn-secondary btn-md">Explore all topics <ArrowRight size={14} /></Link>
        </div>
      </div>

      {/* ── Blog ── */}
      <div className="section" style={{ background: 'var(--bg)' }}>
        <div style={{ maxWidth: 1040, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div className="section-label">Blog</div>
              <h2 className="section-title" style={{ marginBottom: 0 }}>Thinking about learning.</h2>
              <p style={{ color: 'var(--text-2)', fontSize: 16, marginTop: 10, marginBottom: 0 }}>
                Ideas on education, AI, and what it means to actually get good at something.
              </p>
            </div>
            <Link to="/blog" className="btn btn-secondary btn-md">
              Read the blog <ArrowRight size={14} />
            </Link>
          </div>
          <div className="lp-blog-grid">
            {[...BLOG_POSTS].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3).map(p => <BlogCard key={p.slug} post={p} />)}
          </div>
        </div>
      </div>

      {/* ── FAQ ── */}
      <div id="faq" className="section" style={{ background: 'var(--bg-1)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', scrollMarginTop: 80 }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="section-label">FAQ</div>
            <h2 className="section-title">Common questions, answered.</h2>
          </div>
          <div className="lp-faq">
            {FAQS.map(faq => <FAQItem key={faq.q} {...faq} />)}
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="section" style={{ textAlign: 'center', background: 'var(--bg-1)', borderTop: '1px solid var(--border)' }}>
        <div className="landing-glow" style={{ top: '50%' }} />
        <div style={{ maxWidth: 560, margin: '0 auto', position: 'relative' }}>
          <div className="beta-pill" style={{ margin: '0 auto 18px' }}>
            <span className="beta-pill-tag">LIVE</span><span>Now open to everyone</span>
          </div>
          <h2 className="section-title">Your adaptive path starts here.</h2>
          <p style={{ fontSize: 16, color: 'var(--text-2)', margin: '12px auto 28px', lineHeight: 1.6 }}>
            No waitlist. No payment. Sign up and generate your first path in under a minute.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
            <Link to="/register" className="btn btn-primary btn-xl">Get started free <ArrowRight size={16} /></Link>
            <Link to="/login" className="btn btn-secondary btn-xl">Sign in</Link>
          </div>
          <UpdatesForm />
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 10 }}>Occasional updates as new features ship. No spam.</p>
        </div>
      </div>

      {/* ── Footer ── */}
      <SiteFooter />

      <ChatWidget />
    </div>
  )
}
