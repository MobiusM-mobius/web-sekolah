import "server-only";
import { randomUUID } from "node:crypto";
import { chmod, mkdir, realpath, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const maxUploadMb = Number(process.env.MAX_UPLOAD_SIZE_MB ?? 5);
export const maxUploadBytes = (Number.isFinite(maxUploadMb) && maxUploadMb > 0 ? maxUploadMb : 5) * 1024 * 1024;
const uploadDirectory = path.resolve(/*turbopackIgnore: true*/ process.env.PRIVATE_UPLOAD_DIR ?? "./private-uploads");
const publicDirectory = path.resolve(process.cwd(), "public");

function assertOutsidePublic(directory: string, publicRoot: string) {
  if (directory === publicRoot || directory.startsWith(`${publicRoot}${path.sep}`)) throw new Error("Private uploads cannot be stored inside public/.");
}

async function ensurePrivateDirectory() {
  await mkdir(uploadDirectory, { recursive: true, mode: 0o700 });
  const actualDirectory = await realpath(/*turbopackIgnore: true*/ uploadDirectory);
  const actualPublicDirectory = await realpath(publicDirectory).catch(() => publicDirectory);
  assertOutsidePublic(actualDirectory, actualPublicDirectory);
  const info = await stat(actualDirectory);
  if ((info.mode & 0o077) !== 0) await chmod(actualDirectory, 0o700);
  return actualDirectory;
}

export function validateFile(file: File, allowedMimes: string[], maxSizeMb: number) {
  if (!file.size || file.size > Math.min(maxSizeMb * 1024 * 1024, maxUploadBytes)) return false;
  if (!allowedMimes.includes(file.type)) return false;
  return true;
}

export async function savePrivateFile(file: File) {
  const extension = file.type === "application/pdf" ? ".pdf" : file.type === "image/png" ? ".png" : file.type === "image/jpeg" ? ".jpg" : "";
  if (!extension) throw new Error("Jenis dokumen tidak didukung.");
  const key = `${randomUUID()}${extension}`;
  const directory = await ensurePrivateDirectory();
  await writeFile(path.join(directory, key), Buffer.from(await file.arrayBuffer()), { flag: "wx", mode: 0o600 });
  return { key, path: path.join(directory, key) };
}

export async function privateFilePath(key: string) {
  if (!/^[0-9a-f-]{36}\.(pdf|jpg|png)$/.test(key)) throw new Error("Invalid storage key");
  const directory = await ensurePrivateDirectory();
  return path.join(directory, key);
}

export async function removePrivateFile(filePath: string) {
  await unlink(filePath).catch(() => undefined);
}

export async function hasValidSignature(file: File) {
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  if (file.type === "application/pdf") return new TextDecoder().decode(bytes.slice(0, 5)) === "%PDF-";
  if (file.type === "image/png") return [137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => bytes[i] === v);
  if (file.type === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (file.type === "image/webp") return new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" && new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP";
  return false;
}
