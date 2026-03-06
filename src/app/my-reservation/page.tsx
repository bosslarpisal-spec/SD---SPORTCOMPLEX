// src/app/my-reservation/page.tsx (FINAL - Hide Pending Invitees)
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import PageBackground from "@/components/PageBackground";
import {
  Target,
  Globe,
  Feather,
  Disc,
  Users,
  UtensilsCrossed,
  Dumbbell,
  Award,
  Timer,
  MapPin,
  Calendar,
  Clock,
  AlertTriangle,
  ClipboardList,
  type LucideIcon,
} from "lucide-react";

interface Invitee {
  email: string;
  status: "pending" | "accepted" | "declined" | "expired";
}

interface Reservation {
  _id: string;
  id?: string;
  facilityType?: string;
  facilityName?: string;
  sport?: string;
  slot?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  timeSlot?: string;
  duration?: number;
  minPlayers?: number;
  invitees?: Invitee[];
  invitationDetails?: {
    email: string;
    name?: string;
    status: string;
    expiresAt?: string;
  }[];
  status: "upcoming" | "confirmed" | "completed" | "cancelled" | "active";
  role?: "host" | "invitee";
  countdownDeadline?: string;
  cancelledAt?: string;
  senderName?: string;
  invitationId?: string;
  inviteStatus?: string;
  expiresAt?: string;
}

const FACILITY_ICONS: Record<string, LucideIcon> = {
  sports: Target,
  coworking: Users,
  canteen: UtensilsCrossed,
  info: Dumbbell,
  membership: Award,
};

const SPORT_NAME_ICONS: Record<string, LucideIcon> = {
  "Football Field": Target,
  "Volleyball Court": Globe,
  "Badminton Court": Feather,
  "Table Tennis": Disc,
};

const STATUS_STYLES: Record<string, string> = {
  upcoming: "bg-[#FF7B00]/10 text-[#FF7B00]",
  active: "bg-[#FF7B00]/10 text-[#FF7B00]",
  confirmed: "bg-green-500/10 text-green-400",
  completed: "bg-green-500/10 text-green-400",
  cancelled: "bg-red-500/10 text-red-400",
};

const INVITEE_STYLES: Record<string, string> = {
  accepted: "bg-green-500/10 text-green-400",
  declined: "bg-red-500/10 text-red-400",
  expired: "bg-red-500/10 text-red-400",
  pending: "bg-white/10 text-white/50",
};

