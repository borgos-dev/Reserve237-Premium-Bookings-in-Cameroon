"use client";

import { useState } from "react";
import {
  RiDashboardLine,
  RiCalendarEventLine,
  RiBuilding2Line,
  RiTimeLine,
  RiSettings4Line,
  RiLogoutBoxRLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiStarFill,
  RiNotification3Line,
  RiSearchLine,
  RiMoreLine,
  RiCheckboxCircleFill,
  RiCloseCircleFill,
  RiTimer2Line,
  RiBankCardLine,
  RiArrowRightUpLine,
  RiEyeLine,
  RiCameraLine,
  RiChat3Line,
  RiMegaphoneLine,
  RiFileList3Line,
  RiWalletLine,
  RiMenuLine,
  RiCloseLine,
} from "react-icons/ri";
import { cn } from "@/lib/utils";

type BookingStatus = "confirmed" | "pending" | "cancelled";
interface Booking {
  id: string; customer: string; initials: string; color: string;
  type: string; date: string; time: string; guests: number;
  amount: number; status: BookingStatus;
}

const BOOKINGS: Booking[] = [
  { id:"B001", customer:"Nathalie Kamga",  initials:"NK", color:"#1A6643", type:"Table · Dinner", date:"Today",    time:"7:30 PM",  guests:4, amount:14000, status:"confirmed" },
  { id:"B002", customer:"Eric Mbarga",     initials:"EM", color:"#1b5fa8", type:"Table · Lunch",  date:"Today",    time:"1:00 PM",  guests:2, amount:7000,  status:"pending"   },
  { id:"B003", customer:"Astrid Tchamba", initials:"AT", color:"#C8922A", type:"Table · Dinner", date:"Today",    time:"8:00 PM",  guests:6, amount:21000, status:"confirmed" },
  { id:"B004", customer:"Bernard Fote",   initials:"BF", color:"#C0441C", type:"Table · Brunch", date:"Today",    time:"11:00 AM", guests:3, amount:10500, status:"cancelled" },
  { id:"B005", customer:"Grace Njoya",    initials:"GN", color:"#5a3fa0", type:"Table · Dinner", date:"Tomorrow", time:"9:00 PM",  guests:5, amount:17500, status:"confirmed" },
  { id:"B006", customer:"Paul Essomba",   initials:"PE", color:"#8B4513", type:"Table · Lunch",  date:"Tomorrow", time:"12:30 PM", guests:2, amount:7000,  status:"pending"   },
];

const WEEK = [
  { day:"Mon", h:55 }, { day:"Tue", h:75 }, { day:"Wed", h:40 },
  { day:"Thu", h:92 }, { day:"Fri", h:100 }, { day:"Sat", h:82 }, { day:"Sun", h:62 },
];

const NAV = [
  { Icon: RiDashboardLine,      label: "Overview",     id: "overview"     },
  { Icon: RiCalendarEventLine,  label: "Bookings",     id: "bookings",     badge: 3 },
  { Icon: RiBuilding2Line,      label: "My Listings",  id: "listings"     },
  { Icon: RiTimeLine,           label: "Availability", id: "availability" },
  { Icon: RiSettings4Line,      label: "Settings",     id: "settings"     },
];

const QUICK_ACTIONS = [
  { Icon: RiCameraLine,     label: "Update photos"  },
  { Icon: RiTimeLine,       label: "Edit hours"     },
  { Icon: RiChat3Line,      label: "Reply reviews"  },
  { Icon: RiMegaphoneLine,  label: "Run promo"      },
  { Icon: RiFileList3Line,  label: "Update menu"    },
  { Icon: RiWalletLine,     label: "Withdraw funds" },
];

const fmt = (n: number) => new Intl.NumberFormat("fr-CM").format(n) + " XAF";

