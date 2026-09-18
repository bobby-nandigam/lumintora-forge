import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import Logo from '../components/Logo'
import { ArrowLeft, ArrowRight, Clock, Calendar, Twitter, Linkedin, Link2, Check, Target, ScanSearch, GitBranch, Route, RefreshCw } from 'lucide-react'
import '../components/UI.css'
import SiteFooter from '../components/SiteFooter'

/* ── Table of contents for each post ───────────────────────── */
const TOC = {
  'staying-consistent': [
    { id: 'why-we-quit',            label: "Why most people quit (it isn't motivation)" },
    { id: 'consistency-over-intensity', label: 'Consistency beats intensity' },
    { id: 'the-streak-effect',      label: 'The streak effect' },
    { id: 'start-small',            label: 'Start absurdly small' },
    { id: 'show-up-daily',          label: 'Show up daily, even badly' },
    { id: 'make-it-visible',        label: 'Make progress visible' },
    { id: 'recover-from-breaks',    label: 'Recover from breaks' },
    { id: 'let-it-compound',        label: 'Let it compound' },
    { id: 'on-lumintora',           label: 'How Lumintora keeps you consistent' },
  ],
  'future-of-learning': [
    { id: 'traditional-problem', label: 'The problem with traditional learning' },
    { id: 'every-learner',       label: 'Why every learner is different' },
    { id: 'ai-learning',         label: 'How AI enables personalised learning' },
    { id: 'adaptive-meaning',    label: 'What adaptive learning actually means' },
    { id: 'lumintora-approach',  label: 'How Lumintora is approaching this' },
    { id: 'future-of-education', label: 'The future of education' },
  ],
  'ai-personalized-learning-path': [
    { id: 'what-personalized-means', label: 'What "personalized" actually means' },
    { id: 'five-step-workflow',      label: 'The 5-step workflow' },
    { id: 'step-goal',              label: 'Step 1 — Define your goal' },
    { id: 'step-baseline',          label: 'Step 2 — Assess your baseline' },
    { id: 'step-gaps',              label: 'Step 3 — Map your knowledge gaps' },
    { id: 'step-path',              label: 'Step 4 — Generate the path' },
    { id: 'step-adapt',            label: 'Step 5 — Adapt in real time' },
    { id: 'on-lumintora',           label: 'What this looks like on Lumintora' },
  ],
  'ai-changing-how-we-learn': [
    { id: 'access-vs-direction',     label: 'The internet solved access. AI solves direction.' },
    { id: 'start-where-you-are',     label: 'Learning should begin with where you are' },
    { id: 'ai-tutors',               label: 'AI tutors are only the beginning' },
    { id: 'practice-not-explanation', label: 'The real test is practice' },
    { id: 'coding-example',          label: 'Coding is the perfect example' },
    { id: 'learning-behavior',       label: 'When AI understands how you learn' },
    { id: 'not-effortless',          label: 'AI shouldn’t make learning effortless' },
    { id: 'ai-plus-human',           label: 'The future is AI + human effort' },
    { id: 'courses-to-systems',      label: 'From courses to learning systems' },
    { id: 'becoming-personal',       label: 'Learning is becoming personal' },
  ],
}

/* ── All blog posts defined here ──────────────────────────── */
const posts = {
  'staying-consistent': {
    tag: 'Habits & Motivation',
    title: 'The Consistency Problem: Why Most People Quit Learning',
    author: 'Bobby Nandigam',
    role: 'Contributor, Lumintora',
    date: 'August 22, 2026',
    readTime: '8 min read',
    body: <ConsistencyProblem />,
  },
  'future-of-learning': {
    tag: 'Education',
    title: 'The Future of Learning: Why One-Size-Fits-All Education No Longer Works',
    author: 'Bobby Nandigam',
    role: 'Contributor, Lumintora',
    date: 'June 28, 2026',
    readTime: '8 min read',
    body: <FutureOfLearning />,
  },
  'ai-personalized-learning-path': {
    tag: 'AI',
    title: 'How AI Creates a Personalized Learning Path for Every Student',
    author: 'Bobby Nandigam',
    role: 'Contributor, Lumintora',
    date: 'July 1, 2026',
    readTime: '7 min read',
    body: <HowAIPersonalizedPath />,
  },
  'ai-changing-how-we-learn': {
    tag: 'AI & Learning',
    title: 'AI Is Changing How We Learn: What the Next Generation of Learning Looks Like',
    author: 'Bobby Nandigam',
    role: 'Contributor, Lumintora',
    date: 'August 15, 2026',
    readTime: '9 min read',
    body: <AIChangingHowWeLearn />,
  },
}

function ShareButtons({ title }) {
  const [copied, setCopied] = useState(false)
  const url = window.location.href

  const shareTwitter = () =>
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400')

  const shareLinkedIn = () =>
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400')

  const copyLink = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="blog-share-icons">
      <button onClick={shareTwitter} className="blog-share-icon" title="Share on X / Twitter">
        <Twitter size={15} />
      </button>
      <button onClick={shareLinkedIn} className="blog-share-icon" title="Share on LinkedIn">
        <Linkedin size={15} />
      </button>
      <button onClick={copyLink} className="blog-share-icon" title="Copy link">
        {copied ? <Check size={15} style={{ color: 'var(--green)' }} /> : <Link2 size={15} />}
      </button>
    </div>
  )
}

