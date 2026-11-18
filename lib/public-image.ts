import "server-only";
import { stat } from "node:fs/promises";
import path from "node:path";

export async function publicImageUrl(url: string) {
  try {
    const file = await stat(path.join(process.cwd(), "public", url));
    return file.isFile() && file.size > 0
      ? `${url}?v=${file.mtimeMs}-${file.size}`
      : null;
  } catch (error) {
    if (
      ["ENOENT", "ENOTDIR"].includes(
        (error as NodeJS.ErrnoException).code || "",
      )
    )
      return null;
    throw error;
  }
}
