function PublicAbout() {
  return (
    <section className="public-about" id="about">

      <div className="public-about-container">

        {/* LEFT SIDE */}
        <div className="about-content">

          <span className="section-eyebrow">
            ABOUT OUR HOSPITAL
          </span>

          <h2>
            Healthcare with
            <br />
            <span>a human touch.</span>
          </h2>

          <p>
            We believe healthcare should be more than treatment.
            It should be an experience built on trust, compassion,
            professionalism, and respect for every patient.
          </p>

          <p>
            Our healthcare team combines modern medical practices
            with personalized attention to help every patient
            receive care with confidence.
          </p>

          <div className="about-features">

            <div className="about-feature">
              <span>✓</span>
              <div>
                <strong>Patient-centered care</strong>
                <small>
                  Your needs always come first.
                </small>
              </div>
            </div>

            <div className="about-feature">
              <span>✓</span>
              <div>
                <strong>Modern healthcare</strong>
                <small>
                  Technology supporting better care.
                </small>
              </div>
            </div>

            <div className="about-feature">
              <span>✓</span>
              <div>
                <strong>Experienced professionals</strong>
                <small>
                  Dedicated people you can trust.
                </small>
              </div>
            </div>

          </div>

          <a
            href="#contact"
            className="about-button"
          >
            Learn About Us
            <span>→</span>
          </a>

        </div>


        {/* RIGHT SIDE */}
        <div className="about-visual">

          <div className="about-main-card">

            <div className="about-medical-mark">
              +
            </div>

            <span>
              PATIENT
            </span>

            <strong>
              FIRST
            </strong>

            <p>
              Compassionate care.
              <br />
              Modern medicine.
            </p>

          </div>


          <div className="about-support-card">

            <strong>24/7</strong>

            <span>
              Healthcare
              <br />
              Support
            </span>

          </div>


          <div className="about-years-card">

            <span>CARE</span>

            <strong>
              WITH
              <br />
              TRUST
            </strong>

          </div>

        </div>

      </div>

    </section>
  );
}

export default PublicAbout;