export default function BlogPost() {
  const { slug = 'future-of-learning' } = useParams()
  const post = posts[slug]
  const toc  = TOC[slug] ?? []
  const [activeId, setActiveId] = useState('')

  useEffect(() => {
    if (!toc.length) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => { if (e.isIntersecting) setActiveId(e.target.id) })
      },
      { rootMargin: '-80px 0px -55% 0px', threshold: 0 }
    )
    toc.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [slug])

  if (!post) return <div style={{ padding: 48, textAlign: 'center' }}>Post not found. <Link to="/">← Home</Link></div>

  return (
    <div className="blog-page">
      {/* Header */}
      <header className="blog-header">
        <Link to="/" className="blog-logo"><Logo size={26} /></Link>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/login"    className="btn btn-ghost btn-sm">Sign in</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Get started free <ArrowRight size={13} /></Link>
        </div>
      </header>

      <main className="blog-main">
        {/* Back */}
        <Link to="/" className="blog-back">
          <ArrowLeft size={15} /> Back to home
        </Link>

        {/* Article header */}
        <div className="blog-article-head">
          <span className="lp-blog-tag" style={{ marginBottom: 20, display: 'inline-block' }}>{post.tag}</span>
          <h1 className="blog-h1">{post.title}</h1>
          <div className="blog-byline">
            <div className="lp-blog-ava">{post.author[0]}</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{post.author}</div>
              <div style={{ fontSize: 13, color: 'var(--text-3)' }}>{post.role}</div>
            </div>
            <div className="blog-byline-sep" />
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--text-3)' }}>
              <Calendar size={13} /> {post.date}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--text-3)' }}>
              <Clock size={13} /> {post.readTime}
            </span>
          </div>
        </div>

        {/* Content + right sidebar */}
        <div className="blog-content-layout blog-content-layout-right">
          {/* Article body */}
          <article className="blog-body">
            {post.body}
          </article>

          {/* Right sticky sidebar */}
          <aside className="blog-sidebar">
            {toc.length > 0 && (
              <div className="blog-sidebar-section">
                <div className="blog-sidebar-label">On this page</div>
                {toc.map(({ id, label }) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    className={`blog-toc-link ${activeId === id ? 'active' : ''}`}
                    onClick={e => {
                      e.preventDefault()
                      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }}
                  >
                    {label}
                  </a>
                ))}
              </div>
            )}

            <div className="blog-sidebar-section">
              <div className="blog-sidebar-label">Share this article</div>
              <ShareButtons title={post.title} />
            </div>
          </aside>
        </div>

        {/* CTA */}
        <div className="blog-cta">
          <div className="blog-cta-inner">
            <div className="blog-cta-label">Ready to experience adaptive learning?</div>
            <h2 className="blog-cta-h2">Your personalised learning path is one click away.</h2>
            <p className="blog-cta-sub">
              Lumintora generates a learning path built around your goal — then reshapes it as you grow. Free during beta.
            </p>
            <Link to="/register" className="btn btn-primary btn-lg">
              Start learning free <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}

/* ── Article helpers ─────────────────────────────────────── */

function Section({ id, title, children }) {
  return (
    <section id={id} className="blog-section">
      <h2 className="blog-h2">{title}</h2>
      {children}
    </section>
  )
}
function P({ children, style }) { return <p className="blog-p" style={style}>{children}</p> }
function Quote({ children, credit }) {
  return (
    <blockquote className="blog-quote">
      <p>{children}</p>
      {credit && <cite>{credit}</cite>}
    </blockquote>
  )
}
function Callout({ children }) { return <div className="blog-callout">{children}</div> }

/* ── Article content ─────────────────────────────────────── */

