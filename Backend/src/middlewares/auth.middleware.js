import { User } from "../models/user.models.js"
import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import  jwt  from "jsonwebtoken"
export const verifyJWT = asyncHandler(async (req , _ , next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        if (!token) {
            throw new ApiError(401 , "Unauthorized Access")
        }
        const isVerified = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(isVerified?._id).select("-password -refreshTokens")
        if( !user ){
            throw new ApiError(401 , "Unauthorized Access Token is invalid User Object is not returned")
        } 
        req.user = user // the best piece of code in whole project
        next()
    } catch (error) {
        throw new ApiError(401 , "UnAuthorized Access")
    }
})
