import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p className="footer-logo">Wesal</p>
        <p>More than a game. A way to connect.</p>
        <Link to="/list-your-venue" className="footer-link">Own a venue? List it on Wesal</Link>
        <p className="footer-copy">© {new Date().getFullYear()} Wesal</p>
      </div>
    </footer>
  );
}

export default Footer;
