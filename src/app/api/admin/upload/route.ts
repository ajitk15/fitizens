import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { getAdmin, requestMeta } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { uploadsDir } from "@/db";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/avif": ".avif",
};

/**
 * Admin image upload. Files are content-hashed (stable, cacheable, query-free
 * URLs) and stored under DATA_DIR/uploads, served by /uploads/[...path].
 */
export async function POST(request: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  const ext = EXT[file.type];
  if (!ext) {
    return NextResponse.json({ error: "Only JPEG, PNG, WebP or AVIF images." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image too large (max 8 MB)." }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const name = createHash("sha1").update(buf).digest("hex").slice(0, 20) + ext;
  await fs.mkdir(uploadsDir(), { recursive: true });
  await fs.writeFile(path.join(uploadsDir(), name), buf);

  const publicPath = `/uploads/${name}`;
  const meta = await requestMeta();
  audit({
    actor: admin.email,
    action: "create",
    entityType: "upload",
    entityId: name,
    after: { path: publicPath, bytes: buf.length, type: file.type },
    ...meta,
  });
  return NextResponse.json({ path: publicPath });
}
