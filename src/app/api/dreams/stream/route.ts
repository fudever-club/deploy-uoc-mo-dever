import { NextRequest } from "next/server";
import { realtimeBus, getActiveAnnouncement } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial keep-alive ping and active announcement if any
      const initialAnnouncement = getActiveAnnouncement();
      controller.enqueue(
        encoder.encode(
          `event: connected\ndata: ${JSON.stringify({
            status: "connected",
            activeAnnouncement: initialAnnouncement,
          })}\n\n`
        )
      );

      const onInsert = (dream: unknown) => {
        controller.enqueue(
          encoder.encode(`event: insert\ndata: ${JSON.stringify(dream)}\n\n`)
        );
      };

      const onUpdate = (dream: unknown) => {
        controller.enqueue(
          encoder.encode(`event: update\ndata: ${JSON.stringify(dream)}\n\n`)
        );
      };

      const onDelete = (payload: unknown) => {
        controller.enqueue(
          encoder.encode(`event: delete\ndata: ${JSON.stringify(payload)}\n\n`)
        );
      };

      const onAnnouncement = (ann: unknown) => {
        controller.enqueue(
          encoder.encode(`event: announcement\ndata: ${JSON.stringify(ann)}\n\n`)
        );
      };

      realtimeBus.on("dream:inserted", onInsert);
      realtimeBus.on("dream:updated", onUpdate);
      realtimeBus.on("dream:deleted", onDelete);
      realtimeBus.on("announcement:broadcast", onAnnouncement);

      const interval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch {
          clearInterval(interval);
        }
      }, 15000);

      req.signal.addEventListener("abort", () => {
        clearInterval(interval);
        realtimeBus.off("dream:inserted", onInsert);
        realtimeBus.off("dream:updated", onUpdate);
        realtimeBus.off("dream:deleted", onDelete);
        realtimeBus.off("announcement:broadcast", onAnnouncement);
        try {
          controller.close();
        } catch {
          // ignore
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
