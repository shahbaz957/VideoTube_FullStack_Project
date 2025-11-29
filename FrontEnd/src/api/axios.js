import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api/v1/",
  withCredentials: true, 
  // used for working with Cookies used for extraction of data from Cookies
});

export default api;