function PublicFooter() {
  return (
    <footer className="public-footer">

      <div className="footer-container">

        {/* TOP FOOTER */}
        <div className="footer-main">

          {/* BRAND */}
          <div className="footer-brand">

            <a href="/" className="footer-logo">
              <span className="footer-logo-mark">
                +
              </span>

              <span>
                MediCare
              </span>
            </a>

            <p>
              Quality healthcare, trusted professionals,
              and compassionate care for every patient.
            </p>

            <div className="footer-status">
              <span></span>
              Caring for your health
            </div>

          </div>


          {/* QUICK LINKS */}
          <div className="footer-column">

            <h3>
              Explore
            </h3>

            <a href="/">
              Home
            </a>

            <a href="#services">
              Services
            </a>

            <a href="#about">
              About Us
            </a>

            <a href="#doctors">
              Our Doctors
            </a>

          </div>


          {/* PATIENT */}
          <div className="footer-column">

            <h3>
              Patient Care
            </h3>

            <a href="#appointment">
              Book Appointment
            </a>

            <a href="#news">
              News & Events
            </a>

            <a href="#contact">
              Contact Us
            </a>

            <a href="/login">
              Clinic Login
            </a>

          </div>


          {/* CONTACT */}
          <div className="footer-column footer-contact">

            <h3>
              Contact
            </h3>

            <p>
              Dar es Salaam,
              Tanzania
            </p>

            <a href="tel:+255700000000">
              +255 700 000 000
            </a>

            <a href="mailto:info@hospital.com">
              info@hospital.com
            </a>

          </div>

        </div>


        {/* DIVIDER */}
        <div className="footer-divider"></div>


        {/* BOTTOM FOOTER */}
        <div className="footer-bottom">

          <p>
            © 2026 MediCare Hospital.
            All rights reserved.
          </p>

          <div className="footer-bottom-links">

            <a href="#">
              Privacy
            </a>

            <a href="#">
              Terms
            </a>

            <a href="#">
              Accessibility
            </a>

          </div>


          <div className="footer-socials">

            <a
              href="#"
              aria-label="Facebook"
            >
              f
            </a>

            <a
              href="#"
              aria-label="Instagram"
            >
              ◎
            </a>

            <a
              href="#"
              aria-label="Twitter"
            >
              𝕏
            </a>

          </div>

        </div>

      </div>

    </footer>
  );
}

export default PublicFooter;