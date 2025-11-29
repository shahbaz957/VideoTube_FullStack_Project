import mongoose from "mongoose";
import { Comment } from "../models/comment.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  let { page = 1, limit = 10 } = req.query;

  page = parseInt(page);
  limit = parseInt(limit);

  const aggregate = Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
      },
    },
    { $sort: { createdAt: -1 } },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "user",
      },
    },
  ]);
  const options = { page, limit };
  const comments = await Comment.aggregatePaginate(aggregate, options);

  if (!comments) {
    throw new ApiError(401, "Comments are not fetched");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        comments,
        "Comments are Paginated and Fetched Successfully"
      )
    );
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { videoId } = req.params;
  const { content } = req.body;
  if (!req.user?._id) {
    throw new ApiError(401, "User ID is not Received From Request");
  }

  const comment = await Comment.create({
    content: content,
    video: videoId,
    owner: req.user?._id,
  });

  if (!comment) {
    throw new ApiError(401, "Comment is NoT Successfully");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment is created Successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { commentId } = req.params;
  const { content } = req.body;

  if (!content) {
    throw new ApiError(401, "Please Provide the Content for the Comments");
  }

  const newComment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content: content,
      },
    },
    { new: true }
  )

  if (!newComment) {
    throw new ApiError(401, "Comment is not updated Successfully");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, newComment, "Comment is Updated Successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;
  if (!commentId) {
    throw new ApiError(404, "Comment ID is not passed");
  }

  const deletedComment = await Comment.findByIdAndDelete(commentId);
  if (!deletedComment) {
    throw new ApiError("Comment is not deleted Successfully");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, deletedComment, "Comment is Deleted Successfully")
    );
});

export { getVideoComments, addComment, updateComment, deleteComment };
