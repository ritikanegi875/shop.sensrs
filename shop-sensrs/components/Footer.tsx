import React from 'react';

export default function Footer() {
  return (
    <footer className="martup-footer">
      <div className="martup-container">
        
        {/* TOP SECTION: 4 COLUMNS */}
        <div className="footer-grid">
          
          {/* Column 1: Brand & Social */}
          <div className="footer-col brand-col">
            <h2 className="footer-logo">
              Shop.SEnSRS
            </h2>
            <p className="footer-desc">
              Your one-stop destination for everything you need. Quality products, unbeatable prices, and exceptional service.
            </p>
            <div className="social-links">
              {/* TODO: Connect social links later */}
              <a href="https://www.facebook.com/coesensrs/" className="social-icon" aria-label="Facebook">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"></path></svg>
              </a>
              <a href="https://www.instagram.com/coesensrs/" className="social-icon" aria-label="Instagram">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="https://www.youtube.com/@CoE.SEnSRS" className="social-icon" aria-label="YouTube">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33 2.78 2.78 0 001.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.33 29 29 0 00-.46-5.33zM9.75 15.02V8.48l6.5 3.27-6.5 3.27z"></path></svg>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="footer-col">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-list">
              {/* TODO: Change to Next.js <Link> later */}
              <li><a href="#">About Us</a></li>
              <li><a href="#">Contact Us</a></li>
              <li><a href="#">FAQ</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Sitemap</a></li>
            </ul>
          </div>

          {/* Column 3: Customer Service */}
          <div className="footer-col">
            <h4 className="footer-heading">Customer Service</h4>
            <ul className="footer-list">
              {/* TODO: Change to Next.js <Link> later */}
              <li><a href="#">My Account</a></li>
              <li><a href="#">Order History</a></li>
              <li><a href="#">Track Order</a></li>
              <li><a href="#">Returns & Exchanges</a></li>
              <li><a href="#">Shipping Info</a></li>
              <li><a href="#">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Column 4: Contact Us */}
          <div className="footer-col">
            <h4 className="footer-heading">Contact Us</h4>
            <ul className="footer-contact-list">
              <li>
                <span className="contact-icon text-accent">
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                </span>
                <span>Indian Institute of Technology, Ropar<br/>Punjab, India</span>
              </li>
              <li>
                <span className="contact-icon text-accent">
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"></path></svg>
                </span>
                <span>+01881-232632</span>
              </li>
              <li>
                <span className="contact-icon text-accent">
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </span>
                <span>coe@sensrs.com</span>
              </li>
              <li>
                <span className="contact-icon text-accent">
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                </span>
                <span>Mon-Sat: 9am - 6pm</span>
              </li>
            </ul>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="footer-divider"></div>

        {/* BOTTOM SECTION */}
        <div className="footer-bottom">
          <p className="copyright">
            © 2026 Shop.SEnSRS. All rights reserved. Built with ❤️ for Shop.SEnSRS.
          </p>
          
          <div className="payment-badges">
            <span className="badge">VISA</span>
            <span className="badge">MC</span>
            <span className="badge">PayPal</span>
            <span className="badge">Apple Pay</span>
            <span className="badge">Stripe</span>
          </div>
        </div>

      </div>

    </footer>
  );
}