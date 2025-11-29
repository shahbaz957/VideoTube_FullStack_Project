import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
      index: true, // Learn in Database design used for efficient Searching
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      url: {
        type: String,
        required: true,
      },
      public_id: {
        type: String,
        required: true,
      },
    },
    coverImage: {
      url: {
        type: String,
      },
      public_id: {
        type: String,
      },
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    password: {
      type: String,
      required: [true, "Password is required"],
      //Regex for validating the special characters in password
    },
    refreshTokens: {
      type: String,
    },
  },
  { timestamps: true }
);

// Encryption of the Password
// this is basically the middleware
userSchema.pre("save", async function (next) {
  // Why not use arrow function (Because we dont have the access of this context in arrow function just the basics of JS)
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10); // number is just the rounds that crypto algorithm run for the encrypttion of the password
  next(); // Calling the next middleware
});

userSchema.methods.generateAccessTokens = function () {
  return jwt.sign( // this is the payload
    {
      _id: this._id,
      username: this.username,
      fullName: this.fullName,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshTokens = function () {
  return jwt.sign(
    {
      _id: this._id, // the whole purpose of this token is to just generate new Access Tokens
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

// This is the Custom Password Check Method that functions can call from outside to check whether the password is in its write form or not
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password); // that is why we havenot used arrow function here cuz we dont have the access of this context in arrow function
};

export const User = mongoose.model("User", userSchema);
