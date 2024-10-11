#!/usr/bin/env node
import dotenv from "dotenv";
dotenv.config();

/**
 * Module dependencies.
 */

import app from "../app.js";

console.log("zero-ui:server");
import fs from "node:fs";
import http from "node:http";
import https from "node:https";
import path from "node:path";
import * as url from "url";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

const cert_path = path.join(__dirname, "..", "tls", "fullchain.pem");
const privkey_path = path.join(__dirname, "..", "tls", "privkey.pem");

let can_read_cert = true,
  can_read_privkey = true;

if (!fs.existsSync(cert_path)) {
  console.error(`cannot read cert at ${cert_path}`);
  can_read_cert = false;
}

if (!fs.existsSync(privkey_path)) {
  console.error(`cannot read privkey at ${privkey_path}`);
  can_read_privkey = false;
}

let can_use_tls = can_read_cert && can_read_privkey;
let server;
if (can_use_tls) {
  // only start HTTP server if we cannot find cert and key.
  let option = {
    key: fs.readFileSync(privkey_path),
    cert: fs.readFileSync(cert_path),
    honorCipherOrder: true,
    minVersion: "TLSv1.3",
  };
  server = https.createServer(option, app);
  console.log("setting up TLS server");

  let reloadCert = function() {
    console.log("reloading TLS cert");
    server.setSecureContext({
      cert: fs.readFileSync(cert_path),
    });
    console.log("reload TLS cert successfully");
  };
  let reloadKey = function() {
    console.log("reloading TLS key");
    server.setSecureContext({
      key: fs.readFileSync(privkey_path),
    });
    console.log("reload TLS key successfully");
  };
  fs.watch(privkey_path, (eventType, filename) => {
    if (eventType === "change") reloadKey();
  });
  fs.watch(cert_path, (eventType, filename) => {
    if (eventType === "change") reloadCert();
  });
} else {
  server = http.createServer(app);
  console.log("setting up HTTP server");
}

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.ZU_LISTEN_PORT || "4000");
app.set("port", port);

/**
 * Listen on provided port, on all network interfaces.
 */

if (can_use_tls) {
  // only bind to all network interfaces if TLS is available.
  server.listen(port, process.env.LISTEN_ADDRESS || "0.0.0.0");
} else {
  server.listen(port, process.env.LISTEN_ADDRESS || "localhost");
}
server.on("error", onError);
server.on("listening", onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr?.port;
  console.log("Listening on " + bind);
}
