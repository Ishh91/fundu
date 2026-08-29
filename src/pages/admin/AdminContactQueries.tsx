import React, { useState, useEffect } from 'react';
import { Mail, Search, Phone, CheckCircle2, AlertCircle, Clock, Trash2, Send, MessageSquare } from 'lucide-react';
import { db } from '../../lib/db';

export type ContactQueryItem = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
  status?: string;
  created_at: string;
};

export default function AdminContactQueries() {
  const [queries, setQueries] = useState<ContactQueryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedQueryId, setSelectedQueryId] = useState<string | null>(null);

  const fetchQueries = async () => {
    setLoading(true);
    const { data: contactData } = await db.from<ContactQueryItem>('contact_messages').select('*').order('created_at', { ascending: false });
    const { data: ticketData } = await db.from<ContactQueryItem>('support_tickets').select('*').order('created_at', { ascending: false });
    
    const combined = [...(contactData || []), ...(ticketData || [])];
    // Deduplicate by ID or email+subject
    const uniqueMap = new Map<string, ContactQueryItem>();
    combined.forEach((item) => {
      const key = item.id || `${item.email}-${item.subject}-${item.created_at}`;
      if (!uniqueMap.has(key)) uniqueMap.set(key, item);
    });

    const list = Array.from(uniqueMap.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    setQueries(list);
    if (list.length > 0 && !selectedQueryId) {
      setSelectedQueryId(list[0].id);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQueries();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    await db.from('contact_messages').update({ status: newStatus }).eq('id', id);
    await db.from('support_tickets').update({ status: newStatus }).eq('id', id);
    setQueries((prev) => prev.map((q) => (q.id === id ? { ...q, status: newStatus } : q)));
  };

  const filteredQueries = queries.filter((q) =>
    `${q.name || ''} ${q.email || ''} ${q.subject || ''} ${q.message || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  const selectedQuery = queries.find((q) => q.id === selectedQueryId) || filteredQueries[0] || null;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="card p-6 rounded-[28px] bg-gradient-to-r from-teal-900 via-slate-900 to-emerald-950 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-500/20 border border-teal-400/30 px-3 py-1 text-xs font-black text-teal-300 uppercase tracking-wider">
            <Mail className="h-3.5 w-3.5 text-teal-400" /> Contact Us Messages & Support Queries
          </div>
          <h2 className="mt-2 font-display text-2xl font-black text-white">Customer Help & Support Queries</h2>
          <p className="mt-1 text-xs text-slate-300 font-medium">
            Manage inquiries submitted via the Contact page and website support forms.
          </p>
        </div>
        <button
          onClick={fetchQueries}
          className="btn text-xs px-4 py-2 bg-teal-500 hover:bg-teal-600 text-slate-950 font-black rounded-xl shadow-md transition"
        >
          Refresh Queries
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Queries List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="card p-3 rounded-2xl bg-white shadow-xs border border-gray-200">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-400 shrink-0 ml-1" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, subject..."
                className="w-full text-xs bg-transparent border-none focus:outline-none text-gray-900 font-medium"
              />
            </div>
          </div>

          <div className="space-y-2.5 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
            {loading ? (
              <div className="card p-8 text-center bg-white text-xs text-gray-500 font-bold">
                Loading contact queries...
              </div>
            ) : filteredQueries.length === 0 ? (
              <div className="card p-8 text-center bg-white">
                <Mail className="h-8 w-8 text-gray-300 mx-auto" />
                <p className="text-xs font-bold text-gray-700 mt-2">No contact queries found</p>
              </div>
            ) : (
              filteredQueries.map((q) => {
                const isSelected = selectedQuery?.id === q.id;
                const isResolved = q.status === 'resolved';

                return (
                  <div
                    key={q.id}
                    onClick={() => setSelectedQueryId(q.id)}
                    className={`card p-4 rounded-2xl cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#00a896] bg-teal-50/80 shadow-md ring-2 ring-[#00a896]/30'
                        : 'bg-white hover:border-teal-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-sm text-gray-900 truncate">{q.name}</p>
                      <span className={`badge text-[10px] font-bold ${isResolved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {isResolved ? 'Resolved' : 'Open'}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-teal-700 mt-0.5 truncate">{q.subject}</p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{q.message}</p>
                    <div className="mt-2.5 flex items-center justify-between text-[11px] text-gray-400 font-semibold pt-2 border-t border-gray-100">
                      <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {q.email}</span>
                      <span>{new Date(q.created_at).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Query Detail View */}
        <div className="lg:col-span-7 sticky top-6">
          {selectedQuery ? (
            <div className="card p-6 md:p-8 rounded-[28px] space-y-6 shadow-sm border border-gray-200 bg-white">
              <div className="flex items-start justify-between pb-4 border-b border-gray-100 gap-4">
                <div>
                  <span className="badge bg-teal-50 text-teal-800 font-extrabold text-xs">
                    Subject: {selectedQuery.subject}
                  </span>
                  <h2 className="font-display text-2xl font-black text-gray-900 mt-2">
                    {selectedQuery.name}
                  </h2>
                  <p className="text-xs text-gray-500 font-medium">
                    Received: {new Date(selectedQuery.created_at).toLocaleString('en-IN')}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleUpdateStatus(selectedQuery.id, selectedQuery.status === 'resolved' ? 'open' : 'resolved')}
                    className={`btn text-xs px-3.5 py-2 font-bold rounded-xl ${
                      selectedQuery.status === 'resolved'
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-teal-600 text-white hover:bg-teal-700'
                    }`}
                  >
                    {selectedQuery.status === 'resolved' ? '✓ Mark Open' : '✓ Mark Resolved'}
                  </button>
                </div>
              </div>

              {/* Contact Info Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/70 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Email Address</p>
                  <a href={`mailto:${selectedQuery.email}`} className="font-bold text-teal-700 hover:underline flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" /> {selectedQuery.email}
                  </a>
                </div>

                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/70 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Phone Number</p>
                  {selectedQuery.phone ? (
                    <a href={`tel:${selectedQuery.phone}`} className="font-bold text-gray-900 hover:underline flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-teal-600" /> {selectedQuery.phone}
                    </a>
                  ) : (
                    <span className="text-gray-400 italic">Not Provided</span>
                  )}
                </div>
              </div>

              {/* Full Message Content */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                  Message Content
                </label>
                <div className="p-5 rounded-2xl bg-slate-900 text-white text-sm leading-relaxed border border-slate-800">
                  {selectedQuery.message}
                </div>
              </div>

              {/* Reply Action */}
              <div className="pt-2">
                <a
                  href={`mailto:${selectedQuery.email}?subject=Re: ${encodeURIComponent(selectedQuery.subject)}&body=${encodeURIComponent(`Hi ${selectedQuery.name},\n\nThank you for reaching out to Fundu!\n\n`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary w-full flex items-center justify-center gap-2 bg-[#00a896] hover:bg-[#008f80] py-3 text-xs font-bold"
                >
                  <Send className="h-4 w-4" /> Reply to Customer via Email
                </a>
              </div>
            </div>
          ) : (
            <div className="card p-12 text-center bg-white rounded-[28px] border border-gray-200">
              <Mail className="h-12 w-12 text-gray-300 mx-auto" />
              <h3 className="font-display text-lg font-bold text-gray-900 mt-3">No Query Selected</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
