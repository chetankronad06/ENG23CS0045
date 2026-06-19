import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Box,
  Tooltip,
  Chip
} from "@mui/material";
import WorkIcon from "@mui/icons-material/Work";
import SchoolIcon from "@mui/icons-material/School";
import EventIcon from "@mui/icons-material/Event";
import DraftsIcon from "@mui/icons-material/Drafts";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";

function formatTime(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

const typeConfig = {
  placement: {
    color: "#4f46e5",
    bgColor: "#e0e7ff",
    icon: <WorkIcon sx={{ fontSize: 20, color: "#4f46e5" }} />
  },
  result: {
    color: "#16a34a",
    bgColor: "#dcfce7",
    icon: <SchoolIcon sx={{ fontSize: 20, color: "#16a34a" }} />
  },
  event: {
    color: "#9333ea",
    bgColor: "#f3e8ff",
    icon: <EventIcon sx={{ fontSize: 20, color: "#9333ea" }} />
  }
};

export function NotificationCard({ notification, onMarkRead }) {
  const { id, title, message, type, read, createdAt } = notification;
  
  const normType = type ? type.toLowerCase() : "event";
  const config = typeConfig[normType] || typeConfig.event;

  return (
    <Card
      sx={{
        position: "relative",
        borderRadius: 3,
        borderLeft: `5px solid ${read ? "#cbd5e1" : config.color}`,
        bgcolor: read ? "#ffffff" : "#f8fafc",
        transition: "transform 0.2s, box-shadow 0.2s",
        boxShadow: read 
          ? "0 1px 3px 0 rgba(0, 0, 0, 0.05)" 
          : "0 4px 6px -1px rgba(79, 70, 229, 0.05), 0 2px 4px -1px rgba(79, 70, 229, 0.03)",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.03)"
        }
      }}
    >
      <CardContent sx={{ display: "flex", gap: 2, p: "16px !important" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 40,
            height: 40,
            borderRadius: "12px",
            bgcolor: config.bgColor,
            flexShrink: 0
          }}
        >
          {config.icon}
        </Box>

        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5, gap: 1 }}>
            <Typography variant="subtitle1" fontWeight={700} color={read ? "text.secondary" : "text.primary"}>
              {title}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Chip 
                label={type} 
                size="small" 
                sx={{ 
                  fontSize: "11px", 
                  fontWeight: 600, 
                  bgcolor: config.bgColor, 
                  color: config.color,
                  height: "20px"
                }} 
              />
              <Typography variant="caption" color="text.disabled">
                {formatTime(createdAt)}
              </Typography>
            </Box>
          </Box>
          
          <Typography variant="body2" color={read ? "text.secondary" : "text.primary"} sx={{ pr: 4 }}>
            {message}
          </Typography>
        </Box>

        {!read && (
          <Box sx={{ display: "flex", alignItems: "center", alignSelf: "center" }}>
            <Tooltip title="Mark as Read">
              <IconButton 
                size="small" 
                onClick={() => onMarkRead(id)}
                sx={{ 
                  color: config.color, 
                  bgcolor: config.bgColor,
                  "&:hover": {
                    bgcolor: config.color,
                    color: "#ffffff"
                  }
                }}
              >
                <MarkEmailReadIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </Box>
        )}

        {read && (
          <Box sx={{ display: "flex", alignItems: "center", alignSelf: "center" }}>
            <Tooltip title="Already Read">
              <IconButton 
                size="small" 
                disabled
                sx={{ color: "text.disabled" }}
              >
                <DraftsIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
