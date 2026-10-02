import { Link, NavLink } from "react-router-dom";

function PublicHeader() {
  return (
    <header className="public-header">

      <div className="public-header-container">

        {/* =========================
            LOGO
        ========================== */}
        <Link to="/" className="public-logo">

          <div className="public-logo-icon">
            +
          </div>

          <div className="public-logo-text">
            MEDI<span>CARE</span>
          </div>

        </Link>


        {/* =========================
            DESKTOP NAVIGATION
        ========================== */}
        <nav className="public-navigation">

          <NavLink to="/" end>
            Home
          </NavLink>

          <a href="#services">
            Services
          </a>

          <a href="#about">
            About
          </a>

          <a href="#doctors">
            Doctors
          </a>

          <a href="#news">
            News
          </a>

          <a href="#contact">
            Contact
          </a>

        </nav>


        {/* =========================
            HEADER ACTIONS
        ========================== */}
        <div className="public-header-actions">

          <a
            href="#appointment"
            className="public-appointment-button"
          >
            Book Appointment
          </a>

          <Link
            to="/login"
            className="public-login-button"
          >
            Clinic Login
            <span>↗</span>
          </Link>

        </div>


        {/* =========================
            MOBILE MENU BUTTON
            Tutaitumia STEP 18.2
        ========================== */}
        <button
          className="mobile-menu-button"
          type="button"
          aria-label="Open navigation menu"
        >
          ☰
        </button>

      </div>

    </header>
  );
}

export default PublicHeader;