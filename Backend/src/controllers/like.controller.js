import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!req.user?._id) {
    throw new ApiError(401, "User id is not provided !!!");
  }
  // Implementing the Toggle Functionality
  const likedVideo = await Like.findOne({
    video: videoId,
    likedBy: req.user._id,
  });
  if (likedVideo) {
    await likedVideo.deleteOne();
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          likedVideo,
          "Already Liked videos is deleted Successfully"
        )
      );
  }
  //TODO: toggle like on video
  const likeVideo = await Like.create({
    video: videoId,
    likedBy: req.user?._id,
  });

  if (!likeVideo) {
    throw new ApiError(402, "Video is Not Successfully Liked");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, likeVideo, "Video is Liked Successfully"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment
  if (!req.user?._id) {
    throw new ApiError(401, "User id is not provided !!!");
  }
  const likedComment = await Like.findOne({
    comment: commentId,
    likedBy: req.user._id,
  });

  if (likedComment) {
    await likedComment.deleteOne();
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Comment unliked successfully"));
  }
  //TODO: toggle like on video
  const likeComment = await Like.create({
    comment: commentId,
    likedBy: req.user?._id,
  });

  if (!likeComment) {
    throw new ApiError(401, "Comment is Not Successfully Liked");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, likeComment, "Comment is Liked Successfullly"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params; // ToBe Continued Tomorrow
  //TODO: toggle like on tweet
  if (!req.user?._id) {
    throw new ApiError(401, "User id is not provided !!!");
  }

  const likedTweet = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user._id,
  });

  if (likedTweet) {
    await likedTweet.deleteOne();
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Tweet unliked successfully"));
  }

  const likeTweet = await Like.create({
    tweet: tweetId,
    likedBy: req.user._id,
  });

  if (!likeTweet) {
    throw new ApiError(401, "Tweet is Not Successfully Liked");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, likeTweet, "Tweet is Liked Successfully"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  if (!req.user?._id) {
    throw new ApiError(401, "User is Not present in Request");
  }
  const videos = await Like.find({
    likedBy: req.user?._id,
    video: { $ne: null },
  }).populate("video");
  if (!videos) {
    throw new ApiError(401, "ERROR !!!!! ::::: Videos are Not Fectched :::::");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Liked Videos are Fetched Succesfully"));
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
