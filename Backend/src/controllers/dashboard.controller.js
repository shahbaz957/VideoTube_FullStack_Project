import mongoose from "mongoose";
import { Video } from "../models/video.models.js";
import { Subscription } from "../models/subscription.models.js";
import { Like } from "../models/like.models.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like -> total video views, total subscribers, total videos, total likes etc.
  // Heavy Pipeline is Needed Here
  if (!req.user?._id) {
    throw new ApiError(
      401,
      "No userID is present in Request Body UNAUTHORIZED ACCESS"
    );
  }
  const result = await User.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(req.user._id) },
    },
    {
        $lookup: {
            from : "videos",
            localField : "_id",
            foreignField : "owner",
            as : "Videos"
        }
    }, 
    {
        $lookup : {
            from : "subscriptions",
            foreignField : "channel",
            localField : "_id",
            as : "Subscriber"
        }
    },
    {
        $lookup : {
            from : "likes",
            localField : "Videos._id",
            foreignField: "video",
            as : "Likes"
        }
    },
    {
        $project : {
            totalVideos : {$size : "$Videos"},
            totalViews : {$sum : "$Videos.views"},
            totalSubscribers : {$size : "$Subscriber"},
            totalLikes : {$size : "$Likes"}
        }
    }
  ]);
//   const TotalViews = result.length > 0 ? result[0].TotalViews : 0;

//   const subscribers = await Subscription.aggregate([
//     {
//       $match: { channel: new mongoose.Types.ObjectId(req.user?._id) },
//     },
//     {
//       $count: "totalSubscribers",
//     },
//   ]);
//   const TotalSubscriber =
//     subscribers.length > 0 ? subscribers[0].totalSubscribers : 0;

//     const Videos = await Video.aggregate([
//         {
//             $match : {
//                 owner : new mongoose.Types.ObjectId(req.user._id)
//             }
//         },
//         {
//             $count : "TotalVideos"
//         }
//     ])


  const VideoStats = result.length > 0 ? result[0] : {
    totalVideos: 0,
    totalViews: 0,
    totalSubscribers: 0,
    totalLikes: 0
  } // [0] give you the object from the array because we are using aggregate

  return res
  .status(200)
  .json(
    new ApiResponse(200 , VideoStats , "Channel Stats Fetched Successfully")
  )

});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  if (!req.user?._id) {
    throw new ApiError(
      401,
      "No userID is present in Request Body UNAUTHORIZED ACCESS"
    );
  }
  const videos = await Video.find({ owner: req.user._id });
  if (videos.length === 0) {
    throw new ApiError(404 , "No Videos Found")
  }
  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Channel Videos Fetched Successfully"));
});

export { getChannelStats, getChannelVideos };
