const VALID_STACKS = ["backend", "frontend"];
const VALID_LEVELS = ["debug", "info", "warn", "error", "fatal"];
const VALID_BACKEND_PACKAGES = ["cache", "controller", "cron_job", "domain", "handler", "repository", "route", "service"];
const VALID_FRONTEND_PACKAGES = ["api", "component", "hook", "page", "state", "style"];
const VALID_SHARED_PACKAGES = ["auth", "config", "middleware", "utils"];

let loggerConfig = {
  token: null,
  clientId: null,
  clientSecret: null,
  email: null,
  name: null,
  rollNo: null,
  accessCode: null,
  authUrl: "http://4.224.186.213/evaluation-service/auth",
  logUrl: "http://4.224.186.213/evaluation-service/logs"
};

export function configureLogger(config) {
  loggerConfig = { ...loggerConfig, ...config };
}

function validateLog(stack, level, pkg, message) {
  if (!VALID_STACKS.includes(stack)) {
    throw new Error("Invalid stack: " + stack);
  }
  if (!VALID_LEVELS.includes(level)) {
    throw new Error("Invalid level: " + level);
  }
  
  const isValidPackage = 
    VALID_SHARED_PACKAGES.includes(pkg) ||
    (stack === "backend" && VALID_BACKEND_PACKAGES.includes(pkg)) ||
    (stack === "frontend" && VALID_FRONTEND_PACKAGES.includes(pkg));

  if (!isValidPackage) {
    throw new Error("Invalid package: " + pkg);
  }
}

async function getOrRefreshToken() {
  if (loggerConfig.token) {
    try {
      const parts = loggerConfig.token.split(".");
      if (parts.length === 3) {
        const rawPayload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        const payload = JSON.parse(atob(rawPayload));
        const exp = payload.MapClaims?.exp || payload.exp;
        const now = Math.floor(Date.now() / 1000);
        
        if (exp && (exp - now > 30)) {
          return loggerConfig.token;
        }
      }
    } catch (e) {
      // ignored
    }
  }

  if (loggerConfig.clientId && loggerConfig.clientSecret) {
    try {
      const res = await fetch(loggerConfig.authUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loggerConfig.email,
          name: loggerConfig.name,
          rollNo: loggerConfig.rollNo,
          accessCode: loggerConfig.accessCode,
          clientID: loggerConfig.clientId,
          clientSecret: loggerConfig.clientSecret
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.access_token) {
          loggerConfig.token = data.access_token;
          return loggerConfig.token;
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  return loggerConfig.token;
}

export async function Log(stack, level, pkg, message) {
  let safeMessage = message;
  if (typeof safeMessage !== "string") {
    safeMessage = String(safeMessage);
  }
  if (safeMessage.length > 48) {
    safeMessage = safeMessage.substring(0, 45) + "...";
  }

  try {
    validateLog(stack, level, pkg, safeMessage);
  } catch (err) {
    console.error(err.message);
    throw err;
  }

  const token = await getOrRefreshToken();
  const body = { stack, level, package: pkg, message: safeMessage };

  const send = async (activeToken) => {
    const headers = { "Content-Type": "application/json" };
    if (activeToken) {
      headers["Authorization"] = `Bearer ${activeToken}`;
    }
    return await fetch(loggerConfig.logUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    });
  };

  try {
    let res = await send(token);

    if (res.status === 401 && loggerConfig.clientId) {
      loggerConfig.token = null;
      const newToken = await getOrRefreshToken();
      res = await send(newToken);
    }

    if (!res.ok) {
      return { success: false, status: res.status };
    }

    const data = await res.json();
    console.log(`[${stack.toUpperCase()}][${level.toUpperCase()}][${pkg}] ${safeMessage} (Log ID: ${data.logID})`);

    return { success: true, logID: data.logID };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export function expressLogger() {
  return (req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
      const duration = Date.now() - start;
      const message = `${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`;
      const level = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";
      
      Log("backend", level, "route", message).catch(() => {});
    });
    next();
  };
}
