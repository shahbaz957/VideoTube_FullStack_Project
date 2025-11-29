import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
    {
        videoFile: {
            url :{
                type : String ,
                required : true
            },
            public_id : {
                type : String , 
                required : true
            } // for ease in deletion purpoes
        },
        thumbnail: {
            url :{
                type : String ,
                required : true
            },
            public_id : {
                type : String , 
                required : true
            }
        },
        title: {
            type: String, 
            required: true
        },
        description: {
            type: String, 
            required: true
        },
        duration: {
            type: Number, 
            required: true
        }, // can be extracted from the cloudinary response you should have to study that response
        views: {
            type: Number,
            default: 0
        },
        isPublished: {
            type: Boolean,
            default: true
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }

    }, 
    {
        timestamps: true
    }
)

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video", videoSchema)