import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "../../styles/NavBar.css";

export default function NavBar() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const [showMenu, setShowMenu] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* LEFT */}
        <div className="navbar-logo" onClick={() => navigate("/")}>
          <h2>Glasses Shop</h2>
        </div>

        {/* CENTER */}
        <div className="navbar-search">
          <input type="text" placeholder="Search glasses..." />
        </div>

        {/* RIGHT */}
        <div className="navbar-actions">
          {!user && (
            <button className="btn login" onClick={() => navigate("/login")}>
              Login
            </button>
          )}

          {user?.role === "CUSTOMER" && user.avatar && (
            <div className="profile-wrapper">
              <img
                src={user.avatar}
                alt="profile"
                className="profile-avatar"
                onClick={() => setShowMenu(!showMenu)}
              />

              {showMenu && (
                <div className="profile-menu">
                  <div onClick={() => navigate("/profile")}>Profile</div>
                  <div onClick={() => navigate("/orders")}>Order History</div>
                  <div onClick={() => navigate("/returns")}>
                    Return Request
                  </div>
                  <div
                    onClick={() => {
                      localStorage.removeItem("user");
                      navigate("/");
                    }}
                  >
                    Logout
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
