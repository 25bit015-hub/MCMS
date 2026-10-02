function PublicHero() {
  return (
    <section className="public-hero">

      <div className="public-hero-container">

        {/* LEFT CONTENT */}
        <div className="public-hero-content">

          <div className="hero-badge">
            <span className="hero-badge-dot"></span>
            Trusted Healthcare • Available Today
          </div>

          <h1>
            Your health.
            <br />
            <span>Our priority.</span>
          </h1>

          <p>
            Experience modern healthcare built around you.
            Our dedicated medical team combines compassionate
            care, advanced technology, and trusted expertise
            to help you live healthier.
          </p>

          <div className="hero-actions">

            <a
              href="#appointment"
              className="hero-primary-button"
            >
              Book an Appointment
              <span>→</span>
            </a>

            <a
              href="#services"
              className="hero-secondary-button"
            >
              Explore Services
            </a>

          </div>

          <div className="hero-trust">

            <div className="hero-trust-item">
              <span>✓</span>
              Experienced doctors
            </div>

            <div className="hero-trust-item">
              <span>✓</span>
              Modern facilities
            </div>

          </div>

        </div>


        {/* RIGHT VISUAL */}
        <div className="public-hero-visual">

          <div className="hero-image-card">

            <div className="hero-image-placeholder">

              <div className="hero-medical-symbol">
                +
              </div>

              <span>
                QUALITY
                <br />
                HEALTHCARE
              </span>

            </div>

          </div>


          {/* Floating Card */}
          <div className="hero-floating-card">

            <div className="hero-floating-icon">
              ✓
            </div>

            <div>
              <strong>Patient First</strong>

              <span>
                Care you can trust
              </span>
            </div>

          </div>


          {/* Experience Card */}
          <div className="hero-stat-card">

            <strong>24/7</strong>

            <span>
              Healthcare
              <br />
              Support
            </span>

          </div>

        </div>

      </div>

    </section>
  );
}

export default PublicHero;