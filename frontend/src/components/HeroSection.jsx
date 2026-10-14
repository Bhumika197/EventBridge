import { useAuth } from "../context/AuthContext";
export const HeroSection = ({ onExploreClick, onLoginClick }) => {
  const { user } = useAuth();
  return <section className="hero-section"><h1 className="hero-title">Where campus life happens</h1><p className="hero-subtitle">
        Discover hackathons, workshops, cultural fests, and athletic tournaments across collegiate campuses — with verified institutional RSVPs and automated waitlists.
      </p><div style={{ display: "flex", justifyContent: "center", gap: "0.75rem", flexWrap: "wrap" }}><button
    className="btn-primary"
    onClick={onExploreClick}
    style={{ padding: "0.65rem 1.4rem", fontSize: "0.92rem" }}
  >
          Explore All Events
        </button>{!user && <button
    className="btn-secondary"
    onClick={onLoginClick}
    style={{ padding: "0.65rem 1.4rem", fontSize: "0.92rem" }}
  >
            Sign In / Demo Accounts
          </button>}</div></section>;
};
