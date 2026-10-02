function PublicContact() {
  return (
    <section
      className="public-contact"
      id="contact"
    >
      <div className="public-contact-container">

        {/* HEADER */}
        <div className="contact-heading">

          <div>
            <span className="section-eyebrow">
              GET IN TOUCH
            </span>

            <h2>
              We're here when
              <br />
              <span>you need us.</span>
            </h2>
          </div>

          <p>
            Have a question, need directions, or want to
            speak with our team? Reach out through any of
            the channels below.
          </p>

        </div>


        {/* CONTACT CONTENT */}
        <div className="contact-layout">

          {/* INFORMATION */}
          <div className="contact-information">

            <div className="contact-item">

              <div className="contact-icon">
                +
              </div>

              <div>
                <span>OUR LOCATION</span>

                <strong>
                  Main Hospital Campus
                </strong>

                <p>
                  Dar es Salaam, Tanzania
                </p>
              </div>

            </div>


            <div className="contact-item">

              <div className="contact-icon">
                ☎
              </div>

              <div>
                <span>PHONE</span>

                <strong>
                  +255 700 000 000
                </strong>

                <p>
                  Available during working hours
                </p>
              </div>

            </div>


            <div className="contact-item">

              <div className="contact-icon">
                @
              </div>

              <div>
                <span>EMAIL</span>

                <strong>
                  info@hospital.com
                </strong>

                <p>
                  We usually respond within one business day
                </p>
              </div>

            </div>

          </div>


          {/* LOCATION VISUAL */}
          <div className="contact-map">

            <div className="map-grid"></div>

            <div className="map-route route-one"></div>
            <div className="map-route route-two"></div>

            <div className="map-pin">

              <div className="pin-circle">
                +
              </div>

              <span>
                OUR HOSPITAL
              </span>

            </div>

            <div className="map-label map-label-one">
              Main Road
            </div>

            <div className="map-label map-label-two">
              City Centre
            </div>

            <div className="map-label map-label-three">
              Hospital Campus
            </div>

          </div>

        </div>


        {/* WORKING HOURS */}
        <div className="working-hours">

          <div className="hours-title">
            <span>
              WORKING HOURS
            </span>

            <strong>
              We're here to care for you.
            </strong>
          </div>


          <div className="hours-item">
            <span>MON — FRI</span>
            <strong>08:00 — 18:00</strong>
          </div>


          <div className="hours-item">
            <span>SATURDAY</span>
            <strong>09:00 — 15:00</strong>
          </div>


          <div className="hours-item emergency-hours">
            <span>EMERGENCY</span>
            <strong>24 / 7</strong>
          </div>


          <div className="open-status">
            <span></span>
            Open for emergency care
          </div>

        </div>

      </div>
    </section>
  );
}

export default PublicContact;