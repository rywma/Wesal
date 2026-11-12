function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p className="footer-logo">Wesal</p>
        <p>More than a game. A way to connect.</p>
        <p className="footer-copy">© {new Date().getFullYear()} Wesal</p>
      </div>
    </footer>
  );
}

export default Footer;
