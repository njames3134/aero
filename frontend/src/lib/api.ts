import axios from "axios";
import type { Activity } from "../types/activity";

const API = "http://localhost:3000";

export async function syncActivities() {
  return axios.post(`${API}/strava/sync`);
}

export async function getActivities(): Promise<Activity[]> {
  const res = await axios.get(`${API}/activities`);
  return res.data;
}

export async function getActivity(id: number): Promise<Activity> {
  const res = await axios.get(`${API}/activities/${id}`);
  return res.data;
}

export async function getActivityStreams(id: number) {
  const res = await axios.get(`${API}/activities/${id}/streams`);
  return res.data;
}
