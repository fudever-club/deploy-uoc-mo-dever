import { NextRequest } from "next/server";
import { realtimeBus } from "@/lib/storage";
import { getLeaderboard, getLiveDuelState } from "@/lib/duel-storage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (event: string, data: any) => {
        try {
          const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(payload));
        } catch {
          // stream closed
        }
      };

      // 1. Send initial state on connection
      const initialLeaderboard = await getLeaderboard(10);
      sendEvent("leaderboard_update", initialLeaderboard);

      const liveState = getLiveDuelState();
      if (liveState) {
        sendEvent("live_duel", liveState);
      }

      // 2. Listen to real-time events
      const onSessionCreated = async () => {
        const updatedLeaderboard = await getLeaderboard(10);
        sendEvent("leaderboard_update", updatedLeaderboard);
      };

      const onLiveBroadcast = (broadcast: any) => {
        sendEvent("live_duel", broadcast);
      };

      const onRewardClaimed = async () => {
        const updatedLeaderboard = await getLeaderboard(10);
        sendEvent("leaderboard_update", updatedLeaderboard);
      };

      realtimeBus.on("duel:session_created", onSessionCreated);
      realtimeBus.on("duel:live_broadcast", onLiveBroadcast);
      realtimeBus.on("duel:reward_claimed", onRewardClaimed);

      // Keep-alive heartbeat every 15s
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": keepalive\n\n"));
        } catch {
          clearInterval(heartbeat);
        }
      }, 15000);

      req.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        realtimeBus.off("duel:session_created", onSessionCreated);
        realtimeBus.off("duel:live_broadcast", onLiveBroadcast);
        realtimeBus.off("duel:reward_claimed", onRewardClaimed);
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
      "X-Accel-Buffering": "no",
    },
  });
}
