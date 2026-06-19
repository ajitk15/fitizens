import { type NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { parseBody } from "next-sanity/webhook";
import { SANITY_TAG } from "@/sanity/client";

/**
 * Sanity publish webhook. On any content change Studio POSTs here; we verify the
 * signature (SANITY_REVALIDATE_SECRET) and expire the shared "sanity" cache tag
 * so the next visitor sees fresh content — no redeploy needed.
 *
 * Configure in Sanity: API → Webhooks → URL https://<site>/api/revalidate,
 * trigger on create/update/delete, with the same secret.
 */
export async function POST(req: NextRequest) {
  try {
    const { isValidSignature } = await parseBody<{ _type?: string }>(
      req,
      process.env.SANITY_REVALIDATE_SECRET,
    );

    if (!isValidSignature) {
      return new NextResponse("Invalid signature", { status: 401 });
    }

    // Immediate expiration is the right behaviour for an external webhook.
    revalidateTag(SANITY_TAG, { expire: 0 });

    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (err) {
    console.error("[revalidate] error:", err);
    return new NextResponse("Error revalidating", { status: 500 });
  }
}
