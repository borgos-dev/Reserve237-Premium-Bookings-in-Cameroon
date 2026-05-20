import Link from "next/link";
import { NewNavbar } from "@/components/homepage/NewNavbar";
import { NewFooter } from "@/components/homepage/NewFooter";
import {
  RiShieldLine,
  RiFlashlightLine,
  RiLineChartLine,
  RiTeamLine,
  RiCalendarLine,
  RiMoneyDollarCircleLine,
  RiArrowRightLine,
} from "react-icons/ri";

const features = [
  {
    icon: RiShieldLine,
    title: "Build Trust",
    description: "Get a verified badge displayed on your listing, showing customers you're a trusted partner.",
  },
  {
    icon: RiFlashlightLine,
    title: "Easy Setup",
    description: "List your business in under 10 minutes. No technical skills required.",
  },
  {
    icon: RiLineChartLine,
    title: "Grow Revenue",
    description: "Fill empty time slots effortlessly with real-time booking notifications.",
  },
  {
    icon: RiTeamLine,
    title: "Quality Customers",
    description: "Access a vetted, engaged audience actively looking for premium experiences.",
  },
  {
    icon: RiCalendarLine,
    title: "Smart Scheduling",
    description: "Manage availability, reservations, and cancellations from one dashboard.",
  },
  {
    icon: RiMoneyDollarCircleLine,
    title: "Transparent Pricing",
    description: "Simple, fair pricing with no hidden fees. You keep what you earn.",
  },
];

const stats = [
  { value: "500+", label: "Active Listings" },
  { value: "12K+", label: "Monthly Bookings" },
  { value: "4.8★", label: "Average Rating" },
  { value: "98%", label: "Partner Satisfaction" },
];

export default function BusinessPage() {
  return (
    <main className="bg-[var(--background)] text-[var(--foreground)] min-h-screen">
      <NewNavbar />

      {/* Hero */}
      <section className="relative min-h-[75vh] flex items-center justify-center overflow-hidden pt-24">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--surface-1)] via-[var(--surface-2)] to-[var(--surface-1)]" />
        <div className="absolute top-20 left-10 w-96 h-96 bg-[var(--primary)] rounded-full blur-[128px] opacity-10 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[var(--primary)] rounded-full blur-[128px] opacity-10 animate-pulse" style={{ animationDelay: "1s" }} />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
            Grow Your Business
            <br />
            <span className="text-[var(--primary)]">With Reserve237</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-[var(--muted-foreground)] max-w-2xl mx-auto mb-10">
            Join hundreds of verified partners — restaurants, hotels, event venues, and more —
            reaching thousands of customers across Cameroon every day.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/business/sign-up"
              className="btn-primary px-8 py-4 text-base flex items-center justify-center gap-2"
            >
              Become a Partner
              <RiArrowRightLine className="w-4 h-4" />
            </Link>
            <Link
              href="/business/sign-in"
              className="btn-secondary px-8 py-4 text-base"
            >
              Partner Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-4xl font-bold text-[var(--primary)] mb-1">{s.value}</p>
                <p className="text-sm text-[var(--muted-foreground)]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Everything You Need</h2>
            <p className="text-[var(--muted-foreground)] text-lg max-w-2xl mx-auto">
              Tools and visibility to fill your bookings and grow your revenue
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="card">
                  <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-2xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-[var(--primary)]" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                  <p className="text-[var(--muted-foreground)] text-sm leading-relaxed">{f.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-b from-[var(--surface-1)] to-[var(--surface-2)]">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-[var(--muted-foreground)] mb-8">
            Create your partner account today and start receiving bookings within minutes.
          </p>
          <Link
            href="/business/sign-up"
            className="btn-primary px-10 py-4 text-lg inline-flex items-center gap-2"
          >
            Create Partner Account
            <RiArrowRightLine className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <NewFooter />
    </main>
  );
}
