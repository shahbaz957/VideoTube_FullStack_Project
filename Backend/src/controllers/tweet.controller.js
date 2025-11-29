import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.models.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const { content } = req.body;
  if (!content) {
    throw new ApiError(401, "Please Provide the Content for the Tweet");
  }
  if (!req.user?._id) {
    // inject through verifyJWT
    throw new ApiError(401, "User is Not Present in request");
  }
  const tweet = await Tweet.create({
    content: content,
    owner: req.user._id,
  });
  if (!tweet) {
    throw new ApiError(401, "Tweet is not created Successfully");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet is created Successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const { userId } = req.params;
  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid User ID format");
  }

  const tweets = await Tweet.find({ owner: req.user._id }).populate(
    "owner",
    "username email"
  );
  if (tweets.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No tweets found for this user"));
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        tweets,
        "Tweet of Particular User is Fetched Successfully"
      )
    );
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  const { tweetId } = req.params;
  const { content } = req.body;

  if (!content) {
    throw new ApiError(401, "Please Provide the Content for the Tweet");
  }

  if (!mongoose.Types.ObjectId.isValid(tweetId)) {
    throw new ApiError(400, "Invalid Tweet ID format");
  }

  const tweet = await Tweet.findByIdAndUpdate(
    tweetId,
    { content },
    { new: true }
  );

  if (!tweet) {
    throw new ApiError(404, "Tweet Not Found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet Updated Successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  const { tweetId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(tweetId)) {
    throw new ApiError(400, "Invalid Tweet ID format");
  }

  const tweet = await Tweet.findById(tweetId);

  if (!tweet) {
    throw new ApiError(404, "Tweet Not Found");
  }

  if (tweet.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(401, "You are not allowed to delete the Tweet");
  }

  await tweet.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet Deleted Successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
