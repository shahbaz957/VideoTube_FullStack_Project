import React, { useEffect, useState } from 'react'
import api from '../api/axios';
import Pagination from './Pagination';
function Comments({videoId}) {

    const [comments , setComments] = useState([]);
    const [page , setPage] = useState(1);
    const [totalPages , setTotalPages] = useState(1);
    const [content , setContent] = useState("");
    const fetchComments = async (page) => {
        const res = await api.get(`comment/${videoId}?page=${page}`);
        setComments(res.data.data.docs)
        setPage(res.data.data.page)
        setTotalPages(res.data.data.totalPages)
    }


    const addComment = async(e) => {
        e.preventDefault();
        if (!content.trim()) return ; // if no comment then avoid api call 
        await api.post(`/comment/${videoId}` , {content})
        setContent("");
        fetchComments(page);
    }

    useEffect(() => {
        fetchComments(page)
    } , [page])
  return (
    <div className="mt-6">
        <form onSubmit={addComment} className="flex gap-2 mb-4">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 border p-2 rounded-lg"
        />
        <button className="px-4 py-2 bg-blue-500 text-white rounded-lg">
          Add
        </button>
      </form>
      <h2 className="font-bold text-lg mb-2">Comments</h2>
      {comments.map((c) => (
        <div key={c._id} className="flex gap-2 mb-3">
          <img
            src={c.user[0].avatar.url} // user is an array because of $lookup
            alt={c.user[0].username}
            className="w-8 h-8 rounded-full"
          />
          <div>
            <p className="font-semibold">{c.user[0].username}</p>
            <p>{c.content}</p>
          </div>
        </div>
      ))}

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onClickPage={(value) => setPage(value)}
      />
    </div>
  )
}

export default Comments