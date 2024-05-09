import { db } from "../utils/db.js";
import verifyHash from "pbkdf2-wrapper/verifyHash.js";

export async function authorize(username, password, callback) {
  try {
    var users = await db.get("users");
  } catch (err) {
    throw err;
  }
  const user = users.find({ username: username });
  if (!user.value()) return callback(new Error("logInFailed")); // If return "user not found" someone can do a user listing
  const verified = await verifyHash(password, user.value()["password_hash"]);
  if (verified) {
    return callback(null, user.value());
  } else {
    return callback(new Error("logInFailed"));
  }
}

export async function isAuthorized(req, res, next) {
  if (process.env.ZU_DISABLE_AUTH === "true") {
    next();
  } else {
    if (req.token) {
      const user = await db.get("users").find({ token: req.token }).value();
      if (user) {
        next();
      } else {
        res.status(403).send({ error: "Invalid token" });
      }
    } else {
      res.status(401).send({ error: "Specify token" });
    }
  }
}

export async function isUserLoggedIn(req) {
  if (process.env.ZU_DISABLE_AUTH === "true") {
    // assuming logged in
    return true;
  }
  if (!req.token) {
    return false;
  }
  const user = await db.get("users").find({ token: req.token }).value();
  return !!user ? true : false;
}
