import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlists.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  //TODO: create playlist
  const playlist = await Playlist.create({
    name: name,
    description: description,
    owner: req.user._id,
  });
  if (!playlist) {
    throw new ApiError(401, "Playlist document is not created Successfully");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist is created Successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  // match playlist -> user
  const { userId } = req.params;
  //TODO: get user playlists
  // Using mongoDB pipeline or simply query
  const userPlaylist = await Playlist.find({ owner: userId }).populate(
    "videos"
  ); // this populate method also fetch the video documents along with playlists
  // playlist.owner == user._id  (Extract ALL this type of playlist where owner has given user_ID)
  if (userPlaylist.length === 0) {
    throw new ApiError(404, "ERROR OCCURED : No PlayList Found For User");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        userPlaylist,
        "All the playlists of User is Fetched Successfully"
      )
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "Playlist is not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist is fetched Successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!req.user?._id) {
    throw new ApiError(401, "User is not Found");
  }
  const newPlaylist = await Playlist.findOneAndUpdate(
    { _id: playlistId, owner: req.user._id },
    {
      $addToSet: {
        videos: videoId,
      },
    },
    { new: true }
  ).populate("videos"); // populate is just similar to pipeline

  if (!newPlaylist) {
    throw new ApiError(401, "Playlist is not updated and Video is not added");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        newPlaylist,
        "Video is added In Playlist Successfully"
      )
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist
  if (!req.user?._id) {
    throw new ApiError(401, "User is not Found");
  }
  const updatedPlaylist = await Playlist.findOneAndUpdate(
    { _id: playlistId, owner: req.user._id },
    {
      $pull: {
        videos: videoId,
      },
    },
    { new: true }
  );
  if (!updatedPlaylist) {
    throw new ApiError(401, "VIdeo is not Deleted From the Playlist");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedPlaylist, "Video is deleted Successfully")
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
  if (!playlistId) {
    throw new ApiError(404, "Playlist ID is not Found");
  }
  const newPlaylist = await Playlist.findByIdAndDelete(playlistId);
  if (!newPlaylist) {
    throw new ApiError(404, "Playlist is not Found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, newPlaylist, "Playlist is deleted Successfully")
    );
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist
  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        name: name,
        description: description,
      },
    },
    { new: true }
  );
  if (!playlist) {
    throw new ApiError(404, "Playlist is found neither updated");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist is updated Successfully"));
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
