import { uploadCloudinary } from "../utils/cloudinary.js";
import { Video } from "../models/video.models.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";  
import { asyncHandler } from "../utils/asyncHandler.js";
// import { v2 as cloudinary } from "cloudinary";
import cloudinary from "../config/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query,
    sortBy = "createdAt",     // better default than views
    sortType = "desc",        // desc = newest first
    userId,
  } = req.query;

  // Build the aggregation pipeline
  const pipeline = [];

  // 1. Search in title or description
  if (query) {
    pipeline.push({
      $match: {
        $or: [
          { title: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
        ],
      },
    });
  }

  // 2. Filter by owner (if userId is provided)
  if (userId) {
    pipeline.push({
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    });
  }

  pipeline.push({
    $match: { isPublished: true }
  });

  pipeline.push(
    {
      $lookup: {
        from: "users",           
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $unwind: {
        path: "$owner",
        preserveNullAndEmptyArrays: true,
      },
    }
  );


  const sortOrder = sortType === "asc" ? 1 : -1;
  pipeline.push({
    $sort: { [sortBy]: sortOrder },
  });

  pipeline.push({
    $project: {
      title: 1,
      description: 1,
      duration: 1,
      views: 1,
      isPublished: 1,
      createdAt: 1,
      thumbnail: 1,
      videoFile: 1,
      "owner._id": 1,
      "owner.username": 1,
      "owner.fullName": 1,
      "owner.avatar": 1,
    },
  });


  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    customLabels: {
      docs: "videos",
      totalDocs: "totalVideos",
    },
  };

  const result = await Video.aggregatePaginate(
    Video.aggregate(pipeline),
    options
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, result, "Videos fetched successfully")
    );
});




const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video

  // *********************** BUSINESS LOGIC *****************************

  // By default i will set the publist status to TRUE if You want You can use toggle Publish Button

  if (!title || !description) {
    throw new ApiError(401, "Title and Description Both are required");
  }

  const existing = await Video.findOne({ title, owner: req.user._id });
  if (existing) {
    throw new ApiError(400, "Video with same title Already exist");
  }
  const videoFileLocalPath = req.files?.videoFile[0].path;
  const thumbnailLocalPath = req.files?.thumbnail[0].path;
  if (!videoFileLocalPath) {
    throw new ApiError(400, "Please Upload VideoFile");
  }
  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Please Upload Thumbnail for the Video");
  }

  const videoFile = await uploadCloudinary(videoFileLocalPath);
  const thumbnail = await uploadCloudinary(thumbnailLocalPath);
  if (!videoFile) {
    throw new ApiError(400, "Videofile is not uploaded to the Cloud");
  }
  if (!thumbnail) {
    throw new ApiError(400, "Thumbnail is Not Uploaded to the Cloud");
  }
  const videoData = await Video.create({
    title,
    description,
    videoFile: {
      url: videoFile.url,
      public_id: videoFile.public_id,
    },
    thumbnail: {
      url: thumbnail.url,
      public_id: thumbnail.public_id,
    },
    duration: videoFile.duration,
    owner: req.user._id, // This links video to logged-in user
  });

  return res
    .status(200)
    .json(new ApiResponse(200, videoData, "Video is Published Successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
  const video = await Video.findByIdAndUpdate(
    videoId,
    {
      $inc: { views: 1 },
    },
    { new: true }
  ).populate("owner", "username avatar");
  if (!video) {
    throw new ApiError(404, "Video Not Found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video is Fetched Successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail (i think for file updating i should write a different function according to my mentor)
  const { title, description } = req.body;
  if (!title || !description) {
    throw new ApiError(401, "Please Provide Both title and Description");
  }
  const video = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title: title,
        description: description,
      },
    },
    { new: true } // Return the updated field of video of that particular id
  );

  if (!video) {
    throw new ApiError(
      404,
      "Video is not found by Given ID and desired Fields are Not Updated"
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video is Uploaded Successfully"));
});

// : ::::::: : File Uploading Is Here : ::::::: :

const updateThumbnail = asyncHandler(async (req, res) => {
  // ****************************** ALGORITHM TO BE FOLLOWED *************************************

  // Extract localPath
  // check all the errors
  // upload on cloudinary
  // fetch video
  // First destroy the previous thumbnail
  // set the new Thumbnail URL
  // save the Video DB
  // Return the Response

  // ******************************************************************************************

  const { videoId } = req.params;
  const thumbnailLocalPath = req.file?.path;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid Video ID");
  }
  if (!thumbnailLocalPath) {
    throw new ApiError(404, "Thumbnail File is Missing");
  }

  const newThumbnail = await uploadCloudinary(thumbnailLocalPath);

  // fetch video
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video Not Found");
  }

  // First destroy the previous thumbnail
  if (video.thumbnail?.public_id) {
    // this is known as optional Chaining
    await cloudinary.uploader.destroy(video.thumbnail.public_id);
  }

  // set the new Thumbnail URL
  video.thumbnail = {
    url: newThumbnail.url,
    public_id: newThumbnail.public_id,
  };

  // save the Video DB
  await video.save();

  // Return the Response
  return res
    .status(200)
    .json(new ApiResponse(200, video, "Thumbnail Updated Successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid Video ID");
  }
  const video = await Video.findById(videoId);
  console.log(video)
  if (!video) {
    throw new ApiError(404, "Video is Not Found");
  }
  if (video.videoFile?.public_id) {
    await cloudinary.uploader.destroy(video.videoFile.public_id);
  }
  if (video.thumbnail?.public_id) {
    await cloudinary.uploader.destroy(video.thumbnail.public_id);
  }

  const deletedVideo = await Video.findByIdAndDelete(videoId);

  if (!deletedVideo) {
    throw new ApiError(404, "Video with Given ID is not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, deletedVideo, "Video is Deleted Successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video Not Found");
  }
  video.isPublished = !video.isPublished;
  await video.save();
  // You have to save your operations when you manually insert different values against keys in document
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        video,
        "Toggle Publish Video status is Occured Successfully"
      )
    );
});

const getVideosByOwner = asyncHandler(async (req, res) => {
  const { ownerId } = req.params;

  if (!ownerId) {
    throw new ApiError(400, "Owner ID is required");
  }

  const videos = await Video.find({ owner: ownerId }).populate(
    "owner",
    "username avatar"
  );

  // Instead of throwing 404, just send empty array if no videos
  return res
    .status(200)
    .json(new ApiResponse(200, { videos: videos || [] }, "Videos fetched successfully"));
});


export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
  updateThumbnail,
  getVideosByOwner,
};
