import { useState, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════════════
// THEME — Change these to restyle the entire site
// ═══════════════════════════════════════════════════════
const THEME = {
  // Core palette
  bg:           "#06060e",
  bgSurface:    "#0c0c18",
  bgCard:       "#10101f",
  border:       "#1a1a2e",
  // Text
  textPrimary:  "#e8e8f0",
  textSecondary:"#8888a8",
  textMuted:    "#555570",
  // Accent — change this one value to re-skin
  accent:       "#00d4ff",
  accentDim:    "#00d4ff33",
  accentGlow:   "#00d4ff18",
  // Gradient pair
  gradFrom:     "#00d4ff",
  gradTo:       "#7b61ff",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@300;400;500&display=swap');

  :root {
    --bg: ${THEME.bg};
    --bg-surface: ${THEME.bgSurface};
    --bg-card: ${THEME.bgCard};
    --border: ${THEME.border};
    --text-primary: ${THEME.textPrimary};
    --text-secondary: ${THEME.textSecondary};
    --text-muted: ${THEME.textMuted};
    --accent: ${THEME.accent};
    --accent-dim: ${THEME.accentDim};
    --accent-glow: ${THEME.accentGlow};
    --grad-from: ${THEME.gradFrom};
    --grad-to: ${THEME.gradTo};
  }

  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

  html {
    scroll-behavior: smooth;
    scroll-padding-top: 80px;
  }

  body {
    background: var(--bg);
    color: var(--text-primary);
    font-family: 'JetBrains Mono', monospace;
    font-weight: 300;
    line-height: 1.7;
    -webkit-font-smoothing: antialiased;
  }

  ::selection {
    background: var(--accent-dim);
    color: var(--accent);
  }

  /* ── NAV ── */
  .nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    padding: 0 24px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: ${THEME.bg}cc;
    backdrop-filter: blur(20px) saturate(1.4);
    -webkit-backdrop-filter: blur(20px) saturate(1.4);
    border-bottom: 1px solid var(--border);
    transition: all 0.3s ease;
  }

  .nav.scrolled {
    box-shadow: 0 4px 30px ${THEME.bg}80;
  }

  .nav-logo {
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 18px;
    letter-spacing: -0.02em;
    color: var(--text-primary);
    text-decoration: none;
  }

  .nav-logo span {
    background: linear-gradient(135deg, var(--grad-from), var(--grad-to));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .nav-links {
    display: flex;
    gap: 32px;
    list-style: none;
  }

  .nav-links a {
    font-size: 13px;
    font-weight: 400;
    color: var(--text-secondary);
    text-decoration: none;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    position: relative;
    transition: color 0.3s ease;
  }

  .nav-links a::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 0;
    height: 1px;
    background: linear-gradient(90deg, var(--grad-from), var(--grad-to));
    transition: width 0.3s ease;
  }

  .nav-links a:hover,
  .nav-links a.active {
    color: var(--accent);
  }

  .nav-links a:hover::after,
  .nav-links a.active::after {
    width: 100%;
  }

  .mobile-toggle {
    display: none;
    flex-direction: column;
    gap: 5px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
  }

  .mobile-toggle span {
    width: 22px;
    height: 1.5px;
    background: var(--text-secondary);
    transition: all 0.3s ease;
  }

  .mobile-menu {
    display: none;
    position: fixed;
    top: 64px;
    left: 0;
    right: 0;
    background: var(--bg-surface);
    border-bottom: 1px solid var(--border);
    padding: 24px;
    z-index: 99;
  }

  .mobile-menu.open {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .mobile-menu a {
    font-size: 14px;
    font-weight: 400;
    color: var(--text-secondary);
    text-decoration: none;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .mobile-menu a:hover { color: var(--accent); }

  @media (max-width: 640px) {
    .nav-links { display: none; }
    .mobile-toggle { display: flex; }
  }

  /* ── SECTIONS ── */
  section {
    min-height: 100vh;
    padding: 120px 24px 80px;
    max-width: 900px;
    margin: 0 auto;
  }

  /* ── HERO ── */
  .hero {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    position: relative;
  }

  .hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--accent);
    padding: 6px 14px;
    border: 1px solid var(--accent-dim);
    border-radius: 100px;
    background: var(--accent-glow);
    margin-bottom: 32px;
    animation: fadeUp 0.8s ease both;
  }

  .hero-badge::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--accent);
    box-shadow: 0 0 8px var(--accent);
    animation: pulse 2s ease infinite;
  }

  .hero h1 {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: clamp(40px, 8vw, 72px);
    line-height: 1.05;
    letter-spacing: -0.03em;
    margin-bottom: 24px;
    animation: fadeUp 0.8s ease 0.1s both;
  }

  .hero h1 .gradient {
    background: linear-gradient(135deg, var(--grad-from), var(--grad-to));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .hero-sub {
    font-size: 16px;
    color: var(--text-secondary);
    max-width: 520px;
    margin-bottom: 40px;
    animation: fadeUp 0.8s ease 0.2s both;
  }

  .hero-cta {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    animation: fadeUp 0.8s ease 0.3s both;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.04em;
    padding: 12px 24px;
    border-radius: 8px;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;
  }

  .btn-primary {
    background: linear-gradient(135deg, var(--grad-from), var(--grad-to));
    color: ${THEME.bg};
    box-shadow: 0 4px 20px var(--accent-dim);
  }

  .btn-primary:hover {
    box-shadow: 0 4px 30px ${THEME.accent}44;
    transform: translateY(-1px);
  }

  .btn-ghost {
    background: transparent;
    color: var(--text-secondary);
    border: 1px solid var(--border);
  }

  .btn-ghost:hover {
    border-color: var(--accent);
    color: var(--accent);
  }

  /* ── GLOW ORB ── */
  .hero-glow {
    position: absolute;
    top: 20%;
    right: -10%;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, var(--accent-glow) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
    filter: blur(60px);
    animation: drift 8s ease-in-out infinite;
  }

  /* ── ABOUT ── */
  .about-content {
    display: grid;
    gap: 48px;
  }

  .section-label {
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 16px;
  }

  .section-title {
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: clamp(28px, 5vw, 40px);
    letter-spacing: -0.02em;
    margin-bottom: 24px;
    line-height: 1.15;
  }

  .about-text {
    color: var(--text-secondary);
    font-size: 15px;
    max-width: 600px;
  }

  .about-text p + p {
    margin-top: 16px;
  }

  .skills-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
    margin-top: 32px;
  }

  .skill-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 18px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 10px;
    font-size: 13px;
    color: var(--text-secondary);
    transition: all 0.3s ease;
  }

  .skill-item:hover {
    border-color: var(--accent-dim);
    color: var(--text-primary);
    box-shadow: 0 0 20px var(--accent-glow);
  }

  .skill-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--grad-from), var(--grad-to));
    flex-shrink: 0;
  }

  /* ── PROJECTS ── */
  .projects-grid {
    display: grid;
    gap: 24px;
    margin-top: 8px;
  }

  .project-card {
    position: relative;
    padding: 32px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 14px;
    transition: all 0.4s ease;
    overflow: hidden;
  }

  .project-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--accent-dim), transparent);
    opacity: 0;
    transition: opacity 0.4s ease;
  }

  .project-card:hover {
    border-color: var(--accent-dim);
    transform: translateY(-2px);
    box-shadow: 0 8px 40px ${THEME.bg}80, 0 0 30px var(--accent-glow);
  }

  .project-card:hover::before {
    opacity: 1;
  }

  .project-number {
    font-size: 11px;
    color: var(--text-muted);
    letter-spacing: 0.1em;
    margin-bottom: 16px;
  }

  .project-title {
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 22px;
    letter-spacing: -0.01em;
    margin-bottom: 10px;
  }

  .project-desc {
    font-size: 14px;
    color: var(--text-secondary);
    margin-bottom: 20px;
    line-height: 1.7;
  }

  .project-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .tag {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.06em;
    padding: 4px 12px;
    border-radius: 100px;
    background: var(--accent-glow);
    color: var(--accent);
    border: 1px solid ${THEME.accent}15;
  }

  /* ── FOOTER ── */
  .footer {
    padding: 48px 24px;
    text-align: center;
    border-top: 1px solid var(--border);
    margin-top: 80px;
  }

  .footer-links {
    display: flex;
    justify-content: center;
    gap: 32px;
    margin-bottom: 24px;
    flex-wrap: wrap;
  }

  .footer-links a {
    font-size: 13px;
    color: var(--text-secondary);
    text-decoration: none;
    transition: color 0.3s ease;
  }

  .footer-links a:hover { color: var(--accent); }

  .footer-copy {
    font-size: 12px;
    color: var(--text-muted);
  }

  /* ── ANIMATIONS ── */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  @keyframes drift {
    0%, 100% { transform: translate(0, 0); }
    50% { transform: translate(-20px, 20px); }
  }

  .fade-in {
    opacity: 0;
    transform: translateY(24px);
    transition: opacity 0.6s ease, transform 0.6s ease;
  }

  .fade-in.visible {
    opacity: 1;
    transform: translateY(0);
  }

  /* ── SKIP LINK (a11y) ── */
  .skip-link {
    position: absolute;
    top: -100%;
    left: 16px;
    padding: 8px 16px;
    background: var(--accent);
    color: var(--bg);
    border-radius: 4px;
    font-size: 13px;
    z-index: 200;
    text-decoration: none;
  }

  .skip-link:focus {
    top: 8px;
  }

  /* ── FOCUS STYLES ── */
  *:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
