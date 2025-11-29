import React from "react";
import { Link } from "react-router-dom";

function VideoCard({ video }) {
  console.log(video)
  return (
    <div className="flex flex-col">
      <Link
        to={`/watch/${video._id}`}
        className="relative w-full h-52 overflow-hidden rounded-lg" // taller height
      >
        <img
          src={video.thumbnail.url}
          alt={video.title}
          className="w-full h-full object-cover"
        />
      </Link>
      <div className="flex mt-2 gap-3">
        {/* Owner Avatar */}
        <img
          src={video?.owner?.avatar?.url}
          alt={video?.owner?.username}
          className="w-10 h-10 rounded-full object-cover"
        />

        {/* Video Info */}
        <div className="flex flex-col">
          <h3 className="font-semibold line-clamp-2">{video?.title}</h3>
          <p className="text-sm text-gray-500">{video?.owner?.username}</p>
          <p className="text-sm text-gray-500">{video?.views} views</p>
        </div>
      </div>
    </div>
  );
}

export default VideoCard;
