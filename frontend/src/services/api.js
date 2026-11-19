import axios from "axios";
import toast from "react-hot-toast";
export const api = axios.create({ baseURL: "/api/v1", withCredentials: true });
export const errMsg = (e) => e.response?.data?.message || "Something went wrong. Try again.";
// Runs an API call and shows a toast on failure. Returns data or null.
export const call = async (fn, ok) => {
  try { const { data } = await fn(); if (ok) toast.success(ok); return data; }
  catch (e) { toast.error(errMsg(e)); return null; }
};
