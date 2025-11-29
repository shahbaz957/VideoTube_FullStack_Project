import connectDB from "./db/index.js";
import dotenv from "dotenv";
import { app } from "./app.js";

dotenv.config({
  path: "./.env",
});

console.log("Cloudinary Name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("Cloudinary Name:", process.env.CLOUDINARY_API_KEY);
console.log("Cloudinary Name:", process.env.CLOUDINARY_API_SECRET);

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is Listening at ${process.env.PORT || 8000}`);
    });
  })
  .catch((err) => {
    console.log("MongoDB Is not properly Connected !!!");
    console.log(err);
  });
