import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import BackButton from "../components/BackButton";
import { AuthContext } from "../context/AuthContext";
import Comments from "../components/Comments";
import { Link } from "react-router-dom";

function Watch() {
  const { videoId } = useParams();
  const [video, setVideo] = useState(null);
  const { user } = useContext(AuthContext);
  const [liked, setLiked] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [subscribed, setSubscribed] = useState(false);

  const fetchSubscriptionStatus = async (channelId) => {
    try {
      const res = await api.get(`/subscription/u/${channelId}`, {
  headers: {
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
  },
});
      setSubscriberCount(res.data.data.subscriberCount);
      const subscribeStatus = user && res.data.data.subscribers.some(
        (s) => s.subscriberId.toString() === user._id
      );

      setSubscribed(subscribeStatus);
    } catch (error) {
      console.log("ERROR : ", error);
    }
  };

  useEffect(() => {
    const fetchVideo = async (videoId) => {
      try {
        const res = await api.get(`/video/${videoId}`);
        // console.log(res)
        setVideo(res.data.data);
        fetchSubscriptionStatus(res.data.data.owner._id);
      } catch (error) {
        console.log(error);
      }
    };



    const fetchLikedVideos = async () => {
      const res = await api.get(`/likes/videos`);
      const liked = res.data.data.some((like) => like.video._id === videoId);
      setLiked(liked); // true or false
    };
    fetchLikedVideos();
    fetchVideo(videoId);
  }, [videoId]);
  

  const toggleSubscribe = async () => {
    try {
      const res = await api.post(`/subscription/c/${video.owner._id}`);
      console.log(res)
      // console.log(user)
      // console.log(res.data)
      setSubscribed((prevSubscribed) => {
        setSubscriberCount((count) => (prevSubscribed ? count - 1 : count + 1));
        return !prevSubscribed;
      });
    } catch (error) {
      console.log("ERROR : ", error);
    }
    // console.log(subscriberCount)
  };

  const toggleLike = async () => {
    await api.post(`/likes/toggle/v/${videoId}`);
    setLiked((prev) => !prev);
  };
  if (!video)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto p-4">
      <BackButton />

      {/* Video Player */}
      <div className="aspect-video w-full mb-4">
        <video
          src={video.videoFile.url}
          controls
          className="w-full h-full rounded-xl shadow"
        />
      </div>

      {/* Title */}
      <h1 className="text-2xl font-semibold mb-3">{video.title}</h1>

      {/* Owner + Like + Subscribe */}
      <div className="flex justify-between items-center mb-6">
        {/* Owner Section */}
        <div className="flex items-center gap-4">
          <Link to={`/profile/${video.owner._id}`}>
          <img
            src={video.owner.avatar.url}
            alt={video.owner.username}
            className="w-12 h-12 rounded-full border"
          />
          </Link>
          <div>
            <p className="font-semibold">{video.owner.username}</p>
            <p className="text-sm text-gray-500">{video.views} views</p>
            <p className="text-sm text-gray-500">
              {subscriberCount} subscribers
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          {/* Like Button */}
          <button
            onClick={toggleLike}
            className={`px-4 py-2 rounded-lg font-medium border ${
              liked
                ? "bg-red-500 text-white border-red-500"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {liked ? "Liked ❤️" : "Like 🤍"}
          </button>

          {/* Subscribe Button */}
          <button
            onClick={toggleSubscribe}
            className={`px-4 py-2 rounded-lg font-medium border ${
              subscribed
                ? "bg-gray-200 text-gray-700 border-gray-400"
                : "bg-red-500 text-white border-red-500"
            }`}
          >
            {subscribed ? "Subscribed" : "Subscribe"}
          </button>
        </div>
      </div>

      {/* Description */}
      <div className="bg-gray-100 p-4 rounded-xl">
        <p className="text-gray-700">{video.description}</p>
      </div>

      {/* Comments */}
      <Comments videoId={videoId} />
    </div>
  );
}

export default Watch;