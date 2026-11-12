import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
    return (
        <footer className="roam-footer">

            <div className="footer-main">

                <div className="footer-column">
    <h3>Support</h3>
    <span>Help Center</span>
    <span>Safety Information</span>
    <span>Cancellation Options</span>
    <span>Report a Concern</span>
</div>

<div className="footer-column">
    <h3>Hosting</h3>
    <Link to="/listings/new">RoamNest your home</Link>
    <span>Hosting Resources</span>
    <span>Community Forum</span>
    <span>Hosting Responsibly</span>
</div>

<div className="footer-column">
    <h3>RoamNest</h3>
    <span>About Us</span>
    <span>Newsroom</span>
    <span>Careers</span>
    <span>Contact Us</span>
</div>

            </div>

            <div className="footer-bottom">

                <div className="footer-legal">
    <span>© 2026 RoamNest, Inc.</span>
    <span>·</span>
    <span>Privacy</span>
    <span>·</span>
    <span>Terms</span>
    <span>·</span>
    <span>Sitemap</span>
</div>

                <div className="footer-right">

                    <span className="footer-language">
                        🌐 English (IN)
                    </span>

                    <span className="footer-currency">
                        ₹ INR
                    </span>

                    <div className="footer-social">

    <a
        href="https://www.instagram.com/"
        target="_blank"
        rel="noreferrer"
        aria-label="Visit Instagram"
    >
        <i className="fa-brands fa-instagram"></i>
    </a>

    <a
        href="https://www.facebook.com/"
        target="_blank"
        rel="noreferrer"
        aria-label="Visit Facebook"
    >
        <i className="fa-brands fa-facebook"></i>
    </a>

    <a
        href="https://x.com/"
        target="_blank"
        rel="noreferrer"
        aria-label="Visit X"
    >
        <i className="fa-brands fa-x-twitter"></i>
    </a>

</div>

                </div>

            </div>

        </footer>
    );
}

export default Footer;