function FutureOfLearning() {
  return (
    <>
      <P>
        The education system wasn't built to know you. It was built to move you — from one module to the next, at the same pace as everyone else, toward an average outcome. For most of history, that was the only option we had. This piece is about why that model is quietly failing a generation of learners, and what a genuinely different approach looks like.
      </P>
      <P>
        The internet was supposed to fix this. MOOCs launched with enormous ambition — "the best education in the world, free for everyone." A decade on, course completion rates sit between 3% and 15%. The content moved online. The model didn't.
      </P>
      <P>
        The gap between knowing and understanding has never been wider. And closing it requires something the system has never offered at scale: a path that adapts to <em>you</em>.
      </P>

      <Section id="traditional-problem" title="The problem with traditional learning">
        <P>
          Modern education was designed for an industrial world that needed to move thousands of students through a fixed curriculum as efficiently as possible. Standardised tests, fixed pacing, identical syllabi — all of it made sense in an era where personalisation at scale was simply impossible.
        </P>
        <P>
          The traditional model asks you to adapt to it. You fit into the course, not the other way around. If you already know the first three weeks of material, too bad — you still sit through them. If you're struggling with week two, the class moves to week three regardless.
        </P>
        <Quote credit="John Dewey, philosopher of education">
          "Education is not preparation for life; education is life itself."
        </Quote>
        <P>
          The result is a system optimised for the median learner that serves almost no one particularly well. Those ahead get bored. Those behind get lost. And both groups quietly conclude that the problem is them.
        </P>
      </Section>

      <Section id="every-learner" title="Why every learner is different">
        <P>
          Two people can sit in the same classroom for the same amount of time and walk out with wildly different amounts of knowledge — not because one is smarter, but because of differences that the system doesn't account for at all.
        </P>
        <P>
          <strong>Prior knowledge</strong> is the biggest one. If you already know Python, a beginner programming course is actively wasteful. You spend 80% of your time on things you know and 20% on the edges that would genuinely challenge you. The ratio should be inverted.
        </P>
        <P>
          Then there's <em>motivation</em>. A student preparing for exams learns differently than a professional switching careers, who learns differently than someone exploring out of curiosity. The destination shapes the path. A system that ignores your destination is just guessing.
        </P>
        <P>
          And then there's pace. Some people process new ideas quickly but need repetition to retain them. Others are slow to absorb but retain almost everything once it clicks. A fixed schedule serves neither particularly well.
        </P>
        <Callout>
          The one-size-fits-all model isn't just inefficient — it's quietly demoralising. When you fall behind a class that wasn't designed for you, it's easy to conclude that you're not a "learning person." You are. You just needed a different path.
        </Callout>
      </Section>

      <Section id="ai-learning" title="How AI enables personalised learning">
        <P>
          For most of human history, the only way to get truly personalised education was a private tutor. A good tutor doesn't follow a script. They watch you, adjust in real time, notice where you slow down, skip what you already know, and change the approach when something isn't working. The problem? Private tutors are expensive. You can't give everyone one.
        </P>
        <P>
          AI changes that calculus. Not perfectly, not magically — but meaningfully. For the first time, the cost of personalisation at scale is approaching zero.
        </P>
        <ul className="blog-list">
          <li><strong>It reads your behaviour, not just your answers.</strong> How long did you spend on that problem? Did you breeze through it or iterate five times? Did you ask for a hint? All of this is signal.</li>
          <li><strong>It sequences content for you, not for the median learner.</strong> If you've demonstrated mastery of a concept, an adaptive system skips the review. If you're struggling, it finds a different explanation before moving on.</li>
          <li><strong>It provides feedback in the moment.</strong> Not three days later when a professor marks your assignment. Right now, while the context is live in your head.</li>
          <li><strong>It doesn't get tired, impatient, or distracted.</strong> You can ask the same question eight different ways at midnight, and it will engage with you as thoroughly as it did on the first.</li>
        </ul>
        <P>
          None of this replaces great human teachers — relationships, inspiration, and deep domain wisdom can't be replicated. But the mechanical parts of education: sequencing, pacing, repetition, assessment — can be handled by systems that genuinely know where each learner stands.
        </P>
      </Section>

      <Section id="adaptive-meaning" title="What adaptive learning actually means">
        <P>
          Let's be precise here, because "adaptive learning" has become a marketing phrase used to sell almost anything with a progress bar.
        </P>
        <P>True adaptive learning is not:</P>
        <ul className="blog-list">
          <li>Choosing "beginner / intermediate / advanced" at sign-up and never changing again</li>
          <li>A recommendation engine that suggests more content on the same topic</li>
          <li>A quiz that adjusts difficulty between sessions but forgets everything you struggled with last week</li>
        </ul>
        <P>
          True adaptive learning means the system changes <em>the structure of your path</em> based on real-time evidence about what you know. If you score 92% on a module quiz, the next module should challenge you more. If you score 40%, something needs to be revisited before moving forward — not after.
        </P>
        <P>
          It also means the system remembers. Spaced repetition — revisiting concepts at increasing intervals — is one of the most well-evidenced techniques in learning science. An adaptive system should know when you're likely to start forgetting something and surface a review at exactly that moment.
        </P>
        <Quote>
          "The best learning system is one that knows what you need before you realise you need it."
        </Quote>
      </Section>

      <Section id="lumintora-approach" title="How Lumintora is approaching this">
        <P>
          Lumintora is early. It's a small team in beta, and it doesn't claim to have solved adaptive learning. Here's what it's built and why each piece exists.
        </P>
        <ul className="blog-list">
          <li><strong>AI-generated paths, not templated courses.</strong> When you tell Lumintora your goal, the AI builds a path specific to that goal — considering your stated level, the topic's depth, and the most logical learning sequence.</li>
          <li><strong>Paths that reshape after every assessment.</strong> Quiz results and coding challenge outcomes feed back into your path. Struggling on a topic triggers a review. Breezing through signals readiness to move faster.</li>
          <li><strong>Lumi, your always-on tutor.</strong> The AI tutor is embedded into your learning. Select any text in a lesson and ask Lumi to explain it, simplify it, or connect it to something you already know.</li>
          <li><strong>A real coding judge.</strong> Theory without practice is almost useless in technical subjects. Lumintora grades your code against real test cases, including hidden ones — exactly like a real coding interview.</li>
          <li><strong>Streaks and XP as honest accountability.</strong> A contribution heatmap and XP system make your effort visible and give you something to maintain.</li>
        </ul>
        <P>
          Every week, real learner behaviour shapes what gets built next. If something feels off, the team reads every piece of feedback — and it directly influences the product.
        </P>
      </Section>

      <Section id="future-of-education" title="The future of education">
        <P>
          AI won't replace teachers. It will free them.
        </P>
        <P>
          The best teachers aren't the ones who are most efficient at delivering information. They're the ones who notice when you're lost, who push you when you're comfortable, who make you care about something you thought was boring. That's a deeply human skill.
        </P>
        <P>
          But the mechanical work of education — sequencing content, assessing comprehension, identifying gaps, providing repetition — doesn't require a human. It requires a good system. And for the first time in history, we have the tools to build one.
        </P>
        <P>
          The future of learning looks like this: AI handles the structure, humans handle the inspiration. Technology personalises the path, teachers deepen the meaning. Assessment becomes continuous and invisible rather than high-stakes and episodic.
        </P>
        <Callout>
          If you've ever felt left behind by a class, or bored by material you already knew, or frustrated that a course wasn't built for someone like you — you weren't failing. The system was. That's the problem worth fixing.
        </Callout>
        <P style={{ fontStyle: 'italic', color: 'var(--text-2)', marginTop: 32 }}>
          — Bobby Nandigam
        </P>
      </Section>
    </>
  )
}

