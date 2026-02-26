const CURRENT_YEAR = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="footer-wrapper">
      <nav aria-label="Social links" className="footer-links-nav">
        <a href="https://github.com/kendalladkins" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        <a href="https://linkedin.com/in/kendalladkins" target="_blank" rel="noopener noreferrer">
          LinkedIn
        </a>
        <a href="mailto:hello@kendalladkins.com">Email</a>
      </nav>
      <p className="footer-copy">© {CURRENT_YEAR} Kendall Adkins. Built with care.</p>
    </footer>
  );
}
