import "server-only"

import { del, put } from "@vercel/blob"
import { randomUUID } from "node:crypto"
import { mkdir, unlink, writeFile } from "node:fs/promises"
import path from "node:path"

const LOCAL_IMAGE_TYPES: Record<string, string> = {
  "image/avif": "avif",
  "image/gif": "gif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
}

export async function uploadCatalogImage(file: File, pathname: string) {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(pathname, file, { access: "public", addRandomSuffix: true })
    return { url: blob.url, alt: file.name }
  }

  if (process.env.NODE_ENV !== "development") {
    throw new Error("Image uploads require BLOB_READ_WRITE_TOKEN. Add a Vercel Blob read-write token to the production environment.")
  }

  const extension = LOCAL_IMAGE_TYPES[file.type]
  if (!extension) throw new Error("Choose a JPEG, PNG, WebP, GIF, or AVIF image.")
  const productId = path.basename(path.dirname(pathname)).replace(/[^a-zA-Z0-9_-]/g, "") || "new"
  const filename = `${randomUUID()}.${extension}`
  const relativePath = `/uploads/catalog/${productId}/${filename}`
  const destination = path.join(process.cwd(), "public", relativePath.slice(1))
  await mkdir(path.dirname(destination), { recursive: true })
  await writeFile(destination, Buffer.from(await file.arrayBuffer()), { flag: "wx" })
  return { url: relativePath, alt: file.name }
}

export async function deleteCatalogImage(url: string) {
  if (url.startsWith("/uploads/catalog/")) {
    const relativePath = url.slice(1)
    const destination = path.resolve(process.cwd(), "public", relativePath)
    const uploadRoot = path.resolve(process.cwd(), "public", "uploads", "catalog") + path.sep
    if (!destination.startsWith(uploadRoot)) throw new Error("Invalid local image path")
    await unlink(destination)
    return
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error("BLOB_READ_WRITE_TOKEN is not configured")
  await del(url)
}

export function reorderCatalogImages<T>(images: T[], from: number, to: number) {
  if (from < 0 || to < 0 || from >= images.length || to >= images.length) throw new Error("Invalid image order")
  const next = [...images]
  const [image] = next.splice(from, 1)
  next.splice(to, 0, image)
  return next
}
