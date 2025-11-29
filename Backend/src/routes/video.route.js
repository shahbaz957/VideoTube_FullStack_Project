import { Router } from 'express';
import {
    deleteVideo,
    getAllVideos,
    getVideoById,
    publishAVideo,
    togglePublishStatus,
    updateVideo,
    updateThumbnail,
    getVideosByOwner
} from "../controllers/video.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import {upload} from "../middlewares/multer.middleware.js"


const router = Router()

router.use(verifyJWT) 
// Now this authentication is applied on all routes we did this because the manipulation of videos requires authentication

router.route('/').get(getAllVideos).post(upload.fields([ 
    // this uploader will upload the video to the local file and this local file path is provided to the cloudinary to upload to cloud
    {
        name : "videoFile",
        maxCount : 1
    }, 
    {
        name : "thumbnail",
        maxCount : 1
    }
]) , publishAVideo)

router.route('/:videoId').get(getVideoById).delete(deleteVideo).patch(updateVideo)

// For file uploading i should have different route for convenience purpose

router.route('/:videoId/update-thumbnail').patch(upload.single("thumbnail") ,updateThumbnail )


router.route('/owner/:ownerId').get(getVideosByOwner)
router.route("/toggle/publish/:videoId").patch(togglePublishStatus)

export default router