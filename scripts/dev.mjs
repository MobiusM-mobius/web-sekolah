import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const nextBin = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../node_modules/next/dist/bin/next");
const args = process.argv.slice(2).filter((arg) => arg !== "--");
const child = spawn(process.execPath, [nextBin, "dev", ...args], { stdio: "inherit", env: process.env });
child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exitCode = code ?? 1;
});
