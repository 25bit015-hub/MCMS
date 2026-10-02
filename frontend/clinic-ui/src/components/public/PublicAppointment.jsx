function PublicAppointment() {
  return (
    <section
      className="public-appointment"
      id="appointment"
    >
      <div className="appointment-container">

        {/* LEFT CONTENT */}
        <div className="appointment-content">

          <span className="section-eyebrow">
            YOUR HEALTH MATTERS
          </span>

          <h2>
            Your health deserves
            <br />
            <span>the right care.</span>
          </h2>

          <p>
            Take the first step toward better healthcare.
            Schedule an appointment with our dedicated
            medical team and receive care designed around you.
          </p>

          <div className="appointment-actions">

            <a
              href="/login"
              className="appointment-primary-button"
            >
              Book an Appointment
              <span>→</span>
            </a>

            <a
              href="tel:+255000000000"
              className="appointment-secondary-button"
            >
              Call Us
            </a>

          </div>

        </div>


        {/* RIGHT VISUAL */}
        <div className="appointment-visual">

          <div className="appointment-circle">

            <div className="appointment-plus">
              +
            </div>

            <span>
              PATIENT
            </span>

            <strong>
              CARE
            </strong>

          </div>


          <div className="appointment-floating-card">

            <div className="appointment-card-icon">
              ✓
            </div>

            <div>
              <strong>
                24/7
              </strong>

              <span>
                Patient Support
              </span>
            </div>

          </div>


          <div className="appointment-small-card">

            <span>
              EASY
            </span>

            <strong>
              BOOKING
            </strong>

          </div>

        </div>

      </div>
    </section>
  );
}

export default PublicAppointment;