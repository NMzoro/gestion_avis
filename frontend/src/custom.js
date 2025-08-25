import axios from "axios";

const custom = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
});
export default custom