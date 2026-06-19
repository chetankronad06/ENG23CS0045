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
  Tabs,
  Tab,
  FormControl,
  Select,
  MenuItem,
  InputLabel
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import StarsIcon from "@mui/icons-material/Stars";

import { NotificationCard } from "../components/NotificationCard";
import { NotificationFilter } from "../components/NotificationFilter";
import { useNotifications, usePriorityNotifications } from "../hooks/useNotifications";
import { Log } from "logging-middleware";

export function NotificationsPage() {
  const [tab, setTab] = useState(0);
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [priorityLimit, setPriorityLimit] = useState(10);

  const {
    notifications: allNotifications,
    totalPages,
    unreadCount,
    loading: allLoading,
    error: allError,
    markAsRead: markAllAsRead
  } = useNotifications(filter, page);

  const {
    notifications: priorityNotifications,
    loading: priorityLoading,
    error: priorityError,
    markAsRead: markPriorityAsRead
  } = usePriorityNotifications(filter, priorityLimit);

  useEffect(() => {
    Log("frontend", "info", "page", "Notifications page rendered").catch((err) => {
      console.error(err.message);
    });
  }, []);

  const handleTabChange = (event, newTab) => {
    setTab(newTab);
    setFilter("All");
    setPage(1);
    Log("frontend", "info", "component", `Tab changed to: ${newTab === 0 ? "All" : "Priority"}`).catch((err) => {
      console.error(err.message);
    });
  };

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

  const handlePriorityLimitChange = (event) => {
    const val = event.target.value;
    setPriorityLimit(val);
    Log("frontend", "info", "component", `Priority limit changed to: ${val}`).catch((err) => {
      console.error(err.message);
    });
  };

  const currentLoading = tab === 0 ? allLoading : priorityLoading;
  const currentError = tab === 0 ? allError : priorityError;
  const currentNotifications = tab === 0 ? allNotifications : priorityNotifications;
  const currentMarkAsRead = tab === 0 ? markAllAsRead : markPriorityAsRead;

  return (
    <Box sx={{ maxWidth: 720, mx: "auto", px: 2, py: 6 }}>
      <Stack direction="row" alignItems="center" spacing={2} mb={4}>
        <Badge badgeContent={tab === 0 ? unreadCount : 0} color="primary" max={99}>
          <NotificationsIcon sx={{ fontSize: 32, color: "primary.main" }} />
        </Badge>
        <Typography variant="h4" fontWeight={800} letterSpacing="-0.5px">
          Notifications Portal
        </Typography>
      </Stack>

      <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 3 }} indicatorColor="primary" textColor="primary">
        <Tab icon={<NotificationsIcon />} label="All Updates" sx={{ fontWeight: 700 }} />
        <Tab icon={<StarsIcon />} label="Priority Inbox" sx={{ fontWeight: 700 }} />
      </Tabs>

      <Divider sx={{ mb: 4 }} />

      <Stack direction="row" flexWrap="wrap" gap={2} justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <NotificationFilter value={filter} onChange={handleFilterChange} />
        </Box>
        {tab === 1 && (
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="priority-limit-label">Show Top N</InputLabel>
            <Select
              labelId="priority-limit-label"
              value={priorityLimit}
              label="Show Top N"
              onChange={handlePriorityLimitChange}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value={10}>Top 10</MenuItem>
              <MenuItem value={15}>Top 15</MenuItem>
              <MenuItem value={20}>Top 20</MenuItem>
            </Select>
          </FormControl>
        )}
      </Stack>

      {currentLoading && (
        <Box display="flex" justifyContent="center" py={10}>
          <CircularProgress size={40} thickness={4} />
        </Box>
      )}

      {!currentLoading && currentError && (
        <Alert severity="error" sx={{ borderRadius: 3, mb: 4 }}>
          Failed to load notifications: {currentError}
        </Alert>
      )}

      {!currentLoading && !currentError && currentNotifications.length === 0 && (
        <Alert severity="info" sx={{ borderRadius: 3 }}>
          No updates found in this view.
        </Alert>
      )}

      {!currentLoading && !currentError && currentNotifications.length > 0 && (
        <Stack spacing={2}>
          {currentNotifications.map((n) => (
            <NotificationCard 
              key={n.id} 
              notification={n} 
              onMarkRead={currentMarkAsRead} 
            />
          ))}
        </Stack>
      )}

      {tab === 0 && !currentLoading && totalPages > 1 && (
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
