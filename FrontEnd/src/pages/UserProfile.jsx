import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";
import BackButton from "../components/BackButton";
import { Link, useParams } from "react-router-dom";
import { SearchContext } from "../context/SearchContext";

function UserProfile() {
  const { userId } = useParams();
  const [videos, setVideos] = useState([]);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [videoCount, setVideoCount] = useState(0);
  const [user_, setUser] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (!userId) return;
    const fetchData = async () => {
      try {
        const [subRes, videosRes, userRes] = await Promise.all([
          api.get(`/subscription/u/${userId}`),
          api.get(`video/owner/${userId}`),
          api.get(`users/${userId}`),
        ]);


        // Cuz we need all the responses of the API at the same time so we Use Promise.all cuz it only proceed or Resolve when all the asynchronous work is correctly done o/w reject

        // console.log(videosRes)
        setSubscriberCount(subRes.data.data.subscriberCount);
        setVideos(videosRes.data.data.videos);
        
        setVideoCount(videosRes.data.data.videos.length);
        setUser(userRes.data.data);
        // console.log(userRes.data.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [userId]);

  // console.log(user)
  
  const handleDelete = async (vid_owner_id, vid_id) => {
  if (user._id.toString() === vid_owner_id.toString()) {
    try {
      await api.delete(`/video/${vid_id}`);
      setVideos(prev => prev.filter(v => v._id !== vid_id)); 
    } catch (error) {
      console.log("ERROR : ", error);
    }
  } else {
    alert("Not Allowed to delete the video");
  }
};

  // console.log(user._id)

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Cover Image */}
      <BackButton />
      <div className="relative">
        <img
          src={user_?.coverImage?.url}
          alt={user_?.username}
          className="w-full h-60 object-cover rounded-lg shadow-md"
        />
        {/* Avatar */}
        <div className="absolute -bottom-12 left-8">
          <img
            src={user_?.avatar?.url}
            alt={user_?.username}
            className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
          />
        </div>
      </div>

      {/* User Info */}
      <div className="mt-16 ml-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{user_?.username}</h1>
          <div className="flex gap-4 mt-2">
            <span className="px-3 py-1 bg-gray-200 rounded-full font-medium text-sm">
              {subscriberCount} Subscribers
            </span>
            <span className="px-3 py-1 bg-gray-200 rounded-full font-medium text-sm">
              {videoCount} Videos
            </span>
          </div>
        </div>
      </div>

      {/* Videos Section */}
      <div className="mt-10">
        <h2 className="text-2xl font-semibold mb-4">My Videos</h2>
        {videos?.length === 0 ? (
          <p className="text-gray-500">No videos uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {videos?.map((video) => (
              <div
                key={video._id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
              >
                <Link to={`/watch/${video._id}`}>
                  <img
                    src={video.thumbnail?.url}
                    alt={video.title}
                    className="w-full h-40 object-cover rounded-t-lg"
                  />
                </Link>
                <div className="p-3">
                  <h3 className="font-medium text-lg line-clamp-2">
                    {video.title}
                  </h3>
                  <p className="text-gray-500 text-sm mt-1">
                    {video.views} views
                  </p>
                  {/* {console.log(video.owner)} */}
                  {/* {console.log("Video Owner : " , video.owner._id , " Login User : " , user._id)} */}
                </div>
                <button
                  onClick={() => handleDelete(video.owner._id, video._id)}
                  disabled={user._id.toString() !== video.owner._id.toString()}
                  className={`px-3 py-1 rounded ${
                    user._id.toString() === video.owner._id.toString()
                      ? "bg-red-500 text-white"
                      : "bg-gray-300 cursor-not-allowed"
                  }`}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserProfile;