/* ── Second article ──────────────────────────────────────── */

function WorkflowStep({ num, icon: Icon, title, desc }) {
  return (
    <div className="blog-workflow-step">
      <div className="blog-workflow-ico"><Icon size={17} /></div>
      <div className="blog-workflow-body">
        <div className="blog-workflow-title"><span style={{ color: 'var(--text-3)', fontWeight: 500, marginRight: 8 }}>Step {num}</span>{title}</div>
        <div className="blog-workflow-desc">{desc}</div>
      </div>
    </div>
  )
}

function HowAIPersonalizedPath() {
  return (
    <>
      <P>
        Every learner starts somewhere different. One person sits down with solid Python knowledge but zero machine learning experience. Another has a vague goal — "I want to get into tech" — and doesn't know where to begin. A third knows exactly the role they want but can't figure out which skills actually matter for it.
      </P>
      <P>
        A fixed course treats all three identically. An AI-powered system doesn't. Here's a transparent look at how adaptive learning platforms build a path that fits you specifically — and then reshape it as you grow.
      </P>

      <Section id="what-personalized-means" title='What "personalized" actually means'>
        <P>
          "Personalized learning" has been marketed so broadly it's nearly lost its meaning. Choosing a username isn't personalization. Neither is picking a difficulty level at sign-up and never having the system revisit that choice again.
        </P>
        <P>
          True personalization means the system changes <em>what</em> you study, in <em>what order</em>, at <em>what depth</em> — based on evidence about what you actually know right now, not what you said you knew three weeks ago.
        </P>
        <P>
          This requires three things working together: an accurate picture of your starting point, a clear model of your destination, and a system smart enough to build the shortest honest path between the two.
        </P>
      </Section>

      <Section id="five-step-workflow" title="The 5-step workflow">
        <P>
          Here's how a modern adaptive learning system — and specifically how Lumintora — builds your path from nothing to a structured, personalized curriculum in seconds.
        </P>
        <div className="blog-workflow">
          <WorkflowStep
            num={1} icon={Target}
            title="You define your goal"
            desc="You tell the system what you want to achieve — a job title, a skill, a certification, a project. The more specific the goal, the more precise the path. 'I want to become a backend engineer at a product startup' produces a fundamentally different path than 'I want to learn coding.'"
          />
          <WorkflowStep
            num={2} icon={ScanSearch}
            title="AI assesses your baseline"
            desc="A short diagnostic — a few targeted questions or a quick challenge — gives the system a picture of where you actually stand. Not where you think you stand. What you already know gets skipped. What you don't know gets scheduled."
          />
          <WorkflowStep
            num={3} icon={GitBranch}
            title="Knowledge gaps are mapped"
            desc="The AI models your current understanding against a full skill graph for your goal. It identifies prerequisite gaps (things you'll need before you can learn the target skill), missing fundamentals, and the fastest bridge between where you are and where you're going."
          />
          <WorkflowStep
            num={4} icon={Route}
            title="A custom path is generated"
            desc="Every module, quiz, project, and coding challenge is sequenced specifically for you. The system decides order, depth, and pacing. No two paths are identical — even two people with the same goal get different paths if their starting points differ."
          />
          <WorkflowStep
            num={5} icon={RefreshCw}
            title="The path adapts as you learn"
            desc="Quiz scores, time-on-task, coding results, and hint usage feed back into the model continuously. Score 90%? The next module assumes you're ready for more depth. Score 45%? Something is revisited before moving forward."
          />
        </div>
      </Section>

      <Section id="step-goal" title="Step 1 — Define your goal">
        <P>
          Goal definition sounds trivial, but it's doing more work than it appears. The AI needs a concrete destination to reason backwards from. "I want to learn Python" gives it very little. "I want to build and deploy a REST API in Python and get a junior backend role in six months" gives it everything it needs.
        </P>
        <P>
          A well-specified goal lets the system answer three questions immediately: what skills are required, in roughly what order they should be learned, and what "done" looks like. From there, everything else follows.
        </P>
        <P>
          On Lumintora, you type your goal in plain language. The AI interprets it, clarifies if needed, and starts building. No dropdown menus, no category trees — just your goal, in your words.
        </P>
      </Section>

      <Section id="step-baseline" title="Step 2 — Assess your baseline">
        <P>
          The single biggest flaw in most online courses is that they assume you know nothing. If you already know 40% of the material, you sit through 40% of a course that teaches you nothing new — and then wonder why you didn't finish it.
        </P>
        <P>
          Baseline assessment fixes this by finding your actual starting line. It doesn't need to be exhaustive. A handful of well-designed questions — chosen to maximize information, not just difficulty — can establish your level with surprising accuracy.
        </P>

        <Quote>
          "The goal of assessment isn't to grade you. It's to find exactly where your knowledge stops — so the system knows exactly where to start."
        </Quote>

        <P>
          Adaptive diagnostic systems use a technique called item response theory (IRT): questions are selected dynamically based on your previous answers. Get one right, the next is harder. Get one wrong, it probes the boundaries of what you do know. In fewer than ten questions, the system can pinpoint your level with reasonable precision.
        </P>
      </Section>

      <Section id="step-gaps" title="Step 3 — Map your knowledge gaps">
        <P>
          Every skill has prerequisites. You can't learn neural networks without linear algebra. You can't write secure APIs without understanding authentication fundamentals. You can't optimize SQL queries without understanding how indices work.
        </P>
        <P>
          A skill graph is a map of these dependencies — every concept and the other concepts it depends on. Once the system knows your goal and your baseline, it computes the delta: which nodes in the graph you've already covered, which ones are missing, and which need to be learned in what order because they unblock the others.
        </P>
        <P>
          This is why two learners with the same goal but different baselines get very different paths. They're heading to the same destination — but they're not starting from the same place.
        </P>
      </Section>

      <Section id="step-path" title="Step 4 — Generate the path">
        <P>
          Path generation is where everything comes together. The system takes your goal, your baseline, your gap map, and your constraints (how much time you have, how quickly you want to progress) and produces an ordered sequence of learning units.
        </P>
        <P>Each unit is chosen for three reasons:</P>
        <ul className="blog-list">
          <li><strong>It's the right prerequisite.</strong> You're ready for it — it builds directly on what you just covered.</li>
          <li><strong>It's the right depth.</strong> Not every concept needs the same level of coverage. The system calibrates based on how central the concept is to your specific goal.</li>
          <li><strong>It's the right format.</strong> Some concepts click through reading. Others through a coding exercise. Others through a worked example. The system mixes formats based on what works for the type of content.</li>
        </ul>
        <Callout>
          A good path doesn't just list what to learn — it makes a specific decision about order, depth, and format for every single step. That's the difference between a syllabus and a path.
        </Callout>
      </Section>

      <Section id="step-adapt" title="Step 5 — Adapt in real time">
        <P>
          A static path — no matter how well designed — becomes wrong the moment you start learning. Maybe you moved through the first three modules much faster than expected. Maybe you got stuck on week two and needed to revisit a fundamental. Maybe your goal shifted.
        </P>
        <P>
          Real adaptation means the path changes in response to actual evidence, not assumptions. Specifically:
        </P>
        <ul className="blog-list">
          <li><strong>Quiz performance</strong> signals mastery. High scores unlock faster progression. Low scores trigger targeted review before moving forward.</li>
          <li><strong>Time-on-task</strong> reveals struggle without explicit failure. Taking three times as long as expected on a concept is a signal, even if you eventually got it right.</li>
          <li><strong>Coding challenge outcomes</strong> are the most honest signal of all. You either pass the test cases or you don't. There's no partial credit for almost understanding something.</li>
          <li><strong>Hint usage</strong> surfaces conceptual confusion that quiz scores sometimes miss. If you needed three hints to solve a problem you "passed," the system notes it.</li>
        </ul>
        <P>
          Spaced repetition is layered on top: concepts you've learned are scheduled for review at increasing intervals — days, then weeks — so the system actively fights forgetting, not just teaches new things.
        </P>
      </Section>

      <Section id="on-lumintora" title="What this looks like on Lumintora">
        <P>
          On Lumintora, the entire process — from goal to first lesson — takes under two minutes. You type your goal, answer a short baseline diagnostic, and the system generates a path. It's structured into modules, each with lessons, a quiz, and a coding challenge where applicable.
        </P>
        <P>
          As you work through it, the path reshapes silently in the background. You'll rarely notice a change — you'll just find that the next module feels exactly as hard as it should, and that you're never waiting for content you already know or struggling with content you weren't ready for.
        </P>
        <P>
          Lumi, the embedded AI tutor, is available throughout. Select any text in a lesson and ask it to explain, simplify, or connect it to something else you know. It doesn't replace the path — it deepens it.
        </P>
        <P>
          This is what personalization at scale looks like when it's done honestly: not a difficulty slider, not a curated playlist, but a system that actually knows where you are and builds the shortest bridge to where you want to be.
        </P>
        <P style={{ fontStyle: 'italic', color: 'var(--text-2)', marginTop: 32 }}>
          — Bobby Nandigam
        </P>
      </Section>
    </>
  )
}

