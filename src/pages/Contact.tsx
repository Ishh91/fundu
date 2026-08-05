import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { db } from '../lib/db';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await db.from('support_tickets').insert({
      name: form.name,
      email: form.email,
      phone: form.phone || null,
      subject: form.subject,
      message: form.message,
    });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setSuccess(true);
    setForm({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  return (
    <div className="container-page py-12">
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-sm font-bold uppercase tracking-wider text-brand-600">Contact us</p>
        <h1 className="mt-2 font-display text-3xl md:text-4xl font-extrabold text-ink-900">We'd love to hear from you</h1>
        <p className="mt-3 text-ink-500">Questions, feedback, or need help with a booking? Reach out — we typically reply within a few hours.</p>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.5fr]">
        {/* Contact info */}
        <div className="space-y-4">
          {[
            { icon: MapPin, title: 'Visit us', lines: ['Hazratganj, Lucknow', 'Uttar Pradesh 226001'] },
            { icon: Phone, title: 'Call us', lines: ['+91 98765 43210', 'Mon–Sun, 10am–8pm'] },
            { icon: Mail, title: 'Email us', lines: ['hello@fundu.in', 'We reply within hours'] },
            { icon: Clock, title: 'Service hours', lines: ['Pickup: 10am–8pm daily', 'Repairs: 24–48 hr turnaround'] },
          ].map((c) => (
            <div key={c.title} className="card p-5 flex items-start gap-4">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600 shrink-0"><c.icon className="h-5 w-5" /></div>
              <div>
                <p className="font-semibold text-ink-900">{c.title}</p>
                {c.lines.map((l) => <p key={l} className="text-sm text-ink-500">{l}</p>)}
              </div>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="card p-6 md:p-8">
          {success ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-nature-100 text-nature-600">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h2 className="mt-4 font-display text-2xl font-extrabold text-ink-900">Message sent!</h2>
              <p className="mt-2 text-ink-500">Thanks for reaching out. We'll get back to you shortly.</p>
              <button onClick={() => setSuccess(false)} className="mt-6 btn-outline">Send another</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="alert-error flex items-center gap-2 p-3 text-sm">
                  <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                </div>
              )}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Name *</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" placeholder="Your name" />
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" placeholder="+91 98765 43210" />
                </div>
              </div>
              <div>
                <label className="label">Email *</label>
                <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" placeholder="you@example.com" />
              </div>
              <div>
                <label className="label">Subject *</label>
                <input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="input" placeholder="How can we help?" />
              </div>
              <div>
                <label className="label">Message *</label>
                <textarea required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="input min-h-[140px]" placeholder="Tell us more..." />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Sending...' : 'Send Message'} <Send className="h-4 w-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
