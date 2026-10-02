const newsItems = [
  {
    category: "HEALTH CAMP",
    date: "23 SEP 2026",
    title: "Community Health Day",
    description:
      "Join our community health day for basic health checks, education, and wellness guidance.",
  },
  {
    category: "HOSPITAL UPDATE",
    date: "18 SEP 2026",
    title: "New Patient Services",
    description:
      "We are expanding our patient services to make healthcare easier and more convenient.",
  },
];

function PublicNews() {
  return (
    <section className="public-news" id="news">

      <div className="public-news-container">

        {/* Heading */}
        <div className="news-heading">

          <div>
            <span className="section-eyebrow">
              LATEST FROM OUR HOSPITAL
            </span>

            <h2>
              News, events
              <br />
              <span>& updates.</span>
            </h2>
          </div>

          <p>
            Stay informed about hospital activities, health
            programs, community events, and the latest updates
            from our team.
          </p>

        </div>


        {/* News Layout */}
        <div className="news-layout">

          {/* Featured News */}
          <article className="featured-news">

            <div className="featured-news-visual">

              <span className="featured-label">
                FEATURED
              </span>

              <div className="featured-symbol">
                +
              </div>

              <span className="featured-health-text">
                COMMUNITY
                <br />
                HEALTH
              </span>

            </div>

            <div className="featured-news-content">

              <div className="news-meta">
                <span>
                  COMMUNITY HEALTH
                </span>

                <span>
                  23 SEP 2026
                </span>
              </div>

              <h3>
                Free health screening
                for our community
              </h3>

              <p>
                Our healthcare team is bringing essential
                health screening and wellness education closer
                to the community.
              </p>

              <button className="news-read-button">
                Read story
                <span>→</span>
              </button>

            </div>

          </article>


          {/* Smaller News */}
          <div className="news-list">

            {newsItems.map((item) => (
              <article
                className="news-list-item"
                key={item.title}
              >

                <div className="news-list-visual">
                  <span>+</span>
                </div>

                <div className="news-list-content">

                  <div className="news-meta">

                    <span>
                      {item.category}
                    </span>

                    <span>
                      {item.date}
                    </span>

                  </div>

                  <h3>
                    {item.title}
                  </h3>

                  <p>
                    {item.description}
                  </p>

                  <button className="news-small-button">
                    Read more
                    <span>↗</span>
                  </button>

                </div>

              </article>
            ))}

          </div>

        </div>

      </div>

    </section>
  );
}

export default PublicNews;