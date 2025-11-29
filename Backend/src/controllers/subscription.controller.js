import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.models.js";
import { Subscription } from "../models/subscription.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const userId = req.user._id;

  const existingSubscription = await Subscription.findOne({
    subscriber: userId,
    channel: channelId,
  });

  if (existingSubscription) {
    await Subscription.findByIdAndDelete(existingSubscription._id);
    return res.status(200).json({ status: 200, message: "Unsubscribed" });
  }

  const subscription = await Subscription.create({
    subscriber: userId,
    channel: channelId,
  });

  return res
    .status(200)
    .json({ status: 200, data: subscription, message: "Subscribed" });
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  const result = await Subscription.aggregate([
    { $match: { channel: new mongoose.Types.ObjectId(channelId) } },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "SubscriberDetails",
      },
    },
    { $unwind: "$SubscriberDetails" },
    {
    $project: {
      subscriberId: "$SubscriberDetails._id",
      fullName: "$SubscriberDetails.fullName", 
      email: "$SubscriberDetails.email",
      createdAt: "$SubscriberDetails.createdAt",
    },
  },
  ]);

  const subscriberCount = result.length;

  return res.status(200).json({
    status: 200,
    data: { subscriberCount, subscribers: result },
    message: "Subscribers are Fetched Successfully",
  });
});


// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  // if (!isValidObjectId(subscriberId)) {
  //   throw new ApiError(401, "Subscriber id is inValid");
  // }
  // basically what we gonna do is we get all those channels document where subscriber is == to given subscriber ID
  const result = await Subscription.aggregate([
    {
      $match: { subscriber: new mongoose.Types.ObjectId(subscriberId) }, // retrieve all the documents
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "SubscribedChannels",
      },
    },
    {
      $project: {
        name: "$SubscribedChannels.name",
        email: "$SubscribedChannels.email",
        createdAt: 1,
      },
    },
  ]); // this pipeline give us the array containing all the details each channel to which we have subscribed in object format
  // For Counting Purpose
  if (!result) {
    throw new ApiError(
      401,
      "Subscribed Channels are Not Retrieved from the Data Base"
    );
  }
  const SubscribedChannelsCount = result.length;
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { SubscribedChannelsCount, result },
        "Subscribed Channels is retrieved Successfully"
      )
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
