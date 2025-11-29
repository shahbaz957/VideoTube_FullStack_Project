import React, { useState, useContext } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function SignUp() {
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    username: "",
    fullName: "",
    password: "",
    avatar: null,
    coverImage: null,
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setForm((prev) => ({ ...prev, [name]: files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      for (let key in form) formData.append(key, form[key]);
      const res = await api.post("/users/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log(res.data);
      setUser(res.data.data);
      navigate("/login");
    } catch (error) {
      console.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-500 to-pink-500">
      <div className="bg-white shadow-2xl rounded-3xl w-full max-w-md p-8">
        <h1 className="text-3xl font-extrabold text-center text-gray-800 mb-6">
          Create Account
        </h1>
        <p className="text-center text-gray-500 mb-8">
          Join VideoTube and start sharing your videos
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            name="fullName"
            placeholder="Full Name"
            onChange={handleChange}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
          />
          <input
            name="username"
            placeholder="Username"
            onChange={handleChange}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
          />
          <input
            name="email"
            placeholder="Email"
            onChange={handleChange}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
          />

          <label className="flex flex-col items-center px-4 py-3 border border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition">
            {form.avatar ? form.avatar.name : "Upload Avatar"}
            <input
              type="file"
              name="avatar"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          <label className="flex flex-col items-center px-4 py-3 border border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition">
            {form.coverImage ? form.coverImage.name : "Upload Cover Image"}
            <input
              type="file"
              name="coverImage"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          <button
            type="submit"
            className="mt-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold hover:scale-105 transform transition"
          >
            Sign Up
          </button>
        </form>

        <p className="text-center text-gray-400 mt-6">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-purple-500 cursor-pointer font-medium hover:underline"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

export default SignUp;