/* ── Fourth article ──────────────────────────────────────── */

function ConsistencyProblem() {
  return (
    <>
      <P>
        Almost everyone who sets out to learn something new starts the same way — with a burst of energy. New notebook, fresh course, a clean roadmap, a promise that <em>this time</em> will be different. Week one is electric. You study for three hours a day, you tell your friends, you feel unstoppable.
      </P>
      <P>
        Then week three arrives. A busy day breaks the rhythm. One missed session becomes two. The course tab stays open but untouched. And a month later you're back where you started, quietly convinced you're just not disciplined enough.
      </P>
      <P>
        Here's the thing almost nobody tells you: the people who eventually get good at something aren't the ones who started with the most motivation. They're the ones who stayed <strong>consistent</strong> long after the motivation ran out. This piece is about why consistency is the real skill behind learning — and a practical workflow for building it, even when you don't feel like it.
      </P>

      <Section id="why-we-quit" title="Why most people quit (it isn't motivation)">
        <P>
          We tend to explain quitting with a character flaw: "I'm lazy," "I have no willpower," "I never finish what I start." It's a tidy story, and it's almost always wrong. Motivation is not a stable resource you either have or lack — it's a mood. It shows up loudly at the start and then fades, predictably, for everyone. Building anything on top of it is like building on weather.
        </P>
        <P>
          The real reasons people quit are structural, not moral. The goal was too big to feel achievable. Progress was invisible, so effort felt pointless. A single missed day snowballed into an abandoned month. None of these are failures of character — they're failures of <em>system</em>. And systems can be fixed.
        </P>
        <Callout>
          If you've started and stopped learning something five times, you don't have a discipline problem. You have a design problem. The habit was built to depend on motivation, and motivation always leaves.
        </Callout>
      </Section>

      <Section id="consistency-over-intensity" title="Consistency beats intensity">
        <P>
          Imagine two learners. The first studies for eight hours every Sunday and does nothing the rest of the week. The second studies for twenty-five minutes a day, every day. Over a month, their raw hours are similar — but their outcomes are not even close.
        </P>
        <P>
          The daily learner wins, and it isn't subtle. Learning depends on repetition and recall over time, not on cramming. Twenty-five minutes a day means your brain revisits the material again and again, just as it's beginning to forget — which is exactly when review does the most good. The Sunday learner, by contrast, relearns half of what they lost during the week, every week.
        </P>
        <Quote>
          "You do not rise to the level of your goals. You fall to the level of your systems."
        </Quote>
        <P>
          Intensity feels productive because it's dramatic. Consistency feels unremarkable because it's quiet. But skill is built in the quiet — a little bit, most days, for longer than feels impressive.
        </P>
      </Section>

      <Section id="the-streak-effect" title="The streak effect">
        <P>
          There's a reason the humble streak — a simple count of consecutive days — is one of the most effective motivational tools ever put into software. It works because it reframes the goal. You stop asking the enormous question, "Will I ever master this?" and start asking the tiny, answerable one: "Can I keep the chain alive today?"
        </P>
        <P>
          A streak turns an abstract, distant ambition into a concrete daily decision. It also creates a small, healthy tension: once you've strung together ten days, you don't want to be the one who breaks it. That reluctance to break the chain is a gentle force, but pointed in the right direction, it carries you through the days when motivation is nowhere to be found.
        </P>
        <Callout>
          A streak isn't about the number. It's about lowering the daily decision from "should I do a big study session?" to "should I keep the chain alive?" — a question that's almost always easy to answer yes to.
        </Callout>
      </Section>

      <Section id="start-small" title="Start absurdly small">
        <P>
          Consistency isn't a personality trait you're born with or without — it's the output of a few deliberate choices, repeated. And the first of those choices is to start much smaller than feels serious.
        </P>
        <P>
          The most common mistake is starting too big. "I'll study two hours a day" is a commitment that feels impressive on Monday and impossible by Thursday. The bigger the daily target, the more days you'll fail to hit it — and every miss chips away at your belief that you can do this at all.
        </P>
        <P>
          So start smaller than feels serious. One lesson. One coding problem. Ten focused minutes. The target should be so small that skipping it feels more ridiculous than doing it. This isn't lowering your ambition — it's protecting the one thing that matters most in the early days: the unbroken habit of showing up.
        </P>
        <P>
          Almost always, once you've started, you'll do more than the minimum. But on the hard days, the minimum is what saves the streak. And the streak is what eventually delivers the skill.
        </P>
      </Section>

      <Section id="show-up-daily" title="Show up daily, even badly">
        <P>
          There's a quiet trap in wanting every session to be great. When you believe learning only "counts" if you're fully focused for an hour, you'll skip the days you can't manage that — and those skipped days are what kill the habit.
        </P>
        <P>
          The fix is to separate showing up from performing. A tired, distracted ten minutes still keeps the chain alive. It still tells your brain: this is who I am now. Over months, the identity — "I'm someone who learns every day" — becomes far more powerful than any individual study session.
        </P>
        <Quote>
          "The goal isn't a perfect day. The goal is to never let a good excuse become a broken chain."
        </Quote>
      </Section>

      <Section id="make-it-visible" title="Make progress visible">
        <P>
          Motivation fades partly because learning is slow and its progress is invisible. You can study for two weeks and feel exactly as clueless as when you started, even though you've improved a great deal. Without visible evidence of progress, your brain concludes the effort isn't working — and stops.
        </P>
        <P>
          This is why visible progress matters so much. A streak count, an XP total that ticks upward, a contribution heatmap that fills in day by day, a path that shows how far you've come — these turn slow, invisible growth into something you can see and feel. They give your effort a scoreboard.
        </P>
        <Callout>
          Visible progress is a psychological trick, and a completely honest one. You <em>are</em> making progress — you just can't feel it from the inside. A good system shows you the proof.
        </Callout>
      </Section>

      <Section id="recover-from-breaks" title="Recover from breaks">
        <P>
          Here's the part almost no one plans for: you will break the streak. Life happens — travel, illness, a brutal week at work. The break itself is not the problem. What determines whether you continue is what you do the day <em>after</em> the break.
        </P>
        <P>
          Most people treat a broken streak as proof of failure. "I ruined it, so what's the point." That single thought ends more learning journeys than any lack of talent ever has. The learners who last have a different rule, and it's a simple one: <strong>never miss twice.</strong> One missed day is an accident. Two in a row is the beginning of quitting.
        </P>
        <P>
          Recovering fast is a skill in itself, and it's more important than never slipping. Expect the break, forgive it instantly, and restart the very next day. A streak that resets to one and climbs again beats a streak you abandoned at forty.
        </P>
      </Section>

      <Section id="let-it-compound" title="Let it compound">
        <P>
          The final step isn't an action — it's patience. Consistency is frustrating precisely because its rewards are back-loaded. For weeks it feels like nothing is happening. The gains are too small to notice day to day, which is exactly why so many people quit right before the curve turns steep.
        </P>
        <P>
          But small daily progress compounds. A concept understood today makes tomorrow's concept easier. A problem solved this week makes next week's harder problem approachable. Skill doesn't grow in a straight line — it accelerates, quietly, until one day you realise you can do things that would have overwhelmed you a month ago.
        </P>
        <Quote>
          "Consistency looks boring right up until the moment it looks like talent."
        </Quote>
        <P>
          Your only job during the boring stretch is to protect the habit. Keep the sessions small, keep the chain alive, and let compounding do the work you can't rush.
        </P>
      </Section>

      <Section id="on-lumintora" title="How Lumintora keeps you consistent">
        <P>
          Everything above is a system — and systems are easier to keep when the tools are built around them. That's a large part of what Lumintora is designed to do: not just teach you, but help you keep showing up.
        </P>
        <ul className="blog-list">
          <li><strong>Small, clear next steps.</strong> Your path is broken into modules and lessons, so there's always an obvious, bite-sized "next thing" — no staring at a giant course wondering where to begin.</li>
          <li><strong>Streaks that reward showing up.</strong> A daily streak turns the vague goal of "get better at coding" into the simple daily question of keeping your chain alive.</li>
          <li><strong>XP and a contribution heatmap.</strong> Your effort becomes visible. Points tick up, active days fill in, and slow progress finally has a scoreboard you can watch grow.</li>
          <li><strong>A path that meets you where you are.</strong> Because the difficulty adapts, sessions rarely feel impossibly hard or pointlessly easy — the two feelings that most often make people quit.</li>
          <li><strong>Lumi, for the moment you're stuck.</strong> A sticking point is a common reason a streak breaks. Having an AI tutor a click away means "I got stuck" stops being a reason to walk away.</li>
        </ul>
        <P>
          None of this removes the effort — nothing can, and nothing should. But it removes a lot of the friction that turns a missed day into a quit. The rest is the quiet, unglamorous, genuinely powerful act of coming back tomorrow.
        </P>
        <Callout>
          You don't need more motivation. You need a smaller daily step, a visible streak, and a fast way to recover when you slip. Do that long enough, and consistency stops being something you force — it becomes who you are.
        </Callout>
        <P style={{ fontStyle: 'italic', color: 'var(--text-2)', marginTop: 32 }}>
          — Bobby Nandigam
        </P>
      </Section>
    </>
  )
}

