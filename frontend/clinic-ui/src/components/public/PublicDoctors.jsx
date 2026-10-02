const doctors = [
  {
    name: "Dr. Sarah Williams",
    specialty: "Senior Physician",
    initials: "SW",
    description: "General medicine and preventive healthcare.",
  },
  {
    name: "Dr. Daniel Carter",
    specialty: "Cardiology",
    initials: "DC",
    description: "Heart health, diagnosis and cardiac care.",
  },
  {
    name: "Dr. Emily Johnson",
    specialty: "Pediatrics",
    initials: "EJ",
    description: "Compassionate healthcare for children.",
  },
];

function PublicDoctors() {
  return (
    <section className="public-doctors" id="doctors">

      <div className="public-doctors-container">

        {/* Heading */}
        <div className="doctors-heading">

          <div>
            <span className="section-eyebrow">
              OUR MEDICAL TEAM
            </span>

            <h2>
              Meet the people
              <br />
              <span>behind your care.</span>
            </h2>
          </div>

          <p>
            Our healthcare professionals bring experience,
            compassion, and dedication to every patient we serve.
          </p>

        </div>


        {/* Doctors */}
        <div className="doctors-grid">

          {doctors.map((doctor) => (
            <article
              className="doctor-card"
              key={doctor.name}
            >

              <div className="doctor-photo">

                <div className="doctor-avatar">
                  {doctor.initials}
                </div>

                <div className="doctor-status">
                  <span></span>
                  Available
                </div>

              </div>


              <div className="doctor-info">

                <h3>
                  {doctor.name}
                </h3>

                <span className="doctor-specialty">
                  {doctor.specialty}
                </span>

                <p>
                  {doctor.description}
                </p>

                <button className="doctor-profile-button">
                  View Profile
                  <span>→</span>
                </button>

              </div>

            </article>
          ))}

        </div>

      </div>

    </section>
  );
}

export default PublicDoctors;