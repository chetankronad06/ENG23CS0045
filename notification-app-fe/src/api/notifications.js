const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function fetchNotifications(filter = "All", page = 1) {
  try {
    const url = new URL(`${API_URL}/api/notifications`);
    url.searchParams.append("type", filter);
    url.searchParams.append("page", page);
    url.searchParams.append("limit", 5);

    const res = await fetch(url.toString());
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
  try {
    const res = await fetch(`${API_URL}/api/notifications/${id}/read`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
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
