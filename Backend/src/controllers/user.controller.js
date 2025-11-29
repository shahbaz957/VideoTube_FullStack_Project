import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";

const registerUser = asyncHandler(async (req, res) => {
  // outer async Handler is just for elegant error catching and passing it to the next(err)
  // for Registering the user we need a few things that are mentioned in You Journal

  // ALGORITHM TO BE FOLLOWED
  // get user details from frontend
  // validation - not empty
  // check if user already exists: username, email
  // check for images, check for avatar
  // upload them to cloudinary, avatar
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return res
  const { email, fullName, username, password } = req.body;
  console.log("FUll Name : ", fullName); // just for checking purpose

  if (
    [email, fullName, username, password].some((field) => field?.trim() === "") // if one is true whole become the true
  ) {
    throw new ApiError(400, "All Fields are required");
  }

  // Whenever you call the database always use async await

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) throw new ApiError(409, "User already Existed");

  const avatarLocalPath = req.files?.avatar[0].path;
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path; // extract the path through multer uploader
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required"); // Because this is required Field
  }
  // v2.uploader.upload(filePath) ---> uploadCloudinary
  const avatar = await uploadCloudinary(avatarLocalPath);
  let coverImage;
  if (coverImageLocalPath) {
    coverImage = await uploadCloudinary(coverImageLocalPath); // all work is on cloud so use async await
  }

  if (!avatar) {
    throw new ApiError(400, "Avatar File is required Cloudinary Upload is failed");
  }

  console.log("Request Files : " , req.files)
  // Now save them in database
  const user = await User.create({
    fullName,
    avatar: {
      url: avatar.url,
      public_id: avatar.public_id,
    },
    coverImage: coverImage
      ? { url: coverImage.url, public_id: coverImage.public_id }
      : {}, // cuz we havenot impose any checks on whether it should be uploaded or not
    email,
    password,
    username: username.toLowerCase(),
  });

  console.log(user);
  const createdUser = await User.findById(user._id).select(
    "-password -refreshTokens"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Successfully"));
});

const generateAccessAndRefreshTokens = async (userid) => {
  try {
    const user = await User.findById(userid);
    const refreshToken = user.generateRefreshTokens();
    const accessToken = user.generateAccessTokens();
    user.refreshTokens = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { refreshToken, accessToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Went Wrong While Generating Refresh and Access Tokens"
    );
  }
}; // this is internal method so no need to use asynHandler

const loginUser = asyncHandler(async (req, res) => {
  // TODO: --
  // req body -> data
  // username or email
  // find the user
  // access and refresh token
  // send cookie
  const { email, username, password } = req.body;
  if (!email && !username) {
    throw new ApiError(400, "Username or Email is required");
  }
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (!user) {
    throw new ApiError(401, "No User with such Email or Username Exist");
  }
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid User Creadentials");
  }

  const { refreshToken, accessToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshTokens"
  );
  
  // This is for setting the standards of Cookie how it is sent httpOnly means it will only be manipulated from server side although it is shown on frontend or client side or browser but it cannot be manipulated from ther


  const options = {
    httpOnly: true, 
    secure: false,
    sameSite : 'lax'
  };

  // this is used for => Multiple browser usage of APP it does let the user login on the app from any browser he wants

  return res
    .status(201)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          refreshToken,
          accessToken,
        },
        "User Successfully Logged in"
      )
    );
});

const logOutUser = asyncHandler(async (req, res) => {
  /* 
  -> we should have the access of user so that we access _id and extract the data of whole user and then delete refresh tokens to log out the user 
  -> so lets design Middleware
  -> we can do it here but to make our code more flexible what we can do is to create a middleware which inject user object in req as multer middleware has injected files in req in register user so we can access user object with all the information in any other controller also by injecting the middleware between methods and its route
  */
  const user = req.user;
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshTokens: 1, // this removes the field from document Always go for the reason of different things
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(201, {}, "User Logged Out "));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body.refreshToken; // Access from cookies

  // console.log(incomingRefreshToken)

  if (!incomingRefreshToken) {
    throw new ApiError(401, "No Refresh Token is Found in Cookies or Body");
  }
  // Now verify this refresh token which is hashed with you token which is in dataBase
  const decodedToken = jwt.verify(
    incomingRefreshToken, //  Hashed Token which is decoded using the secret key by JWT
    process.env.REFRESH_TOKEN_SECRET
  );

  // console.log(decodedToken)

  // now you 've decoded token fetch your original refreshToken from Db
  const user = await User.findById(decodedToken?._id);

  // console.log(user)

  if (incomingRefreshToken !== user.refreshTokens) {
    throw new ApiError(
      401,
      "Tokens Does not Matched So we Can't Issue New Token Please LogIn Again"
    );
  }

  const options = {
    httpOnly: true,
    secure: true,
  };

  const { accessToken, refreshToken: newRefreshToken } =
    await generateAccessAndRefreshTokens(user._id);
  // Updating the DB

  user.refreshTokens = newRefreshToken;
  await user.save({ validateBeforeSave: false });

  // options = {
  //   httpOnly: true,
  //   secure: true,
  //   sameSite: "strict",
  // };
  return res
    .status(201)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          accessToken,
          refreshToken: newRefreshToken,
        },
        "Access Token Generated Successfully"
      )
    );
});

