//app/ui/reservation_summary/page.tsx//
"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Calendar, Clock, Users, MapPin, Coffee, 
  Dumbbell, Trophy, Trash2, AlertCircle, Check, X, Timer 
} from "lucide-react";

export function ReservationSummary({ user, reservations, onBack, onCancelReservation, refreshData }: any) {
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const handleCancel = (id: string) => {
    onCancelReservation(id);
    setCancellingId(null);
  };

  const handleResponse = async (invitationId: string, response: string) => {
    try {
        const res = await fetch("/api/invitation/respond", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ invitationId, response }),
        });
        if (res.ok) refreshData();
    } catch (e) {
        console.error("Response failed");
    }
  };

  const exerciseReservations = reservations.filter((r: any) => r.type === "exercise" || r.facility);
  const sportsReservations = reservations.filter((r: any) => r.sport);
  const canteenReservations = reservations.filter((r: any) => r.canteen || r.totalSeats);

  const StatBox = ({ label, count }: { label: string; count: number }) => (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
      <p className="text-xs font-bold text-blue-100 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-3xl font-black text-white">{count}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <button onClick={onBack} className="text-[#0070f3] font-bold flex items-center gap-2 hover:underline">
            ← Back to Categories
          </button>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            Welcome, <span className="text-gray-900 font-bold">{user.name}</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto mt-8 px-4">
        <div className="bg-gradient-to-br from-[#0070f3] to-[#00a3ff] rounded-[2.5rem] p-10 mb-10 text-white shadow-2xl shadow-blue-100 relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-4xl font-black mb-6 tracking-tight">My Reservations</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatBox label="Total" count={reservations.length} />
              <StatBox label="Exercise" count={exerciseReservations.length} />
              <StatBox label="Sports" count={sportsReservations.length} />
              <StatBox label="Canteen" count={canteenReservations.length} />
            </div>
          </div>
        </div>

        {reservations.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-20 text-center border border-gray-100 shadow-sm">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-[#0070f3]" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">No active bookings</h2>
            <button onClick={onBack} className="mt-4 px-10 py-4 bg-[#0070f3] text-white rounded-2xl font-black shadow-lg">
              Book Now
            </button>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Sports Section */}
            {sportsReservations.length > 0 && (
              <ReservationSection title="Sports Facilities" icon={<Trophy />}>
                {sportsReservations.map((res: any) => (
                  <ReservationCard 
                    key={(res.invitationId || res._id || res.id) + (res.role || "")} 
                    res={res}
                    title={res.sport} 
                    date={res.date} 
                    time={res.timeSlot || res.time}
                    isCancelling={cancellingId === (res._id || res.id)}
                    onCancelClick={() => setCancellingId(res._id || res.id)}
                    onConfirmCancel={() => handleCancel(res._id || res.id)}
                    onAbortCancel={() => setCancellingId(null)}
                    onRespond={handleResponse}
                    extra={
                        <>
                        <div className="mt-2 flex gap-4 text-xs font-bold text-gray-400">
                             <div className="flex items-center gap-1"><Users size={14}/> {res.participants} Participants</div>
                             {res.court && <div className="flex items-center gap-1"><MapPin size={14}/> Court {res.court}</div>}
                        </div>
                        {/* Host Only: Participant status list */}
                        {res.role === 'host' && res.invitationDetails && (
                            <div className="mt-4 flex flex-col gap-2 pt-4 border-t border-gray-50">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Invited Participants</p>
                                <div className="flex flex-wrap gap-2">
                                  {res.invitationDetails.map((inv: any, i: number) => (
                                      <div key={i} className="px-3 py-1 bg-gray-50 rounded-lg text-[10px] font-bold border border-gray-100 flex items-center gap-2">
                                          <span className="text-gray-600">{inv.email}</span>
                                          <span className={`uppercase text-[9px] ${
                                            inv.status === 'accepted' ? 'text-green-500' : 
                                            inv.status === 'declined' || inv.status === 'expired' ? 'text-red-400' : 'text-orange-400'
                                          }`}>
                                            ● {inv.status === 'pending' ? 'No Response Yet' : inv.status}
                                          </span>
                                      </div>
                                  ))}
                                </div>
                            </div>
                        )}
                        </>
                    }
                  />
                ))}
              </ReservationSection>
            )}

            {/* Canteen Section */}
            {canteenReservations.length > 0 && (
              <ReservationSection title="Canteen Tables" icon={<Coffee />}>
                {canteenReservations.map((res: any) => (
                  <ReservationCard 
                    key={(res.invitationId || res._id || res.id) + (res.role || "")} 
                    res={res}
                    title={res.canteen} 
                    date="Multiple Tables Selected" 
                    time={`${res.totalSeats} Total Seats`}
                    isCancelling={cancellingId === (res._id || res.id)}
                    onCancelClick={() => setCancellingId(res._id || res.id)}
                    onConfirmCancel={() => handleCancel(res._id || res.id)}
                    onAbortCancel={() => setCancellingId(null)}
                    onRespond={handleResponse}
                    extra={
                        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
                            {res.reservations?.map((table: any, idx: number) => (
                                <div key={idx} className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
                                    <p className="text-[10px] font-black text-[#0070f3] uppercase tracking-tighter">Table {table.table}</p>
                                    <p className="text-xs font-bold text-gray-600">Seats: {table.seats.join(", ")}</p>
                                </div>
                            ))}
                        </div>
                    }
                  />
                ))}
              </ReservationSection>
            )}

            {/* Exercise Section */}
            {exerciseReservations.length > 0 && (
              <ReservationSection title="Exercise Facilities" icon={<Dumbbell />}>
                {exerciseReservations.map((res: any) => (
                  <ReservationCard 
                    key={(res.invitationId || res._id || res.id) + (res.role || "")} 
                    res={res}
                    title={res.facility} 
                    date={res.date} 
                    time={res.time}
                    isCancelling={cancellingId === (res._id || res.id)}
                    onCancelClick={() => setCancellingId(res._id || res.id)}
                    onConfirmCancel={() => handleCancel(res._id || res.id)}
                    onAbortCancel={() => setCancellingId(null)}
                    onRespond={handleResponse}
                  />
                ))}
              </ReservationSection>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function ReservationSection({ title, icon, children }: any) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 ml-2">
                <div className="w-10 h-10 bg-[#0070f3] rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
                    {icon}
                </div>
                <h2 className="text-lg font-black text-gray-900">{title}</h2>
            </div>
            <div className="space-y-4">{children}</div>
        </div>
    );
}

function ReservationCard({ res, title, date, time, extra, isCancelling, onCancelClick, onConfirmCancel, onAbortCancel, onRespond }: any) {
    const isHost = res.role === 'host';
    const [timeLeft, setTimeLeft] = useState("");
    const autoDeclinedRef = useRef(false);

    useEffect(() => {
        if (isHost || !res.expiresAt) return;
        
        const timer = setInterval(() => {
            const diff = new Date(res.expiresAt).getTime() - new Date().getTime();
            
            if (diff <= 0) {
                setTimeLeft("Expired");
                clearInterval(timer);
                
                // Automatic Decline Logic
                if (!autoDeclinedRef.current && res.invitationId) {
                    autoDeclinedRef.current = true;
                    onRespond(res.invitationId, 'declined');
                }
            } else {
                const mins = Math.floor((diff % 3600000) / 60000);
                const secs = Math.floor((diff % 60000) / 1000);
                setTimeLeft(`${mins}m ${secs}s`);
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [res.expiresAt, isHost, res.invitationId, onRespond]);

    return (
        <div className={`bg-white rounded-[2.5rem] p-8 border transition-all ${isCancelling ? 'border-red-200 ring-4 ring-red-50' : 'border-gray-100 shadow-sm'} ${res.status === 'cancelled' ? 'opacity-50 grayscale' : ''}`}>
            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                        <h3 className="text-2xl font-black text-gray-900">{title}</h3>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${isHost ? 'bg-green-50 text-green-600 border-green-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                            {isHost ? (res.status === 'cancelled' ? 'Cancelled' : 'Your Reservation') : `Invite from ${res.senderName}`}
                        </span>
                        {!isHost && timeLeft && (
                            <span className={`text-[10px] font-black flex items-center gap-1 ${timeLeft === "Expired" ? "text-red-500" : "text-orange-500 animate-pulse"}`}>
                                <Timer size={14}/> {timeLeft === "Expired" ? "Offer Expired" : `Expires in: ${timeLeft}`}
                            </span>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-6 text-sm font-bold text-gray-500">
                        <div className="flex items-center gap-2"><Calendar size={18} className="text-[#0070f3]" /> {date}</div>
                        <div className="flex items-center gap-2"><Clock size={18} className="text-[#0070f3]" /> {time}</div>
                    </div>
                    {extra}
                </div>

                <div className="w-full md:w-auto">
                    {isHost ? (
                        /* HOST INTERFACE: CANCEL BUTTON */
                        (!isCancelling ? (
                            <button onClick={onCancelClick} className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 text-red-500 font-bold hover:bg-red-50 rounded-2xl transition-colors">
                                <Trash2 size={18} /> Cancel Booking
                            </button>
                        ) : (
                            <div className="bg-red-50 p-4 rounded-2xl flex flex-col gap-3">
                                <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
                                    <AlertCircle size={16} /> Confirm Cancellation?
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={onConfirmCancel} className="bg-red-500 text-white px-4 py-2 rounded-xl text-xs font-bold">Yes</button>
                                    <button onClick={onAbortCancel} className="bg-white text-gray-600 px-4 py-2 rounded-xl text-xs font-bold border">No</button>
                                </div>
                            </div>
                        ))
                    ) : (
                        /* INVITEE INTERFACE: ACCEPT/DECLINE BUTTONS */
                        timeLeft !== "Expired" && (
                          <div className="flex gap-2">
                              <button 
                                  onClick={() => onRespond(res.invitationId, 'accepted')}
                                  className="flex items-center justify-center gap-2 px-6 py-3 bg-[#0070f3] text-white rounded-2xl font-black shadow-lg shadow-blue-100 hover:scale-105 transition-transform"
                              >
                                  <Check size={18} /> Accept
                              </button>
                              <button 
                                  onClick={() => onRespond(res.invitationId, 'declined')}
                                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-600 rounded-2xl font-black hover:bg-gray-200 transition-colors"
                              >
                                  <X size={18} /> Decline
                              </button>
                          </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
export default function Page() { return null; }
