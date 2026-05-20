"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import emailjs from "@emailjs/browser";
import {
  RiUser3Line,
  RiMailLine,
  RiPhoneLine,
  RiChat3Line,
  RiArrowRightLine,
  RiCheckLine,
  RiCloseLine,
  RiMapPinLine,
} from "react-icons/ri";
import { NewNavbar } from "@/components/homepage/NewNavbar";
import { NewFooter } from "@/components/homepage/NewFooter";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      setError("Contact form is not configured. Please try emailing us directly.");
      setLoading(false);
      return;
    }

    try {
      await emailjs.send(
        serviceId,
        templateId,
        {
          name: form.name,
          email: form.email,
          phone: form.phone,
          subject: form.subject,
          message: form.message,
          reply_to: form.email,
        },
        { publicKey },
      );
      setSent(true);
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (err: any) {
      setError(err?.text ?? err?.message ?? "Could not send your message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NewNavbar />
      <main className="bg-[var(--surface-1)] text-[var(--foreground)] min-h-screen pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-28">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="font-display text-4xl sm:text-5xl font-bold mb-3">Get in touch</h1>
            <p className="text-[var(--muted-foreground)] text-base sm:text-lg max-w-xl mx-auto">
              Questions, partnerships, or feedback — we&rsquo;d love to hear from you.
            </p>
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            onSubmit={handleSubmit}
            className="card space-y-5"
          >
            <div>
              <h2 className="font-semibold text-lg mb-1">Send us a message</h2>
              <p className="text-sm text-[var(--muted-foreground)]">
                We typically reply within one business day.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-1.5">Name</label>
                <div className="relative">
                  <RiUser3Line className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                  <input
                    type="text"
                    required
                    placeholder="Your full name"
                    className="input-field pl-10 w-full"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-1.5">Email</label>
                <div className="relative">
                  <RiMailLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    className="input-field pl-10 w-full"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Phone */}
              <div>
                <label className="block text-sm font-medium mb-1.5">Phone number</label>
                <div className="relative">
                  <RiPhoneLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                  <input
                    type="tel"
                    required
                    placeholder="+237 6XX XXX XXX"
                    className="input-field pl-10 w-full"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium mb-1.5">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="What's this about?"
                  className="input-field w-full"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                />
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium mb-1.5">Message</label>
              <div className="relative">
                <RiChat3Line className="absolute left-3 top-4 w-4 h-4 text-[var(--muted-foreground)]" />
                <textarea
                  required
                  rows={6}
                  placeholder="Tell us a bit more…"
                  className="input-field pl-10 w-full resize-none"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-[var(--destructive)] bg-[var(--destructive)]/10 px-4 py-2 rounded-xl">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? "Sending…" : (
                <>Send message <RiArrowRightLine className="w-4 h-4" /></>
              )}
            </button>
          </motion.form>

          {/* Location footer */}
          <p className="text-center text-xs text-[var(--muted-foreground)] mt-8 inline-flex items-center justify-center gap-1.5 w-full">
            <RiMapPinLine className="w-3.5 h-3.5" />
            Reserve237 · Available across Cameroon
          </p>
        </div>
      </main>
      <NewFooter />

      {/* ── Success modal ── */}
      <AnimatePresence>
        {sent && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F2A2A]/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSent(false)}
          >
            <motion.div
              className="relative w-full max-w-md card text-center px-6 py-8"
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSent(false)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full hover:bg-[var(--surface-1)] flex items-center justify-center text-[var(--muted-foreground)]"
                aria-label="Close"
              >
                <RiCloseLine className="w-4 h-4" />
              </button>

              <div className="w-14 h-14 mx-auto rounded-full bg-[var(--primary)] flex items-center justify-center mb-4">
                <RiCheckLine className="w-7 h-7 text-[var(--primary-foreground)]" />
              </div>
              <h2 className="font-display text-2xl font-bold mb-2">Message sent</h2>
              <p className="text-[var(--muted-foreground)] text-sm mb-6">
                Thanks for reaching out. Our team will get back to you within one business day.
              </p>

              <Link
                href="/"
                className="block w-full py-3 rounded-full bg-[#13695A] hover:bg-[#0A5C4A] text-[#F8F1EA] font-semibold transition-colors"
              >
                Back to home
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
