# VideoTube - YouTube-like Video Sharing Platform

![VideoTube Banner](https://user-images.githubusercontent.com/your-image-link/banner.png)  

**VideoTube** is a full-featured video sharing platform inspired by YouTube. Users can upload videos, deleting them, create profiles, subscribe to channels, like videos, comment, and much more. This app provides a complete end-to-end solution for video sharing, making it ideal for learning and showcasing full-stack development skills.

---

## Features

- **User Authentication & Profiles**
  - Signup/Login functionality
  - User profile with avatar, full name, and total subscribers
  - View other users’ profiles

- **Video Uploading**
  - Upload video files and thumbnails
  - Cloudinary integration for storing media
  - Automatic video duration calculation

- **Video Interactions**
  - Like and dislike videos
  - Comment on videos
  - View count tracking

- **Subscription System**
  - Subscribe/unsubscribe to channels
  - Track subscriber count
  - Personalized content feed based on subscriptions

- **Video Management**
  - Update video details (title, description)
  - Update thumbnails
  - Delete videos
  - Toggle video publish status (public/private)

- **Search & Filtering**
  - Search videos by title or description
  - Sort videos by date, views, or custom criteria
  - Filter videos by user/channel

- **Responsive Frontend**
  - Dynamic video listing
  - Promise.all integration for multiple API requests
  - Smooth user experience for browsing videos

---

## Tech Stack

- **Frontend:** React.js, Tailwind CSS, Axios
- **Backend:** Node.js, Express.js, MongoDB, Mongoose
- **Authentication:** JWT Access & Refresh Tokens
- **File Storage:** Cloudinary (Videos & Thumbnails)
- **Deployment:** Heroku / Vercel / Local

---

## Installation

1. **Clone the repository**

```bash
git clone https://github.com/shahbaz957/VideoTube_FullStack_Project.git
cd VideoTube_FullStack_Project
```

# Installation Dependencies :

``` bash
npm install
```

## .env Format :
```bash
MONGODB_URI=your_mongodb_connection_string
PORT=8000
CORS_ORIGIN=*
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=10d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Start Server 
``` bash
npm run dev
```
## Start Frontend 
``` bash
cd client
npm install
npm start
```

# Creator 
### Name : Mirza Shahbaz Ali Baig 
A passionate software Engineer with curiosity to explore the depth of technology

[LinkedIn](linkedin.com/in/mirza-shahbaz-ali-baig-3391b3248/)

