import express from "express";
import path from "path";
import * as url from "url";
const router = express.Router();

import * as auth from "../services/auth.js";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

router.get("/:downfilename", async function (req, res) {
  const ret = await auth.isUserLoggedIn(req);
  if (ret) {
    const filename = req.params.downfilename;
    res.sendFile(
      path.join(__dirname, "..", "..", "frontend", "down_folder", filename),
      {
        dotfiles: "allow",
      }
    );
  } else {
    res
      .status(401)
      .json({ error: "401 Not authorized, must Login to download" });
  }
});

export default router;
