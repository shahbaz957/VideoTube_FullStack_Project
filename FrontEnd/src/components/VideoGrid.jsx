import React, { useContext, useEffect, useState } from "react";
import VideoCard from "./VideoCard";
import api from "../api/axios";
import Pagination from "./Pagination";
import { SearchContext } from "../context/SearchContext";

function VideoGrid() {
  const [videos, setVideos] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const {query} = useContext(SearchContext)

  const fetchVideos = async (page) => {
    const res = await api.get(`/video?page=${page}&limit=10`);
    console.log(res) 
    setVideos(res.data.data.videos);
    setTotalPages(res.data.data.totalPages);
    setPage(res.data.data.page);
    // console.log(videos)
  };

  useEffect(() => {
    fetchVideos(page);
    console.log(videos)
  }, [page , videos]);
  
  const filteredVideos = videos?.filter(video => video.title.toLowerCase().includes(query.toLowerCase()))
  console.log(filteredVideos)

  return (
    <div className="flex flex-col min-h-screen">
      {/* Video Grid */}
      <div className="grid grid-cols-4 gap-4 grow">
        {filteredVideos?.map((video) => (
          <VideoCard key={video._id} video={video} />
        ))}
      </div>

      {/* Pagination at bottom */}
      <div className="mt-6 flex justify-center">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onClickPage={(value) => setPage(value)}
        />
      </div>
    </div>
  );
}

export default VideoGrid;