function InviteCountdown({
  expiresAt,
  onExpire,
}: {
  expiresAt: string;
  onExpire: () => void;
}) {
  const [timeLeft, setTimeLeft] = useState("");
  const firedRef = useRef(false);

  useEffect(() => {
    const tick = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("Expired");
        if (!firedRef.current) {
          firedRef.current = true;
          onExpire();
        }
      } else {
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${m}m ${s}s`);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt, onExpire]);

  if (!timeLeft) return null;
  const isExpired = timeLeft === "Expired";
  return (
    <span
      className={`text-[0.65rem] font-bold flex items-center gap-1 px-2 py-0.5 rounded-full
      ${isExpired ? "bg-red-500/10 text-red-400" : "bg-[#FF7B00]/10 text-[#FF7B00]"}`}
    >
      <Timer size={11} /> {isExpired ? "Offer Expired" : `Expires in ${timeLeft}`}
    </span>
  );
}

function Countdown({ deadline }: { deadline: string }) {
  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    const tick = () => {
      const diff = new Date(deadline).getTime() - Date.now();
      if (diff <= 0) {
        setRemaining("Expired");
        return;
      }
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining(`${m}m ${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadline]);

  const isExpired = remaining === "Expired";
  return (
    <span
      className={`text-[0.7rem] font-bold px-2 py-0.5 rounded-full flex items-center gap-1
      ${isExpired ? "bg-red-500/10 text-red-400" : "bg-[#FF7B00]/10 text-[#FF7B00]"}`}
    >
      <Timer size={11} /> {isExpired ? "Countdown expired" : `${remaining} left`}
    </span>
  );
}

function PendingCountdown({
  invitationDetails,
}: {
  invitationDetails: {
    email: string;
    name?: string;
    status: string;
    expiresAt?: string;
  }[];
}) {
  const [timeLeft, setTimeLeft] = useState("");
  const expiresAt = invitationDetails.find((i) => i.expiresAt)?.expiresAt;

  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("Expired");
        return;
      }
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${m}m ${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  const total = invitationDetails.length;
  const accepted = invitationDetails.filter(
    (i) => i.status === "accepted"
  ).length;
  const pending = invitationDetails.filter(
    (i) => i.status === "pending"
  ).length;
  const majority = Math.floor(total / 2) + 1;

  if (total === 0) return null;

  return (
    <div className="mt-3 pt-3 border-t border-white/[0.07]">
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">
          Waiting for confirmations
        </p>
        <div className="flex items-center gap-2">
          {timeLeft && timeLeft !== "Expired" && (
            <span className="text-[10px] font-black text-[#FF7B00] flex items-center gap-1">
              <Timer size={10} /> {timeLeft}
            </span>
          )}
          <span className="text-[10px] font-black text-white/40">
            {pending} pending
          </span>
        </div>
      </div>
      <div className="w-full bg-white/[0.08] rounded-full h-1.5 mb-1.5">
        <div
          className={`h-1.5 rounded-full transition-all duration-500 ${
            accepted >= majority ? "bg-green-500" : "bg-[#FF7B00]"
          }`}
          style={{ width: `${Math.min(100, (accepted / majority) * 100)}%` }}
        />
      </div>
      <p className="text-[10px] text-white/40 font-semibold">
        {accepted >= majority
          ? "✓ Majority accepted — reservation confirmed!"
          : `${accepted}/${majority} accepted needed${
              accepted < majority ? ` — need ${majority - accepted} more` : ""
            }`}
      </p>
    </div>
  );
}

export default function MyReservationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [list, setList] = useState<Reservation[]>([]);
  const [fetching, setFetching] = useState(true);
  const [active, setActive] = useState("All");
  const [cancelTarget, setCancelTarget] = useState<{ id: string; status: string } | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    email: string;
    id: string;
  } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (session?.user) {
      setCurrentUser({
        name: session.user.name ?? "",
        email: session.user.email ?? "",
        id: (session.user as any).id ?? "",
      });
    }
  }, [session, status, router]);

  const fetchReservations = useCallback(async () => {
    setFetching(true);
    try {
      const res = await fetch("/api/reservations");
      if (res.ok) {
        const data = await res.json();

        const combined: Reservation[] = [
          ...(data.owned ?? []).map((r: any) => ({
            ...r,
            id: r._id?.toString() || r.id,
            role: "host" as const,
          })),
          ...(data.received ?? []).map((r: any) => ({
            ...r,
            id: r._id?.toString() || r.id,
            role: "invitee" as const,
          })),
        ];

        setList(combined);

        const now = Date.now();
        combined
          .filter((r) => r.status === "cancelled" && r.cancelledAt)
          .forEach((r) => {
            const elapsed = now - new Date(r.cancelledAt!).getTime();
            const remaining = 15 * 60 * 1000 - elapsed;
            if (remaining > 0) {
              setTimeout(
                () => setList((prev) => prev.filter((x) => x._id !== r._id)),
                remaining
              );
            }
          });
      }
    } catch (err) {
      console.error("Fetch reservations failed:", err);
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    if (session) {
      fetchReservations();
    }
  }, [session, fetchReservations]);

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/reservations/${cancelTarget.id}`, {
        method: "PATCH",
      });
      if (res.ok) {
        setList((prev) =>
          prev.map((r) =>
            r._id === cancelTarget.id
              ? {
                  ...r,
                  status: "cancelled",
                  cancelledAt: new Date().toISOString(),
                }
              : r
          )
        );
        setTimeout(
          () => setList((prev) => prev.filter((r) => r._id !== cancelTarget.id)),
          15 * 60 * 1000
        );
      }
    } finally {
      setCancelling(false);
      setCancelTarget(null);
    }
  };

  const handleRespond = async (
    invitationId: string,
    response: "accepted" | "declined"
  ) => {
    try {
      const res = await fetch("/api/invitation/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invitationId, response }),
      });
      if (res.ok) {
        fetchReservations();
      }
    } catch (e) {
      console.error("Respond failed:", e);
    }
  };

  const confirmedCount = (r: Reservation) =>
    (r.invitees ?? []).filter((i) => i.status === "accepted").length;

  const isSportsConfirmed = (r: Reservation) =>
    confirmedCount(r) >= Math.ceil((r.minPlayers ?? 2) / 2);

  const safeList = Array.isArray(list) ? list : [];

  const counts = {
    upcoming: safeList.filter(
      (r) => r.status === "upcoming" || r.status === "active"
    ).length,
    completed: safeList.filter(
      (r) => r.status === "completed" || r.status === "confirmed"
    ).length,
    cancelled: safeList.filter((r) => r.status === "cancelled").length,
  };

  const tabs = [
    { key: "All", label: "All" },
    { key: "upcoming", label: "Upcoming" },
    { key: "completed", label: "Completed" },
    { key: "cancelled", label: "Cancelled" },
  ];

  const filtered = (() => {
    if (active === "All") return safeList;
    if (active === "upcoming")
      return safeList.filter((r) => r.status === "upcoming" || r.status === "active");
    if (active === "completed")
      return safeList.filter(
        (r) => r.status === "completed" || r.status === "confirmed"
      );
    if (active === "cancelled")
      return safeList.filter((r) => r.status === "cancelled");
    return safeList;
  })();

  if (status === "loading") return null;

  return (
    <PageBackground>
      <Navbar />

      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-[#141414] border border-white/[0.07] rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
            <div className="w-14 h-14 bg-[#FF7B00]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-7 h-7 text-[#FF7B00]" />
              </div>
            <h3 className="text-lg font-extrabold text-white mb-2">
              Cancel Reservation?
            </h3>
            <p className="text-sm text-white/50 mb-4">
              This cannot be undone. Your slot will be released.
              <br />
              <span className="text-xs text-white/30">
                The reservation will be removed in 15 minutes.
              </span>
            </p>
            {cancelTarget.status === "completed" && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-4 text-left">
                <p className="text-xs font-bold text-red-400">
                  <AlertTriangle size={12} className="inline mr-1" /> 24-Hour Booking Penalty
                </p>
                <p className="text-xs text-red-400/70 mt-1">
                  Cancelling a confirmed reservation will suspend your booking privileges for 24 hours.
                </p>
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setCancelTarget(null)}
                disabled={cancelling}
                className="flex-1 py-3 text-sm font-semibold text-white/70 bg-white/[0.06] hover:bg-white/[0.1] rounded-xl transition-colors"
              >
                Keep it
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 py-3 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors disabled:opacity-60"
              >
                {cancelling ? "Cancelling…" : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="pt-16">
        <div className="bg-[#111] border-b border-white/[0.07]">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <h1 className="text-2xl font-extrabold text-white tracking-tight mb-1">
              My Reservations
            </h1>
            <p className="text-sm text-white/40">
              Track and manage all your facility bookings
            </p>

            <div className="mt-5 flex gap-2 flex-wrap">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActive(tab.key)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all border
                    ${
                      active === tab.key
                        ? "bg-[#FF7B00] text-white border-[#FF7B00] shadow-btn"
                        : "bg-white/[0.04] text-white/60 border-white/10 hover:border-[#FF7B00]/50 hover:text-[#FF7B00]"
                    }`}
                >
                  {tab.label}
                  {tab.key !== "All" && (
                    <span className="ml-1 opacity-70">
                      ({counts[tab.key as keyof typeof counts]})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-8">
          {fetching ? (
            <div className="text-center py-20 text-white/40">
              <p className="font-semibold">Loading reservations…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <ClipboardList className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="font-semibold text-white/50 mb-2">
                No reservations found
              </p>
              <Link
                href="/facility"
                className="inline-block mt-2 px-5 py-2.5 bg-[#FF7B00] text-white text-sm font-bold rounded-xl hover:bg-[#e06f00] transition-colors shadow-btn"
              >
                Browse Facilities
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filtered.map((r) => {
                const isSports =
                  r.facilityType === "sports" || !!r.sport;
                const displayName = r.facilityName ?? r.sport ?? "Reservation";
                const displayTime =
                  r.startTime && r.endTime
                    ? `${r.startTime} – ${r.endTime}`
                    : r.timeSlot ?? "";
                const FacilityIcon =
                  SPORT_NAME_ICONS[displayName] ??
                  FACILITY_ICONS[r.facilityType ?? "sports"] ??
                  Target;
                const isHost = !r.role || r.role === "host";
                const accepted = confirmedCount(r);
                const sportsDone = isSportsConfirmed(r);
                const isActive =
                  r.status === "upcoming" || r.status === "active";

                return (
                  <div
                    key={r._id + (r.role ?? "")}
                    className={`bg-[#111] rounded-2xl p-5 border transition-all duration-200
                      hover:border-[#FF7B00]/30 hover:shadow-[0_0_24px_rgba(255,123,0,0.07)]
                      ${
                        r.status === "cancelled"
                          ? "opacity-50 border-white/[0.04]"
                          : "border-white/[0.07]"
                      }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#FF7B00]/10 border border-[#FF7B00]/20 flex items-center justify-center shrink-0">
                        <FacilityIcon className="w-6 h-6 text-[#FF7B00]" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-extrabold text-white text-sm">
                            {displayName}
                          </h3>

                          <span
                            className={`text-[0.7rem] font-bold px-2 py-0.5 rounded-full capitalize ${
                              STATUS_STYLES[r.status] ??
                              "bg-white/10 text-white/50"
                            }`}
                          >
                            {r.status}
                          </span>

                          {r.role === "host" && (
                            <span className="text-[0.65rem] font-black px-2 py-0.5 rounded-full bg-[#FF7B00]/10 text-[#FF7B00] border border-[#FF7B00]/20 uppercase">
                              Your Reservation
                            </span>
                          )}
                          {r.role === "invitee" && (
                            <span className="text-[0.65rem] font-black px-2 py-0.5 rounded-full bg-white/[0.06] text-white/50 border border-white/10 uppercase">
                              Invite from {r.senderName}
                            </span>
                          )}

                          {isSports &&
                            isActive &&
                            (r.invitees?.length ?? 0) > 0 && (
                              <span
                                className={`text-[0.7rem] font-bold px-2 py-0.5 rounded-full
                              ${
                                sportsDone
                                  ? "bg-green-500/10 text-green-400"
                                  : "bg-amber-500/10 text-amber-400"
                              }`}
                              >
                                {sportsDone
                                  ? "✓ Confirmed"
                                  : "Pending confirmation"}
                              </span>
                            )}

                          {r.role === "invitee" &&
                            r.expiresAt &&
                            r.inviteStatus === "pending" && (
                              <InviteCountdown
                                expiresAt={r.expiresAt}
                                onExpire={() =>
                                  handleRespond(r.invitationId!, "declined")
                                }
                              />
                            )}
                        </div>

                        {r.slot && (
                          <p className="text-xs text-white/40 mb-0.5 flex items-center gap-1">
                            <MapPin size={11} /> {r.slot}
                          </p>
                        )}
                        <p className="text-xs text-white/40 mb-0.5 flex items-center gap-1">
                          <Calendar size={11} /> {r.date} &nbsp;·&nbsp; <Clock size={11} /> {displayTime}
                          {r.duration && <> &nbsp;·&nbsp; <Timer size={11} /> {r.duration}h</>}
                        </p>

                        {isHost &&
                          isActive &&
                          r.countdownDeadline && (
                            <div className="mt-1.5 flex items-center gap-2">
                              <Countdown
                                deadline={r.countdownDeadline}
                              />
                              {r.minPlayers && (
                                <span className="text-[0.7rem] text-white/40">
                                  {accepted} /{" "}
                                  {Math.ceil(r.minPlayers / 2)} needed
                                </span>
                              )}
                            </div>
                          )}

                        {/* ✅ KEEP OLD STYLE: Invitees list - ALL invites together */}
                        {r.role === "host" &&
                          (r.invitationDetails?.length ?? 0) > 0 && (
                            <>
                              <div className="mt-3 pt-3 border-t border-white/[0.07]">
                                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">
                                  Invited Participants
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {r.invitationDetails!.map((inv, i) => (
                                    <div
                                      key={i}
                                      className="px-3 py-1 bg-white/[0.04] rounded-lg text-[10px] font-bold border border-white/[0.07] flex items-center gap-2"
                                    >
                                      <span className="text-white/60">
                                        {inv.email}
                                      </span>
                                      <span
                                        className={`text-[9px] font-black uppercase ${
                                          INVITEE_STYLES[inv.status] ??
                                          "text-white/40"
                                        }`}
                                      >
                                        ● {inv.status}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              {/* Countdown section removed per user request */}
                            </>
                          )}
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className="text-[0.68rem] font-mono text-white/20">
                          {(r._id || r.id || "").slice(-8).toUpperCase()}
                        </span>

                        {(isActive || r.status === "completed") && isHost && (
                          <button
                            onClick={() => setCancelTarget({ id: r._id, status: r.status })}
                            className="px-3 py-1.5 text-xs font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                        )}

                        {r.role === "invitee" &&
                          r.inviteStatus === "pending" &&
                          r.expiresAt &&
                          new Date() < new Date(r.expiresAt) && (
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  handleRespond(r.invitationId!, "accepted")
                                }
                                className="px-4 py-2 bg-[#FF7B00] text-white text-xs font-bold rounded-xl hover:bg-[#e06f00] transition-colors shadow-btn"
                              >
                                ✓ Accept
                              </button>
                              <button
                                onClick={() =>
                                  handleRespond(r.invitationId!, "declined")
                                }
                                className="px-4 py-2 bg-white/[0.06] text-white/60 text-xs font-bold rounded-xl hover:bg-white/[0.1] transition-colors border border-white/10"
                              >
                                ✕ Decline
                              </button>
                            </div>
                          )}

                        {r.role === "invitee" &&
                          r.inviteStatus &&
                          r.inviteStatus !== "pending" && (
                            <span
                              className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg
                            ${
                              r.inviteStatus === "accepted"
                                ? "bg-green-500/10 text-green-400"
                                : "bg-red-500/10 text-red-400"
                            }`}
                            >
                              You {r.inviteStatus}
                            </span>
                          )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {filtered.length > 0 && (
            <div className="mt-8 text-center">
              <Link
                href="/facility"
                className="inline-block px-6 py-3 bg-[#FF7B00] text-white text-sm font-bold rounded-xl hover:bg-[#e06f00] transition-colors shadow-btn"
              >
                + Book Another Facility
              </Link>
            </div>
          )}
        </div>
      </div>
    </PageBackground>
  );
}