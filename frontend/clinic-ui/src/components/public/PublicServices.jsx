const services = [
  {
    number: "01",
    title: "Medical Care",
    description:
      "Personalized medical attention from experienced healthcare professionals.",
    label: "Explore care",
  },
  {
    number: "02",
    title: "Diagnostics",
    description:
      "Reliable laboratory and diagnostic services supported by modern technology.",
    label: "View diagnostics",
  },
  {
    number: "03",
    title: "Pharmacy Care",
    description:
      "Safe and convenient access to prescribed medicines and professional guidance.",
    label: "Learn more",
  },
  {
    number: "04",
    title: "Family Health",
    description:
      "Thoughtful healthcare services designed to support individuals and families.",
    label: "Discover care",
  },
];

function PublicServices() {
  return (
    <section className="public-services" id="services">

      <div className="public-services-container">

        <div className="services-heading">

          <div>
            <span className="section-eyebrow">
              OUR SERVICES
            </span>

            <h2>
              Care designed
              <br />
              <span>around you.</span>
            </h2>
          </div>

          <p>
            From everyday medical care to diagnostics and
            pharmacy support, our services are designed to
            make your healthcare journey simple and reliable.
          </p>

        </div>


        <div className="services-grid">

          {services.map((service) => (
            <article
              className="service-card"
              key={service.number}
            >

              <div className="service-top">

                <span className="service-number">
                  {service.number}
                </span>

                <span className="service-arrow">
                  ↗
                </span>

              </div>

              <div className="service-content">

                <h3>
                  {service.title}
                </h3>

                <p>
                  {service.description}
                </p>

              </div>

              <div className="service-link">
                {service.label}
                <span>→</span>
              </div>

            </article>
          ))}

        </div>

      </div>

    </section>
  );
}

export default PublicServices;