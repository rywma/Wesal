
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <h2>Wesal.</h2>
          <p>More than a game. A way to connect.</p>
          <span>Made for people who love to play.</span>
        </div>

        <div className="footer-message">
          <h3>Play. Connect. Repeat.</h3>
          <p>
            Bringing people together through sports,
            one match at a time.
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Wesal. All rights reserved.</p>
        <span>Built for the love of the game.</span>
      </div>
    </footer>
  );
}

export default Footer;