/* ── Third article ───────────────────────────────────────── */

function AIChangingHowWeLearn() {
  return (
    <>
      <P>
        For decades, learning has followed roughly the same shape. You find a course. You watch the lessons. You take a quiz. You finish an assignment, and you move on to the next one. For some people that rhythm works — but for a lot of us, something about it quietly doesn't.
      </P>
      <P>
        You already know parts of the material, so you sit bored through them. You struggle with other parts, and the class moves on anyway. Somewhere in the middle you lose momentum — and you end up on YouTube at midnight, hunting for the one explanation that finally makes the thing you're stuck on click.
      </P>
      <P>
        The strange part is that none of this is a content problem. There has never been more educational material in the world than there is right now. Access was never the bottleneck. <strong>Direction</strong> is — knowing what to learn next. And that is exactly where AI is starting to change the experience: not by replacing teachers, and not by generating endless explanations, but by making learning genuinely personal, adaptive, and responsive to the individual learner.
      </P>

      <Section id="access-vs-direction" title="The internet solved access. AI can solve direction.">
        <P>
          The internet transformed education by making knowledge available to almost anyone. You can learn Python from hundreds of courses, study system design across thousands of articles, grind coding-interview problem sets for months, and watch lectures from the best universities in the world without leaving your room.
        </P>
        <P>
          And yet access to information has never automatically produced understanding. Picture two students opening the same Python course on the same morning. One has never written a line of code. The other has already shipped three applications. The course hands both of them the identical first lesson. The experienced student is bored within minutes; the beginner is still overwhelmed. The only thing the system got right was that they both clicked "enroll."
        </P>
        <Callout>
          An intelligent learning system should notice something obvious that traditional courses ignore: these are two completely different starting points, and they deserve two completely different first steps.
        </Callout>
      </Section>

      <Section id="start-where-you-are" title="Learning should begin with where you are">
        <P>
          The next generation of learning won't just ask what you want to learn. It will ask what you <em>already know</em> — and that difference turns out to be enormous.
        </P>
        <P>
          Instead of handing everyone the same curriculum, AI can weigh a learner's existing knowledge, goals, performance, and pace. Someone aiming for a backend role might already be fluent in Python and SQL but shaky on distributed systems. Someone else might have strong system-design instincts and weak data-structure fundamentals. Their paths shouldn't look remotely alike.
        </P>
        <Quote>
          "The goal isn't to give everyone more content. It's to give everyone the right content."
        </Quote>
      </Section>

      <Section id="ai-tutors" title="AI tutors are only the beginning">
        <P>
          The most obvious use of AI in education is the tutor. You get stuck, you ask a question, the AI explains. Useful — but a good tutor goes much further than a definition on demand.
        </P>
        <P>
          Instead of simply answering "What is recursion?", a capable tutor can recognise that you're struggling with recursive problem-solving because you never fully understood the call stack. That changes everything about the response. Rather than another definition, it explains the missing piece, gives you a small example, asks you a question, and checks whether it actually landed.
        </P>
        <Callout>
          The best AI tutor isn't the one that gives the longest answer. It's the one that knows what you need next.
        </Callout>
      </Section>

      <Section id="practice-not-explanation" title="The real test is practice, not explanation">
        <P>
          There's a wide gap between understanding an explanation and being able to use it. You can watch ten videos on binary search and still fumble the implementation. You can read about APIs and still stall when it's time to build one. You can memorise system-design vocabulary and freeze the moment someone asks you to design a real system.
        </P>
        <P>
          Learning becomes real when knowledge turns into action. That's why the future of AI-powered education needs more than a chat box. It needs practice. It needs feedback. It needs evaluation. And, maybe most importantly, it needs somewhere safe to fail.
        </P>
      </Section>

      <Section id="coding-example" title="Coding is the perfect example">
        <P>
          Take programming. A learner reads about arrays, then solves a few problems. The system notices they keep making the same off-by-one indexing mistake. A traditional course moves on anyway — the lesson is technically "complete." An adaptive system does something different: it recognises the pattern, introduces targeted practice, explains the specific misconception, and then tests again.
        </P>
        <P>
          The path changed because the learner changed. That's the whole idea behind adaptive learning.
        </P>
        <Quote>
          "The curriculum shouldn't control the learner. The learner's progress should shape the curriculum."
        </Quote>
      </Section>

      <Section id="learning-behavior" title="When AI understands how you learn">
        <P>
          Imagine opening your dashboard and seeing something richer than a list of courses. Instead, it tells you where you actually are: the concepts you know, the areas you're improving in, the ones you're struggling with, the skills you've mastered — and, clearly, what you should learn next.
        </P>
        <P>
          That gives you something traditional courses almost never do: awareness of your own learning state. You don't have to guess whether you're ready to move on. You don't have to restart an entire course because a single topic tripped you up. You don't have to lose an evening hunting for the right resource. The environment adapts around you.
        </P>
      </Section>

      <Section id="not-effortless" title="But AI shouldn’t make learning effortless">
        <P>
          Here's the important caveat. Personalised learning doesn't mean removing difficulty — good learning often needs the opposite. If an AI hands you the answer every time you're stuck, you become dependent on it. If it solves every problem for you, you get better at prompting than at programming. If it writes every assignment, you finish faster without getting better.
        </P>
        <P>
          So the question guiding AI in education shouldn't be "How quickly can we hand the learner an answer?" It should be "How effectively can we help the learner build the ability to find the answer themselves?"
        </P>
        <Callout>
          Sometimes the most useful thing an AI tutor can offer is a hint. Sometimes it's a question. Sometimes it's a simpler example. And sometimes it's just: try again.
        </Callout>
      </Section>

      <Section id="ai-plus-human" title="The future is AI + human effort">
        <P>
          There's endless debate about whether AI will replace teachers, courses, universities, or platforms. It's probably the wrong question. The better one is: what becomes possible when human effort is combined with intelligent systems?
        </P>
        <P>
          Teachers get to focus on mentorship and the hard, human parts of guidance. Learners get instant feedback. Platforms adapt to individual needs. Practice gets more realistic, progress gets measurable, and learning shifts from finishing content to actually building capability. AI doesn't remove the effort — it makes the effort more targeted.
        </P>
      </Section>

      <Section id="courses-to-systems" title="From courses to learning systems">
        <P>
          The biggest change might be philosophical. For a long time, education has been organised around <em>courses</em>. You enrol, you follow the curriculum, you complete the modules, the course ends. But real learning doesn't move in a clean line. People forget. They revisit. They discover new interests, change goals, get stuck, race ahead in some areas and crawl in others.
        </P>
        <P>
          A learning system should reflect that reality. Instead of asking "Which course should I take?", the sharper question becomes "What do I need to learn next?" — and that's a far more powerful thing to be able to answer.
        </P>
      </Section>

      <Section id="becoming-personal" title="Learning is becoming personal">
        <P>
          This is the direction we're building toward at Lumintora: learning that begins with the learner, not the syllabus. You start with a goal. The system builds a path around it. As you learn, your performance becomes new information, and the path adapts. You practise through quizzes and real coding problems, you get feedback, and you can ask an AI tutor the moment you're stuck. Streaks and visible progress keep you honest.
        </P>
        <P>
          The aim was never to build another library of courses — there are already more than enough. The aim is a system that keeps answering one question: <em>what should I do next to get better?</em>
        </P>
        <P>
          The first generation of online education made knowledge accessible. The second made it interactive. AI is now making it adaptive — and that could genuinely change how people build skills. The future may not belong to the platform with the most courses. It may belong to the one that understands its learners best.
        </P>
        <Callout>
          Your goal is different. Your starting point is different. Your path should be different too. That's the promise of AI-powered learning.
        </Callout>
        <P style={{ fontStyle: 'italic', color: 'var(--text-2)', marginTop: 32 }}>
          — Bobby Nandigam
        </P>
      </Section>
    </>
  )
}
