import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import SearchBar from "./SearchBar";
import api from "../api/axios";

function Header() {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token"); // this token has access token stored in the Local Storage 
    api.post(`user/logout`);
    setUser(null);
    navigate("/login");
  };
  return (
    <header className="flex items-center justify-between p-4 border-b shadow-sm bg-white">
      <Link to="/home" className="flex items-center">
        <h1 className="text-3xl font-extrabold text-red-500 tracking-wide">
          VideoTube
        </h1>
      </Link>

      <div className="flex-1 flex justify-center mx-6">
        <SearchBar />
      </div>

      <div className="flex items-center gap-4">
        <Link
          to="/upload"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Upload
        </Link>

        {/* User Profile Image */}
        {user && (
          <>
            <Link to={`/profile/${user._id}`}>
              <img
                src={user.avatar.url}
                alt="profile"
                className="w-10 h-10 rounded-full object-cover border"
              />
            </Link>

            <button
              onClick={handleLogout}
              className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;
