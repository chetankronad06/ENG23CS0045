import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { configureLogger, Log, expressLogger } from "logging-middleware";

dotenv.config();

const PORT = process.env.PORT || 5000;

configureLogger({
  clientId: process.env.LOG_CLIENT_ID,
  clientSecret: process.env.LOG_CLIENT_SECRET,
  email: process.env.LOG_EMAIL,
  name: process.env.LOG_NAME,
  rollNo: process.env.LOG_ROLL_NO,
  accessCode: process.env.LOG_ACCESS_CODE
});

const app = express();

app.use(cors());
app.use(express.json());
app.use(expressLogger());

let notifications = [
  { id: 1, title: "Google Placement Drive 2026", message: "Google is hiring Software Engineering Interns. Apply by June 22nd.", type: "Placement", read: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 2, title: "DBMS Course Grades Published", message: "Grades for the Database Management Systems course have been uploaded to the portal.", type: "Result", read: false, createdAt: new Date(Date.now() - 14400000).toISOString() },
  { id: 3, title: "Annual Technical Hackathon", message: "Registration is open for Assisto TechFest 24-hour Hackathon. Teams of 2-4.", type: "Event", read: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 4, title: "Microsoft Shortlisting Results", message: "Check the shortlisted candidates list for Microsoft's SWE role on the portal.", type: "Placement", read: true, createdAt: new Date(Date.now() - 172800000).toISOString() },
  { id: 5, title: "Guest Lecture: Generative AI", message: "Join the lecture on Generative AI and Agents in the Main Seminar Hall at 2 PM.", type: "Event", read: false, createdAt: new Date(Date.now() - 259200000).toISOString() },
  { id: 6, title: "Semester 5 End Sem Timetable", message: "The final exam timetable for Semester 5 has been finalized and released.", type: "Result", read: true, createdAt: new Date(Date.now() - 345600000).toISOString() },
  { id: 7, title: "Placement Orientation Session", message: "Mandatory orientation session for pre-final year placement registration tomorrow.", type: "Placement", read: true, createdAt: new Date(Date.now() - 432000000).toISOString() }
];

await Log("backend", "info", "repository", `Mock DB loaded with ${notifications.length} items`);

app.get("/api/notifications", async (req, res) => {
  try {
    const filterType = req.query.type || "All";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    await Log("backend", "info", "handler", `GET. Filter: ${filterType}, Page: ${page}`);

    let filtered = notifications;
    if (filterType !== "All") {
      filtered = notifications.filter(
        (n) => n.type.toLowerCase() === filterType.toLowerCase()
      );
    }

    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const paginatedItems = filtered.slice(startIndex, startIndex + limit);

    const unreadCount = notifications.filter((n) => !n.read).length;

    res.json({
      notifications: paginatedItems,
      total,
      totalPages: totalPages || 1,
      unreadCount
    });
  } catch (error) {
    await Log("backend", "error", "handler", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/notifications/:id/read", async (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    await Log("backend", "error", "handler", `Bad ID: ${req.params.id}`);
    return res.status(400).json({ error: "Invalid ID" });
  }

  try {
    const index = notifications.findIndex((n) => n.id === id);

    if (index === -1) {
      await Log("backend", "error", "handler", `ID ${id} not found`);
      return res.status(404).json({ error: "Not found" });
    }

    notifications[index].read = true;

    await Log("backend", "info", "service", `ID ${id} marked read`);

    res.json({
      success: true,
      message: "Marked as read",
      notification: notifications[index],
      unreadCount: notifications.filter((n) => !n.read).length
    });
  } catch (error) {
    await Log("backend", "error", "handler", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, async () => {
  await Log("backend", "info", "config", `Server listening on ${PORT}`);
  console.log(`Server running on port ${PORT}`);
});
