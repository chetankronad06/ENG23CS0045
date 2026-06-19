import { useState, useEffect, useCallback } from "react";
import { fetchNotifications } from "../api/notifications";
import { Log } from "logging-middleware";

export function useNotifications(filter = "All", page = 1) {
  const [notifications, setNotifications] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [readIds, setReadIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("read_notifications") || "[]");
    } catch {
      return [];
    }
  });

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      await Log("frontend", "info", "api", `Load: filter=${filter}, page=${page}`);
      
      const data = await fetchNotifications(filter, page, 10);
      const rawItems = data.notifications || [];
      
      const mapped = rawItems.map(n => ({
        id: n.ID,
        title: n.Type === "Placement" ? "Placement Drive" 
             : n.Type === "Result" ? "Academic Result" 
             : "Campus Event",
        message: n.Message,
        type: n.Type,
        createdAt: n.Timestamp,
        read: readIds.includes(n.ID)
      }));

      setNotifications(mapped);
      
      if (rawItems.length === 10) {
        setTotalPages(page + 1);
      } else {
        setTotalPages(page);
      }

      const count = mapped.filter(n => !n.read).length;
      setUnreadCount(count);
    } catch (err) {
      setError(err.message || "Failed to load notifications");
      await Log("frontend", "error", "api", `Fail load: ${err.message}`);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [filter, page, readIds]);

  useEffect(() => {
    load();
  }, [load]);

  const markAsRead = async (id) => {
    try {
      await Log("frontend", "info", "state", `Mark read ID ${id}`);
      const updated = [...readIds, id];
      setReadIds(updated);
      localStorage.setItem("read_notifications", JSON.stringify(updated));
      
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      await Log("frontend", "error", "state", `Mark read failed ID ${id}: ${err.message}`);
    }
  };

  return {
    notifications,
    totalPages,
    unreadCount,
    loading,
    error,
    reload: load,
    markAsRead
  };
}

export function usePriorityNotifications(filter = "All", limitN = 10) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [readIds, setReadIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("read_notifications") || "[]");
    } catch {
      return [];
    }
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Log("frontend", "info", "api", `Load priority: filter=${filter}, n=${limitN}`);
      
      const pagesToFetch = 5;
      const promises = [];
      for (let p = 1; p <= pagesToFetch; p++) {
        promises.push(fetchNotifications("All", p, 10));
      }
      
      const results = await Promise.all(promises);
      let allRaw = [];
      for (const res of results) {
        if (res.notifications) {
          allRaw.push(...res.notifications);
        }
      }

      const uniqueMap = new Map();
      allRaw.forEach(n => {
        if (n && n.ID) {
          uniqueMap.set(n.ID, n);
        }
      });
      const uniqueRaw = Array.from(uniqueMap.values());

      const unreadRaw = uniqueRaw.filter(n => !readIds.includes(n.ID));

      const weights = {
        placement: 3,
        result: 2,
        event: 1
      };

      const getWeight = (type) => {
        if (!type) return 1;
        return weights[type.toLowerCase()] || 1;
      };

      const sorted = unreadRaw.sort((a, b) => {
        const weightA = getWeight(a.Type);
        const weightB = getWeight(b.Type);
        if (weightA !== weightB) {
          return weightB - weightA;
        }
        return new Date(b.Timestamp) - new Date(a.Timestamp);
      });

      const filtered = filter === "All" 
        ? sorted 
        : sorted.filter(n => n.Type?.toLowerCase() === filter.toLowerCase());

      const sliced = filtered.slice(0, limitN);

      const mapped = sliced.map(n => ({
        id: n.ID,
        title: n.Type === "Placement" ? "Placement Drive" 
             : n.Type === "Result" ? "Academic Result" 
             : "Campus Event",
        message: n.Message,
        type: n.Type,
        createdAt: n.Timestamp,
        read: false
      }));

      setNotifications(mapped);
    } catch (err) {
      setError(err.message || "Failed to load priority notifications");
      await Log("frontend", "error", "api", `Fail load priority: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [filter, limitN, readIds]);

  useEffect(() => {
    load();
  }, [load]);

  const markAsRead = async (id) => {
    try {
      await Log("frontend", "info", "state", `Mark priority read ID ${id}`);
      const updated = [...readIds, id];
      setReadIds(updated);
      localStorage.setItem("read_notifications", JSON.stringify(updated));
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      await Log("frontend", "error", "state", `Mark priority read failed ID ${id}: ${err.message}`);
    }
  };

  return {
    notifications,
    loading,
    error,
    reload: load,
    markAsRead
  };
}
