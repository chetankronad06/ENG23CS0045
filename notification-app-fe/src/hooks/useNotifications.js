import { useState, useEffect, useCallback } from "react";
import { fetchNotifications, markAsRead as markAsReadApi } from "../api/notifications";
import { Log } from "logging-middleware";

export function useNotifications(filter = "All", page = 1) {
  const [notifications, setNotifications] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      await Log("frontend", "info", "api", `Load: filter=${filter}, page=${page}`);
      
      const data = await fetchNotifications(filter, page);
      setNotifications(data.notifications ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 1);
      setUnreadCount(data.unreadCount ?? 0);
    } catch (err) {
      setError(err.message || "Failed to load notifications");
      await Log("frontend", "error", "api", `Fail load: ${err.message}`);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => {
    load();
  }, [load]);

  const markAsRead = async (id) => {
    try {
      await Log("frontend", "info", "state", `Mark read ID ${id}`);
      await markAsReadApi(id);
      await load(true);
    } catch (err) {
      await Log("frontend", "error", "state", `Mark read failed ID ${id}: ${err.message}`);
    }
  };

  return {
    notifications,
    total,
    totalPages,
    unreadCount,
    loading,
    error,
    reload: load,
    markAsRead
  };
}
