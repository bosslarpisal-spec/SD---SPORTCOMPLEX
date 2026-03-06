import Link from "next/link";
import Navbar from "@/components/Navbar";

const TEAM = [
  { name: "Dr. Somchai Pradit",    role: "System Director",       emoji: "👨‍💼" },
  { name: "Asst. Prof. Nattaya",   role: "Facility Manager",      emoji: "👩‍💼" },
  { name: "Khun Preecha W.",        role: "IT Infrastructure",     emoji: "👨‍💻" },
  { name: "Khun Siriporn T.",       role: "Student Affairs",       emoji: "👩‍🎓" },
];

const FACILITIES_SUMMARY = [
  { label: "Sports Fields",     count: "12+", emoji: "⚽" },
  { label: "Exercise Rooms",    count: "8",   emoji: "🏋️" },
  { label: "Study Spaces",      count: "24",  emoji: "📚" },
  { label: "Membership Plans",  count: "4",   emoji: "🎫" },
];

const FAQS = [
  {
    q: "Who can book facilities?",
    a: "All registered KMITL students, staff, and faculty members with an active student/staff ID can book facilities through this system.",
  },
  {
    q: "How far in advance can I book?",
    a: "You can book facilities up to 7 days in advance. Memberships allow priority booking up to 14 days ahead.",
  },
  {
    q: "What is the cancellation policy?",
    a: "Reservations can be cancelled up to 2 hours before the booking start time. Late cancellations may affect future booking privileges.",
  },
  {
    q: "Are there any fees?",
    a: "Most facility bookings are free for students. Some premium facilities and memberships may require a small fee payable at the front desk.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#f4f4f4] font-sans">
      <Navbar />

      <div className="pt-16">
        {/* Hero */}
        <div className="bg-white border-b border-neutral-200">
          <div className="max-w-4xl mx-auto px-6 py-14 text-center">
            <div className="inline-flex items-center gap-2 bg-[#eef2ff] text-[#3b6ef6] text-xs font-bold px-4 py-2 rounded-full mb-5">
              🏛️ King Mongkut's Institute of Technology Ladkrabang
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-neutral-900 tracking-tight mb-4">
              About the Reservation System
            </h1>
            <p className="text-base text-neutral-500 max-w-2xl mx-auto leading-relaxed">
              The KMITL Facility Reservation System is an official platform designed to
              simplify how students, staff, and faculty book sports, exercise, and
              coworking spaces across campus.
            </p>
            <Link href="/facility"
              className="inline-block mt-6 px-6 py-3 bg-[#3b6ef6] text-white text-sm font-bold rounded-xl hover:bg-[#2a5ce0] transition-colors shadow-md shadow-blue-200">
              Explore Facilities
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {FACILITIES_SUMMARY.map(s => (
              <div key={s.label} className="bg-white rounded-2xl p-6 border border-neutral-100 text-center hover:shadow-md transition-all">
                <div className="text-3xl mb-2">{s.emoji}</div>
                <div className="text-2xl font-extrabold text-[#3b6ef6] mb-1">{s.count}</div>
                <div className="text-xs font-semibold text-neutral-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Mission */}
        <div className="max-w-4xl mx-auto px-6 pb-10">
          <div className="bg-white rounded-3xl p-8 border border-neutral-100">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-xl font-extrabold text-neutral-900 tracking-tight mb-4">Our Mission</h2>
                <p className="text-sm text-neutral-500 leading-relaxed mb-4">
                  We believe that access to quality facilities should be effortless. Our system
                  eliminates paperwork and long queues by letting you book any campus resource
                  in seconds — from your phone or laptop.
                </p>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  Built and maintained by the KMITL IT department in collaboration with
                  Student Affairs and the Sports Complex administration.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: "⚡", label: "Instant Booking" },
                  { icon: "📱", label: "Mobile Friendly" },
                  { icon: "🔒", label: "Secure & Private" },
                  { icon: "📋", label: "Real-time Slots" },
                ].map(f => (
                  <div key={f.label} className="flex items-center gap-3 bg-[#f4f4f4] rounded-xl px-4 py-3">
                    <span className="text-xl">{f.icon}</span>
                    <span className="text-xs font-semibold text-neutral-700">{f.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="max-w-4xl mx-auto px-6 pb-10">
          <h2 className="text-xl font-extrabold text-neutral-900 tracking-tight mb-5">Meet the Team</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TEAM.map(m => (
              <div key={m.name} className="bg-white rounded-2xl p-6 border border-neutral-100 text-center hover:shadow-md transition-all">
                <div className="w-14 h-14 rounded-full bg-[#eef2ff] flex items-center justify-center text-2xl mx-auto mb-3">
                  {m.emoji}
                </div>
                <div className="text-sm font-extrabold text-neutral-900 mb-1 leading-snug">{m.name}</div>
                <div className="text-xs text-neutral-400">{m.role}</div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-4xl mx-auto px-6 pb-14">
          <h2 className="text-xl font-extrabold text-neutral-900 tracking-tight mb-5">
            Frequently Asked Questions
          </h2>
          <div className="flex flex-col gap-3">
            {FAQS.map(faq => (
              <div key={faq.q} className="bg-white rounded-2xl p-6 border border-neutral-100">
                <h3 className="text-sm font-extrabold text-neutral-900 mb-2">{faq.q}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact footer */}
        <div className="bg-white border-t border-neutral-200">
          <div className="max-w-4xl mx-auto px-6 py-10 text-center">
            <h3 className="text-lg font-extrabold text-neutral-900 mb-2">Need Help?</h3>
            <p className="text-sm text-neutral-500 mb-4">
              Contact the KMITL IT Helpdesk or visit the Student Affairs office on campus.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <a href="mailto:helpdesk@kmitl.ac.th"
                className="px-5 py-2.5 bg-[#3b6ef6] text-white text-sm font-bold rounded-xl hover:bg-[#2a5ce0] transition-colors">
                📧 helpdesk@kmitl.ac.th
              </a>
              <a href="tel:+6623298000"
                className="px-5 py-2.5 bg-neutral-100 text-neutral-700 text-sm font-bold rounded-xl hover:bg-neutral-200 transition-colors">
                📞 02-329-8000
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