`;

const skills = [
  "React / Next.js", "TypeScript", "CSS / Tailwind",
  "Design Systems", "Accessibility", "Performance",
  "GraphQL", "Testing / CI", "Animation / Motion",
];

const projects = [
  {
    title: "Design System Framework",
    desc: "A scalable component library built with React, TypeScript, and Storybook. Tokens-first architecture with full theme support and WCAG 2.1 AA compliance.",
    tags: ["React", "TypeScript", "Storybook", "a11y"],
  },
  {
    title: "Real-Time Dashboard",
    desc: "High-performance data visualization platform rendering 10k+ data points with WebSocket streams, virtualized lists, and sub-16ms render cycles.",
    tags: ["Next.js", "D3", "WebSocket", "Performance"],
  },
  {
    title: "E-Commerce Platform Rebuild",
    desc: "Led the frontend rebuild of a major e-commerce platform, achieving a 40% improvement in Core Web Vitals and a 25% lift in conversion rate.",
    tags: ["React", "GraphQL", "Tailwind", "Testing"],
  },
];

export default function Portfolio() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const observerRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Intersection observer for fade-in and active section
  useEffect(() => {
    const sections = document.querySelectorAll("section[id]");
    const fadeEls = document.querySelectorAll(".fade-in");

    const sectionObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveSection(e.target.id);
        });
      },
      { threshold: 0.3 }
    );

    const fadeObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        });
      },
      { threshold: 0.1 }
    );

    sections.forEach((s) => sectionObs.observe(s));
    fadeEls.forEach((el) => fadeObs.observe(el));

    return () => {
      sectionObs.disconnect();
      fadeObs.disconnect();
    };
  }, []);

  const navClick = (id) => {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <style>{css}</style>

      {/* Skip link for keyboard users */}
      <a href="#main" className="skip-link">Skip to main content</a>

      {/* Navigation */}
      <nav className={`nav ${scrolled ? "scrolled" : ""}`} role="navigation" aria-label="Main navigation">
        <a href="#home" className="nav-logo" onClick={(e) => { e.preventDefault(); navClick("home"); }}>
          K<span>.</span>
        </a>

        <ul className="nav-links">
          {["home", "about", "projects"].map((id) => (
            <li key={id}>
              <a
                href={`#${id}`}
                className={activeSection === id ? "active" : ""}
                onClick={(e) => { e.preventDefault(); navClick(id); }}
              >
                {id}
              </a>
            </li>
          ))}
        </ul>

        <button
          className="mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileOpen}
        >
          <span /><span /><span />
        </button>
      </nav>

      {/* Mobile menu */}
      <div className={`mobile-menu ${mobileOpen ? "open" : ""}`} role="menu">
        {["home", "about", "projects"].map((id) => (
          <a key={id} href={`#${id}`} role="menuitem" onClick={(e) => { e.preventDefault(); navClick(id); }}>
            {id}
          </a>
        ))}
      </div>

      <main id="main">
        {/* ── HERO ── */}
        <section id="home" className="hero" aria-label="Introduction">
          <div className="hero-glow" aria-hidden="true" />
          <div className="hero-badge" role="status">Available for work</div>
          <h1>
            Kendall<br />
            <span className="gradient">Adkins</span>
          </h1>
          <p className="hero-sub">
            Senior Front End Engineer crafting performant, accessible, and visually refined interfaces for the modern web.
          </p>
          <div className="hero-cta">
            <a href="#projects" className="btn btn-primary" onClick={(e) => { e.preventDefault(); navClick("projects"); }}>
              View Projects
            </a>
            <a href="#about" className="btn btn-ghost" onClick={(e) => { e.preventDefault(); navClick("about"); }}>
              About Me
            </a>
          </div>
        </section>

        {/* ── ABOUT ── */}
        <section id="about" aria-label="About Kendall Adkins">
          <div className="about-content">
            <div className="fade-in">
              <p className="section-label">About</p>
              <h2 className="section-title">Building the interface layer between people and technology.</h2>
              <div className="about-text">
                <p>
                  I'm a Senior Front End Engineer with a deep focus on design systems, performance optimization, and accessibility. I believe the best interfaces are the ones you don't notice — they just work, beautifully.
                </p>
                <p>
                  I've shipped products used by millions, led frontend architecture decisions at scale, and mentored engineers on building UIs that are fast, inclusive, and maintainable. Currently exploring the intersection of motion design and developer experience.
                </p>
              </div>
            </div>
            <div className="fade-in">
              <p className="section-label">Expertise</p>
              <div className="skills-grid" role="list" aria-label="Technical skills">
                {skills.map((s) => (
                  <div key={s} className="skill-item" role="listitem">
                    <span className="skill-dot" aria-hidden="true" />
                    {s}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── PROJECTS ── */}
        <section id="projects" aria-label="Featured projects">
          <div className="fade-in">
            <p className="section-label">Projects</p>
            <h2 className="section-title">Selected work.</h2>
          </div>
          <div className="projects-grid">
            {projects.map((p, i) => (
              <article key={i} className="project-card fade-in" tabIndex="0" aria-label={p.title}>
                <div className="project-number">0{i + 1}</div>
                <h3 className="project-title">{p.title}</h3>
                <p className="project-desc">{p.desc}</p>
                <div className="project-tags" aria-label="Technologies used">
                  {p.tags.map((t) => (
                    <span key={t} className="tag">{t}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="footer" role="contentinfo">
        <nav className="footer-links" aria-label="Social links">
          <a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href="https://reddit.com" target="_blank" rel="noopener noreferrer">Reddit</a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href="mailto:hello@kendalladkins.com">Email</a>
        </nav>
      </footer>
    </>
  );
}