// This is related to secured route and if user is in secured routes then it should have user cuz you've injected in it through a middleware

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new ApiError(
      400,
      "Please Provide Both New Password and Old Password"
    );
  }

  const user = await User.findById(req.user?._id); // user become the instance of db
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(401, "Provided Password Does not Match the one in DB");
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(201)
    .json(new ApiResponse(200, {}, "Password is Changed Correctly"));
});
// Again secured Route Method So take advantage of Middleware
const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(401, "User Not Found");
  }
  return res.status(201).json(
    new ApiResponse(
      200,
      {
        user,
      },
      "Successfully Fetched the User"
    )
  );
});
// Secured Route
const updateUserFields = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;
  if (!fullName || !email) {
    throw new ApiError(401, "All Fields are required");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName: fullName,
        email: email,
      },
    },
    {
      new: true,
    }
  ).select("-password -refreshTokens");

  return res
    .status(201)
    .json(new ApiResponse(200, user, "User Details Updated Successfully"));
});
// Secured Route
const updateAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(401, "Avatar Image is Missing");
  }
  const newAvatar = await uploadCloudinary(avatarLocalPath);

  // ***************************************************************************************************
  // Destroying the previous Image from Cloudinary

  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(401, "User is not Found");
  }
  // deleted the Previos Image from cloudinary
  if (user.avatar?.public_id) {
    await cloudinary.uploader.destroy(user.avatar.public_id);
  }

  // ***************************************************************************************************

  // user.avatar.url = newAvatar.url;
  // user.avatar.public_id = newAvatar.public_id;
  user.avatar = {
    url: newAvatar.url,
    public_id: newAvatar.public_id,
  };
  await user.save({ validateBeforeSave: false });
  const returnUser = await User.findById(user._id).select(
    "-password -refreshTokens"
  );
  return res
    .status(200)
    .json(
      new ApiResponse(200, returnUser, "Avatar Image is Updated Successfully")
    );
});
// Secured Route
const updateCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;
  if (!coverImageLocalPath) {
    throw new ApiError(401, "CoverImage is Missing");
  }
  const newCoverImage = await uploadCloudinary(coverImageLocalPath);

  // ***************************************************************************************************
  // Destroying the previous Image from Cloudinary

  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(401, "User is not Found");
  }
  // deleted the Previos Image from cloudinary
  if (user.coverImage?.public_id) {
    await cloudinary.uploader.destroy(user.coverImage.public_id);
  }

  // ***************************************************************************************************

  // user.coverImage.url = newCoverImage.url;
  // user.coverImage.public_id = newCoverImage.public_id;
  user.coverImage = {
    url: newCoverImage.url,
    public_id: newCoverImage.public_id,
  };
  await user.save({ validateBeforeSave: false });
  const returnUser = await User.findById(user._id).select(
    "-password -refreshTokens"
  );
  return res
    .status(200)
    .json(
      new ApiResponse(200, returnUser, "CoverImage is Updated Successfully")
    );
});

// User.aggregate([{} , {} , {}]) --> return type is array
const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  if (!username?.trim()) {
    throw new ApiError(400, "Username is Missing");
  }

  // Using Aggregation Pipelines
  const channel = await User.aggregate([
    {
      // 1st Pipeline
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      // 2nd Pipeline
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      // 3rd Pipeline
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      // 4th Pipeline
      $addFields: {
        subscribersCount: {
          $size: "$subscribers", // we use $ here because the subscriber is now a field
        },
        channelsSubscribedTo: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] }, // $in operator can lookup in arrays as well as in objects
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        // the fields that you want to project to the frontend
        fullName: 1,
        email: 1,
        username: 1,
        coverImage: 1,
        avatar: 1,
        subscribersCount: 1,
        channelsSubscribedTo: 1,
        isSubscribed: 1,
        password: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new ApiError(404, "Channel Does not Exist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "User Channel Fetched Successfully")
    );
}); // Write An Article for Confidence

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      user[0]?.watchHistory || [], // safer in case user[0] is undefined
      "WatchHistory is Fetched Successfully"
    )
  );
});

const getUserById = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res.status(200).json(new ApiResponse(200, user, "User fetched successfully"));
});
export {
  registerUser,
  loginUser,
  logOutUser,
  refreshAccessToken,
  changePassword,
  getCurrentUser,
  updateUserFields,
  updateAvatar,
  updateCoverImage,
  getUserChannelProfile,
  getWatchHistory,
  getUserById
};
