import React, { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
function UploadVideo() {
    const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    videoFile: null,
    thumbnail: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // fixed typo: preventDefault
    try {
      const formData = new FormData();
      for (let key in form) formData.append(key, form[key]);
      await api.post("/video/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Video uploaded successfully!");
      navigate('/home');
    } catch (error) {
      console.error("ERROR:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
        <BackButton/>
        <h2 className="text-2xl font-bold mb-6 text-center text-red-500">
          Upload Your Video
        </h2>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="text"
            name="title"
            placeholder="Video Title"
            onChange={handleChange}
            className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <textarea
            name="description"
            placeholder="Video Description"
            onChange={handleChange}
            className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            rows={4}
          />
          <label className="flex flex-col gap-2">
            <span className="font-medium text-gray-700">Video File</span>
            <input
              type="file"
              name="videoFile"
              onChange={handleChange}
              className="border border-gray-300 p-2 rounded-lg"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="font-medium text-gray-700">Thumbnail</span>
            <input
              type="file"
              name="thumbnail"
              onChange={handleChange}
              className="border border-gray-300 p-2 rounded-lg"
            />
          </label>
          <button
            type="submit"
            className="bg-red-500 text-white font-semibold py-3 rounded-lg hover:bg-red-600 transition"
          >
            Upload Video
          </button>
        </form>
      </div>
    </div>
  );
}

export default UploadVideo;
