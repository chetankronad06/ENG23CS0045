import { useState, useEffect } from "react";
import {
  Alert,
  Badge,
  Box,
  CircularProgress,
  Divider,
  Pagination,
  Stack,
  Typography,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";

import { NotificationCard } from "../components/NotificationCard";
import { NotificationFilter } from "../components/NotificationFilter";
import { useNotifications } from "../hooks/useNotifications";
import { Log } from "logging-middleware";

export function NotificationsPage() {
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);

  const { 
    notifications, 
    totalPages, 
    unreadCount, 
    loading, 
    error, 
    markAsRead 
  } = useNotifications(filter, page);

  useEffect(() => {
    Log("frontend", "info", "page", "Notifications page rendered").catch((err) => {
      console.error(err.message);
    });
  }, []);

  const handleFilterChange = (event, newFilter) => {
    const targetFilter = newFilter || "All";
    setFilter(targetFilter);
    setPage(1);
    
    Log("frontend", "info", "component", `Filter changed to: ${targetFilter}`).catch((err) => {
      console.error(err.message);
    });
  };

  const handlePageChange = (_, newPage) => {
    setPage(newPage);
    
    Log("frontend", "info", "component", `Page changed to: ${newPage}`).catch((err) => {
      console.error(err.message);
    });
  };

  return (
    <Box sx={{ maxWidth: 720, mx: "auto", px: 2, py: 6 }}>
      <Stack direction="row" alignItems="center" spacing={2} mb={4}>
        <Badge badgeContent={unreadCount} color="primary" max={99} sx={{
          "& .MuiBadge-badge": {
            fontSize: "12px",
            height: "20px",
            minWidth: "20px",
            borderRadius: "10px",
            fontWeight: 700
          }
        }}>
          <NotificationsIcon sx={{ fontSize: 32, color: "primary.main" }} />
        </Badge>
        <Typography variant="h4" fontWeight={800} letterSpacing="-0.5px">
          Notifications Portal
        </Typography>
      </Stack>

      <Divider sx={{ mb: 4 }} />

      <Box sx={{ marginBottom: 4 }}>
        <NotificationFilter value={filter} onChange={handleFilterChange} />
      </Box>

      {loading && (
        <Box display="flex" justifyContent="center" py={10}>
          <CircularProgress size={40} thickness={4} />
        </Box>
      )}

      {!loading && error && (
        <Alert severity="error" sx={{ borderRadius: 3, mb: 4 }}>
          Failed to load notifications: {error}
        </Alert>
      )}

      {!loading && !error && notifications.length === 0 && (
        <Alert severity="info" sx={{ borderRadius: 3 }}>
          No new updates under '{filter}' category.
        </Alert>
      )}

      {!loading && !error && notifications.length > 0 && (
        <Stack spacing={2}>
          {notifications.map((n) => (
            <NotificationCard 
              key={n.id} 
              notification={n} 
              onMarkRead={markAsRead} 
            />
          ))}
        </Stack>
      )}

      {!loading && totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={6}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            shape="rounded"
            size="large"
            sx={{
              "& .MuiPaginationItem-root": {
                fontWeight: 600,
                borderRadius: 2
              }
            }}
          />
        </Box>
      )}
    </Box>
  );
}
