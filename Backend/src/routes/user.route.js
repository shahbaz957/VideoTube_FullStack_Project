import {
  changePassword,
  getCurrentUser,
  getUserById,
  getUserChannelProfile,
  getWatchHistory,
  loginUser,
  logOutUser,
  registerUser,
  updateAvatar,
  updateCoverImage,
  updateUserFields,
} from "../controllers/user.controller.js";
import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { refreshAccessToken } from "../controllers/user.controller.js";
const router = Router();

router.route("/register").post(
  upload.fields([
    { 
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]), // only because of this middleware we are able get the req.files in middleware of user
  registerUser
);
router.route("/login").post(loginUser);
/// Secured Routes

router.route("/logout").post(verifyJWT, logOutUser);
router.route('/refresh-token').post(refreshAccessToken)
router.route('/change-password').post(verifyJWT , changePassword)
router.route('/get-user').get(verifyJWT , getCurrentUser)
router.route('/update-user').patch(verifyJWT , updateUserFields)

router
.route('/update-avatar')
.patch(verifyJWT , upload.single("avatar"),updateAvatar)

router
.route('/update-Cimage')
.patch(verifyJWT , upload.single("coverImage"), updateCoverImage)

router.route("/:userId").get(getUserById)

router.route('/c/:username').get(verifyJWT , getUserChannelProfile)
router.route("/history").get(verifyJWT , getWatchHistory)


export default router;