function StatusBadge({ status }: { status: BookingStatus }) {
  const m = {
    confirmed: { label:"Confirmed", Icon: RiCheckboxCircleFill, cls:"bg-[#1A6643]/15 text-[#1A6643]" },
    pending:   { label:"Pending",   Icon: RiTimer2Line,         cls:"bg-[#C8922A]/15 text-[#C8922A]" },
    cancelled: { label:"Cancelled", Icon: RiCloseCircleFill,    cls:"bg-[#C0441C]/15 text-[#C0441C]" },
  }[status];
  const Icon = m.Icon;
  return (
    <span className={cn("inline-flex items-center gap-1 text-[10.5px] font-semibold px-2.5 py-1 rounded-full", m.cls)}>
      <Icon size={12} />{m.label}
    </span>
  );
}

export default function MerchantDashboard() {
  const [active, setActive] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div
      className="flex bg-[#0A0906] overflow-hidden pt-24 relative"
      style={{ fontFamily: "'Inter', sans-serif", height: "100vh" }}
    >

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="md:hidden fixed inset-0 top-24 bg-black/60 z-20"
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={cn(
          "w-[240px] shrink-0 flex flex-col bg-[#0D0B09] border-r border-white/5",
          "fixed md:static top-24 bottom-0 left-0 z-30 md:z-auto transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        {/* Brand strip */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-white/5">
          <p className="text-[10px] font-bold tracking-[2px] uppercase text-white/30">
            Partner Dashboard
          </p>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-white/40 hover:text-white/80 transition-colors"
          >
            <RiCloseLine size={20} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 py-5 px-3 flex flex-col gap-1">
          <p className="text-[9px] font-bold tracking-[1.8px] uppercase text-white/20 px-2 mb-2 mt-1">Main</p>
          {NAV.map(({ Icon, label, id, badge }) => (
            <button
              key={id}
              onClick={() => { setActive(id); setSidebarOpen(false); }}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all w-full text-left border-l-2",
                active === id
                  ? "bg-[#C8922A]/12 text-[#C8922A] border-[#C8922A]"
                  : "text-white/45 hover:text-white/85 hover:bg-white/5 border-transparent"
              )}
            >
              <Icon size={18} className="shrink-0" />
              <span className="flex-1">{label}</span>
              {badge && (
                <span className="bg-[#C8922A] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* User footer */}
        <div className="p-3 border-t border-white/5">
          <div className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors">
            <div className="w-9 h-9 rounded-full bg-[#C8922A] flex items-center justify-center text-white text-xs font-bold shrink-0">PT</div>
            <div className="flex-1 min-w-0">
              <p className="text-white/85 text-xs font-semibold truncate">Papa Tala</p>
              <p className="text-[#C8922A] text-[10px]">Pro Partner</p>
            </div>
            <RiLogoutBoxRLine size={15} className="text-white/30 hover:text-white/70" />
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Topbar */}
        <header className="h-20 bg-[#0D0B09] border-b border-white/5 flex items-center justify-between px-4 sm:px-6 md:px-8 shrink-0 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-white/5 text-white/70 shrink-0"
            >
              <RiMenuLine size={20} />
            </button>
            <div className="min-w-0">
              <h1 style={{ fontFamily:"'Playfair Display', serif" }} className="text-white text-base sm:text-lg md:text-xl font-bold truncate">
                Good morning, Papa Tala
              </h1>
              <p className="text-white/35 text-[10px] sm:text-xs mt-0.5 truncate">Saturday, 17 May 2026 · Bonapriso, Douala</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="hidden lg:flex items-center gap-2 bg-white/5 border border-white/8 rounded-full px-4 py-2">
              <div className="w-6 h-3.5 bg-[#1A6643] rounded-full relative cursor-pointer">
                <div className="absolute right-0.5 top-0.5 w-2.5 h-2.5 bg-white rounded-full" />
              </div>
              <span className="text-white/60 text-xs font-medium">Accepting bookings</span>
            </div>
            <button className="relative w-10 h-10 bg-white/5 border border-white/8 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors">
              <RiNotification3Line size={17} className="text-white/65" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#C0441C] rounded-full border border-[#0D0B09]" />
            </button>
            <button className="bg-[#C8922A] hover:bg-[#E8B84B] text-white text-xs sm:text-sm font-semibold px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl transition-colors whitespace-nowrap">
              + New slot
            </button>
          </div>
        </header>

        {/* Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-[#0F0D0A]">

          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            {[
              { label:"Today's Bookings",  value:"14",      suffix:"",    sub:"+3 from yesterday",    trend:"up",      Icon: RiCalendarEventLine },
              { label:"Revenue This Week", value:"142,500", suffix:"XAF", sub:"+18% vs last week",    trend:"up",      Icon: RiBankCardLine      },
              { label:"Average Rating",    value:"4.9",     suffix:"★",   sub:"Based on 128 reviews", trend:"neutral", Icon: RiStarFill          },
              { label:"Profile Views",     value:"1,204",   suffix:"",    sub:"-4% this week",        trend:"down",    Icon: RiEyeLine           },
            ].map((s, i) => {
              const Icon = s.Icon;
              return (
                <div key={i} className="bg-[#141210] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[10.5px] font-semibold tracking-[0.8px] uppercase text-white/35">{s.label}</p>
                    <div className="w-9 h-9 rounded-xl bg-[#C8922A]/10 flex items-center justify-center">
                      <Icon size={17} className="text-[#C8922A]" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1.5 mb-2">
                    <span style={{ fontFamily:"'Playfair Display', serif" }} className="text-2xl font-bold text-white tracking-tight">{s.value}</span>
                    {s.suffix && <span className={cn("text-lg font-bold", s.suffix === "★" ? "text-[#C8922A]" : "text-white/40")}>{s.suffix}</span>}
                  </div>
                  <div className={cn("flex items-center gap-1 text-xs font-medium",
                    s.trend === "up" ? "text-[#1A6643]" : s.trend === "down" ? "text-[#C0441C]" : "text-white/35"
                  )}>
                    {s.trend === "up"   && <RiArrowUpLine   size={12} />}
                    {s.trend === "down" && <RiArrowDownLine size={12} />}
                    {s.sub}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Content grid */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-5">

            {/* LEFT column */}
            <div className="space-y-5 min-w-0">

              {/* Weekly spark */}
              <div className="bg-[#141210] border border-white/5 rounded-2xl p-6 flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-xs text-white/40">This week</p>
                  <h3 style={{ fontFamily:"'Playfair Display', serif" }} className="text-white font-bold text-xl">Bookings overview</h3>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-56 h-14 bg-white/3 rounded-lg flex items-end gap-1 px-2 py-2">
                    {WEEK.map((d) => (
                      <div key={d.day} className="flex-1 h-full flex items-end">
                        <div style={{ height: `${d.h}%` }} className="w-full bg-gradient-to-b from-[#C8922A] to-transparent rounded-t-md" />
                      </div>
                    ))}
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-white/60">Total bookings</div>
                    <div style={{ fontFamily:"'Playfair Display', serif" }} className="text-white font-bold text-2xl">142</div>
                  </div>
                </div>
              </div>

              {/* Bookings list */}
              <div className="bg-[#141210] border border-white/5 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                  <h3 style={{ fontFamily:"'Playfair Display', serif" }} className="text-white font-bold text-base">Recent bookings</h3>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35" size={13} />
                      <input
                        placeholder="Search"
                        className="bg-white/4 text-white/75 placeholder:text-white/30 rounded-full pl-9 pr-4 py-2 text-xs outline-none w-44 focus:bg-white/8 focus:w-56 transition-all"
                      />
                    </div>
                    <button className="text-xs text-white/55 hover:text-white/85 font-medium">View all</button>
                  </div>
                </div>
                <div className="divide-y divide-white/5">
                  {BOOKINGS.map((b) => (
                    <div key={b.id} className="py-3.5 flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3 min-w-0">
                        <div style={{ backgroundColor:b.color }} className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold shrink-0">{b.initials}</div>
                        <div className="min-w-0">
                          <div className="text-sm text-white font-semibold truncate">{b.customer}</div>
                          <div className="text-xs text-white/40 truncate">{b.type} · {b.time} · {b.guests} guests</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 ml-auto">
                        <div className="text-sm text-white/85 font-semibold whitespace-nowrap">{fmt(b.amount)}</div>
                        <StatusBadge status={b.status} />
                        <button className="p-2 rounded-lg hover:bg-white/5">
                          <RiMoreLine size={15} className="text-white/40"/>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT column */}
            <div className="flex flex-col gap-5">

              {/* Mini calendar */}
              <div className="bg-[#141210] border border-white/5 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 style={{ fontFamily:"'Playfair Display', serif" }} className="text-white font-bold text-sm">May 2026</h3>
                  <div className="flex gap-1">
                    {["‹","›"].map((c) => (
                      <button key={c} className="w-7 h-7 rounded-md text-white/35 hover:text-white/80 hover:bg-white/8 transition-colors text-sm flex items-center justify-center">{c}</button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-0.5 text-center">
                  {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d) => (
                    <div key={d} className="text-[9.5px] font-bold text-white/25 py-1.5">{d}</div>
                  ))}
                  {[...Array(5)].map((_,i) => <div key={`e${i}`}/>)}
                  {[...Array(31)].map((_,i) => {
                    const day = i + 1;
                    const isToday = day === 17;
                    const hasBooking = [3,4,7,8,10,12,13,14,15,17,18,19,20,21,22,24,25,26,28].includes(day);
                    return (
                      <div key={day} className={cn("text-[11.5px] py-1.5 rounded-md cursor-pointer transition-all relative",
                        isToday ? "bg-[#C8922A] text-white font-bold" : "text-white/55 hover:bg-white/8 hover:text-white"
                      )}>
                        {day}
                        {hasBooking && !isToday && (
                          <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#1A6643] rounded-full"/>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick actions */}
              <div className="bg-[#141210] border border-white/5 rounded-2xl p-5">
                <h3 style={{ fontFamily:"'Playfair Display', serif" }} className="text-white font-bold text-sm mb-3">Quick actions</h3>
                <div className="grid grid-cols-2 gap-2">
                  {QUICK_ACTIONS.map(({ Icon, label }) => (
                    <button key={label} className="flex items-center gap-2 p-3 rounded-xl border border-white/6 bg-white/2 hover:border-[#C8922A]/40 hover:bg-[#C8922A]/5 transition-all text-left group">
                      <Icon size={16} className="text-[#C8922A] shrink-0" />
                      <span className="text-white/60 group-hover:text-white/85 text-xs font-medium transition-colors">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payments */}
              <div className="bg-[#141210] border border-white/5 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 style={{ fontFamily:"'Playfair Display', serif" }} className="text-white font-bold text-sm">Payments</h3>
                  <button className="text-[#C8922A] text-xs font-medium hover:text-[#E8B84B] transition-colors">View all</button>
                </div>
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between p-3 bg-white/3 border border-white/8 rounded-xl">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center p-1 shrink-0">
                        <img src="/mtn%20logo%20momo.png" alt="MTN MoMo" className="max-w-full max-h-full object-contain" />
                      </div>
                      <span className="text-white/85 text-xs font-semibold">MTN MoMo</span>
                    </div>
                    <span className="text-white text-sm font-bold">87,500 XAF</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/3 border border-white/8 rounded-xl">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center p-1 shrink-0">
                        <img src="/orange-money-logo-png_seeklogo-440383.png" alt="Orange Money" className="max-w-full max-h-full object-contain" />
                      </div>
                      <span className="text-white/85 text-xs font-semibold">Orange Money</span>
                    </div>
                    <span className="text-white text-sm font-bold">55,000 XAF</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-white/6">
                    <span className="text-white/35 text-xs">Pending payout</span>
                    <span style={{ fontFamily:"'Playfair Display', serif" }} className="text-white font-bold text-base">142,500 XAF</span>
                  </div>
                  <button className="w-full bg-[#C8922A] hover:bg-[#E8B84B] text-white text-xs font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                    <RiArrowRightUpLine size={14}/> Withdraw to MoMo
                  </button>
                </div>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
