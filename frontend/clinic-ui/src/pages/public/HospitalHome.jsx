import PublicHeader from "../../components/public/PublicHeader";
import PublicHero from "../../components/public/PublicHero";
import PublicServices from "../../components/public/PublicServices";
import PublicAbout from "../../components/public/PublicAbout";
import PublicDoctors from "../../components/public/PublicDoctors";
import PublicNews from "../../components/public/PublicNews";
import PublicAppointment from "../../components/public/PublicAppointment";
import PublicContact from "../../components/public/PublicContact";
import PublicFooter from "../../components/public/PublicFooter";

function HospitalHome() {
  return (
    <div className="hospital-website">

      <PublicHeader />

      <main className="public-main">

        <PublicHero />

        <PublicServices />

        <PublicAbout />

        <PublicDoctors />

        <PublicNews />

        <PublicAppointment />

        <PublicContact />

        <PublicFooter />

      </main>

    </div>
  );
}

export default HospitalHome;