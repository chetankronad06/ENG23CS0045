import { getAuthToken } from "logging-middleware";

const API_URL = import.meta.env.VITE_API_URL || "http://4.224.186.213/evaluation-service";

export async function fetchNotifications(filter = "All", page = 1, limit = 10) {
  try {
    const token = await getAuthToken();
    const url = new URL(`${API_URL}/notifications`);
    url.searchParams.append("page", page);
    url.searchParams.append("limit", limit);
    if (filter !== "All") {
      url.searchParams.append("notification_type", filter);
    }

    const res = await fetch(url.toString(), {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json"
      }
    });

    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}

export async function markAsRead(id) {
  return { success: true };
}
