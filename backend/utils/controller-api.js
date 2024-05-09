import axios from "axios";
import fs from "node:fs";
import os from "node:os";

const baseURL = process.env.ZU_CONTROLLER_ENDPOINT || "http://localhost:9993/";

var token;
if (process.env.ZU_CONTROLLER_TOKEN) {
  token = process.env.ZU_CONTROLLER_TOKEN;
} else if (os.platform() === "linux") {
  token = fs.readFileSync("/var/lib/zerotier-one/authtoken.secret", "utf8");
} else if (process.platform === "win32") {
  token = fs.readFileSync(
    "C:\\ProgramData\\ZeroTier\\One\\authtoken.secret",
    "utf8"
  );
} else if (process.platform === "darwin") {
  token = fs.readFileSync(
    "/Library/Application Support/ZeroTier/One/authtoken.secret",
    "utf8"
  );
} else {
  throw new Error("Please provide ZU_CONTROLLER_TOKEN in environment");
}

export const api = axios.create({
  baseURL: baseURL,
  responseType: "json",
  headers: {
    "X-ZT1-Auth": token,
  },
});
