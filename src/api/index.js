import axios from "axios";

const api = axios.create({
  baseURL: "https://task-manager-server-drab.vercel.app/api",
});
export default api;
