"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Dream, BroadcastAnnouncement, LiveReaction, MysteryDrop } from "@/types/dream";
import { createClient, SupabaseClient, RealtimeChannel } from "@supabase/supabase-js";

interface UseRealtimeDreamsOptions {
  onInsert?: (dream: Dream) => void;
  onUpdate?: (dream: Dream) => void;
  onDelete?: (id: string) => void;
  onAnnouncement?: (announcement: BroadcastAnnouncement | null) => void;
  onReaction?: (reaction: LiveReaction) => void;
  onMysteryDrop?: (drop: MysteryDrop | null) => void;
}

export function useRealtimeDreams(options: UseRealtimeDreamsOptions = {}) {
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [totalAll, setTotalAll] = useState<number | null>(null);
  const [activeAnnouncement, setActiveAnnouncement] = useState<BroadcastAnnouncement | null>(null);
  const [activeMysteryDrop, setActiveMysteryDrop] = useState<MysteryDrop | null>(null);
  const [reactions, setReactions] = useState<LiveReaction[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "supabase" | "sse" | "polling">("connecting");
  const [isLoaded, setIsLoaded] = useState(false);

  const optionsRef = useRef(options);
  optionsRef.current = options;

  const eventSourceRef = useRef<EventSource | null>(null);
  const supabaseChannelRef = useRef<RealtimeChannel | null>(null);
  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchedTimeRef = useRef<number>(0);

  // Fetch initial dreams & counts
  const fetchDreams = useCallback(async () => {
    try {
      const res = await fetch("/api/dreams", {
        headers: { "Cache-Control": "no-cache" },
        cache: "no-store",
      });
      const json = await res.json();
      if (json.success) {
        if (Array.isArray(json.data)) {
          setDreams(json.data);
        }
        const count =
          typeof json.totalVisible === "number"
            ? json.totalVisible
            : typeof json.total === "number"
            ? json.total
            : Array.isArray(json.data)
            ? json.data.length
            : 0;
        setTotalCount(count);

        const countAll = typeof json.totalAll === "number" ? json.totalAll : count;
        setTotalAll(countAll);

        if ("activeAnnouncement" in json) {
          const ann = json.activeAnnouncement as BroadcastAnnouncement | null;
          setActiveAnnouncement(ann && ann.active !== false ? ann : null);
        }

        lastFetchedTimeRef.current = Date.now();
      }

      // Also check active mystery drop status
      try {
        const dropRes = await fetch("/api/mystery-drop", { cache: "no-store" });
        const dropJson = await dropRes.json();
        if (dropJson.success) {
          setActiveMysteryDrop(dropJson.data || null);
        }
      } catch {
        // ignore
      }
    } catch (err) {
      console.warn("Failed to fetch dreams:", err);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Polling fallback mechanism (efficient, pauses when document is hidden)
  const startPolling = useCallback(() => {
    if (pollingTimerRef.current) return;
    setConnectionStatus("polling");

    const poll = async () => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") {
        return; // Don't burn CPU or Vercel requests when tab is hidden
      }
      await fetchDreams();
    };

    pollingTimerRef.current = setInterval(poll, 4000);
  }, [fetchDreams]);

  const stopPolling = useCallback(() => {
    if (pollingTimerRef.current) {
      clearInterval(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    fetchDreams();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    let supabaseClient: SupabaseClient | null = null;

    if (supabaseUrl && supabaseAnonKey) {
      try {
        supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
      } catch (err) {
        console.warn("Supabase client initialization failed:", err);
      }
    }

    if (supabaseClient) {
      // 1. DIRECT SUPABASE REALTIME (0 Vercel compute load, works across all serverless instances globally)
      try {
        const channel = supabaseClient
          .channel("dreams-live-channel")
          .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "dreams" },
            (payload) => {
              const newDream = payload.new as Dream;
              if (newDream) {
                setTotalAll((prev) => (prev !== null ? prev + 1 : 1));
                if (!newDream.hidden) {
                  setDreams((prev) => [newDream, ...prev.filter((d) => d.id !== newDream.id)]);
                  setTotalCount((prev) => (prev !== null ? prev + 1 : 1));
                  optionsRef.current.onInsert?.(newDream);
                }
              }
            }
          )
          .on(
            "postgres_changes",
            { event: "UPDATE", schema: "public", table: "dreams" },
            (payload) => {
              const updated = payload.new as Dream;
              if (updated) {
                setDreams((prev) => {
                  const wasInList = prev.some((d) => d.id === updated.id);
                  if (updated.hidden) {
                    if (wasInList) {
                      setTotalCount((c) => (c !== null && c > 0 ? c - 1 : 0));
                    }
                    return prev.filter((d) => d.id !== updated.id);
                  } else {
                    if (!wasInList) {
                      setTotalCount((c) => (c !== null ? c + 1 : 1));
                    }
                    return prev.map((d) => (d.id === updated.id ? updated : d));
                  }
                });
                optionsRef.current.onUpdate?.(updated);
              }
            }
          )
          .on(
            "postgres_changes",
            { event: "DELETE", schema: "public", table: "dreams" },
            (payload) => {
              const id = payload.old?.id;
              if (id) {
                setDreams((prev) => {
                  const wasInList = prev.some((d) => d.id === id);
                  if (wasInList) {
                    setTotalCount((c) => (c !== null && c > 0 ? c - 1 : 0));
                  }
                  return prev.filter((d) => d.id !== id);
                });
                setTotalAll((c) => (c !== null && c > 0 ? c - 1 : 0));
                optionsRef.current.onDelete?.(id);
              }
            }
          )
          .on("broadcast", { event: "announcement" }, (payload) => {
            const ann = payload.payload as BroadcastAnnouncement | null;
            const finalAnn = ann && ann.active !== false ? ann : null;
            setActiveAnnouncement(finalAnn);
            optionsRef.current.onAnnouncement?.(finalAnn);
          })
          .on("broadcast", { event: "reaction" }, (payload) => {
            const react = payload.payload as LiveReaction;
            if (react) {
              setReactions((prev) => [...prev.slice(-15), react]);
              optionsRef.current.onReaction?.(react);
            }
          })
          .on("broadcast", { event: "mystery_drop" }, (payload) => {
            const drop = payload.payload as MysteryDrop;
            setActiveMysteryDrop(drop);
            optionsRef.current.onMysteryDrop?.(drop);
          })
          .on("broadcast", { event: "mystery_claimed" }, (payload) => {
            const drop = payload.payload as MysteryDrop;
            setActiveMysteryDrop(drop);
            optionsRef.current.onMysteryDrop?.(drop);
          })
          .on("broadcast", { event: "mystery_cancel" }, () => {
            setActiveMysteryDrop(null);
            optionsRef.current.onMysteryDrop?.(null);
          })
          .subscribe((status) => {
            if (status === "SUBSCRIBED") {
              setConnectionStatus("supabase");
            } else if (status === "CLOSED" || status === "CHANNEL_ERROR") {
              startPolling();
            }
          });

        supabaseChannelRef.current = channel;
      } catch (err) {
        console.warn("Supabase channel error, falling back to SSE/Polling:", err);
        startPolling();
      }
    } else {
      // 2. SSE STREAM FOR LOCAL / SERVERLESS WITHOUT SUPABASE
      try {
        const es = new EventSource("/api/dreams/stream");
        eventSourceRef.current = es;

        es.onopen = () => {
          setConnectionStatus("sse");
          stopPolling();
        };

        es.addEventListener("connected", (event) => {
          try {
            const payload = JSON.parse(event.data);
            if ("activeAnnouncement" in payload) {
              const ann = payload.activeAnnouncement as BroadcastAnnouncement | null;
              setActiveAnnouncement(ann && ann.active !== false ? ann : null);
            }
          } catch {
            // ignore
          }
        });

        es.addEventListener("insert", (event) => {
          try {
            const newDream = JSON.parse(event.data) as Dream;
            setTotalAll((prev) => (prev !== null ? prev + 1 : 1));
            if (!newDream.hidden) {
              setDreams((prev) => [newDream, ...prev.filter((d) => d.id !== newDream.id)]);
              setTotalCount((prev) => (prev !== null ? prev + 1 : 1));
              optionsRef.current.onInsert?.(newDream);
            }
          } catch (e) {
            console.error("SSE parse insert error:", e);
          }
        });

        es.addEventListener("update", (event) => {
          try {
            const updated = JSON.parse(event.data) as Dream;
            setDreams((prev) => {
              const wasInList = prev.some((d) => d.id === updated.id);
              if (updated.hidden) {
                if (wasInList) {
                  setTotalCount((c) => (c !== null && c > 0 ? c - 1 : 0));
                }
                return prev.filter((d) => d.id !== updated.id);
              } else {
                if (!wasInList) {
                  setTotalCount((c) => (c !== null ? c + 1 : 1));
                }
                return prev.map((d) => (d.id === updated.id ? updated : d));
              }
            });
            optionsRef.current.onUpdate?.(updated);
          } catch (e) {
            console.error("SSE parse update error:", e);
          }
        });

        es.addEventListener("delete", (event) => {
          try {
            const { id } = JSON.parse(event.data) as { id: string };
            setDreams((prev) => {
              const wasInList = prev.some((d) => d.id === id);
              if (wasInList) {
                setTotalCount((c) => (c !== null && c > 0 ? c - 1 : 0));
              }
              return prev.filter((d) => d.id !== id);
            });
            setTotalAll((c) => (c !== null && c > 0 ? c - 1 : 0));
            optionsRef.current.onDelete?.(id);
          } catch (e) {
            console.error("SSE parse delete error:", e);
          }
        });

        es.addEventListener("announcement", (event) => {
          try {
            const announcement = JSON.parse(event.data) as BroadcastAnnouncement | null;
            const finalAnn = announcement && announcement.active !== false ? announcement : null;
            setActiveAnnouncement(finalAnn);
            optionsRef.current.onAnnouncement?.(finalAnn);
          } catch (e) {
            console.error("SSE parse announcement error:", e);
          }
        });

        es.addEventListener("reaction", (event) => {
          try {
            const react = JSON.parse(event.data) as LiveReaction;
            setReactions((prev) => [...prev.slice(-15), react]);
            optionsRef.current.onReaction?.(react);
          } catch (e) {
            console.error("SSE parse reaction error:", e);
          }
        });

        es.onerror = () => {
          // If SSE connection fails or times out on Vercel serverless, failover to polling smoothly
          startPolling();
        };
      } catch {
        startPolling();
      }
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (supabaseChannelRef.current && supabaseClient) {
        supabaseClient.removeChannel(supabaseChannelRef.current);
        supabaseChannelRef.current = null;
      }
      stopPolling();
    };
  }, [fetchDreams, startPolling, stopPolling]);

  return {
    dreams,
    setDreams,
    totalCount,
    setTotalCount,
    totalAll,
    activeAnnouncement,
    activeMysteryDrop,
    setActiveMysteryDrop,
    reactions,
    connectionStatus,
    isLoaded,
    refetch: fetchDreams,
  };
}
