import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "../../styles/NavBar.css";

export default function NavBar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
    window.location.reload(); // reset UI cho demo
  };

  const goToDashboard = () => {
    switch (user.role) {
      case "SALES":
        navigate("/sales");
        break;
      case "OPERATION":
        navigate("/operation");
        break;
      case "MANAGER":
        navigate("/manager");
        break;
      case "ADMIN":
        navigate("/admin");
        break;
      default:
        navigate("/");
    }
  };

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
          {/* CHƯA LOGIN */}
          {!user && (
            <button className="btn login" onClick={() => navigate("/login")}>
              Login
            </button>
          )}

          {/* ĐÃ LOGIN (MỌI ROLE) */}
          {user && user.avatar && (
            <div className="profile-wrapper">
              <img
                src={user.avatar}
                alt="profile"
                className="profile-avatar"
                onClick={() => setShowMenu(!showMenu)}
              />

              {showMenu && (
                <div className="profile-menu">
                  {/* CUSTOMER MENU */}
                  {user.role === "CUSTOMER" ? (
                    <>
                      <div onClick={() => navigate("/profile")}>Profile</div>
                      <div onClick={() => navigate("/orders")}>
                        Order History
                      </div>
                      <div onClick={() => navigate("/returns")}>
                        Return Request
                      </div>
                    </>
                  ) : (
                    <>
                      {/* SALES / OPERATION / MANAGER / ADMIN */}
                      <div onClick={goToDashboard}>Dashboard</div>
                    </>
                  )}

                  <div className="logout" onClick={handleLogout}>
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
