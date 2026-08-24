import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, HelpCircle, PhoneCall, BadgeIndianRupee, Store, Wrench, ArrowRight } from 'lucide-react';

const FAQ_CATEGORIES = [
  { id: 'all', label: 'All FAQs' },
  { id: 'sell', label: 'Selling Phone', icon: BadgeIndianRupee },
  { id: 'buy', label: 'Buying Refurbished', icon: Store },
  { id: 'repair', label: 'Doorstep Repair', icon: Wrench },
];

const DETAILED_FAQS = [
  {
    category: 'sell',
    q: 'How does Fundu calculate the resale value of my old phone?',
    a: 'Our smart valuation algorithm evaluates your device model, storage, screen touch status, physical condition, battery health, and original accessories (bill/box/charger) against real-time Lucknow market demand to give you the highest guaranteed price.',
  },
  {
    category: 'sell',
    q: 'When and how do I receive payment for selling my phone in Lucknow?',
    a: 'Payment is 100% instant! Our Lucknow pickup executive inspects your device at your doorstep and transfers UPI (Google Pay, PhonePe, Paytm), IMPS Bank Transfer, or Cash into your hands on the spot before leaving.',
  },
  {
    category: 'sell',
    q: 'Is doorstep pickup really free across all Lucknow localities?',
    a: 'Yes, 100% free! Whether you are located in Gomti Nagar, Hazratganj, Indira Nagar, Aliganj, Mahanagar, Ashiyana, or any other area in Lucknow, there are zero pickup or convenience fees.',
  },
  {
    category: 'sell',
    q: 'Why is IMEI verification needed when selling?',
    a: 'IMEI verification ensures legal compliance, verifies device ownership, and confirms that the device is not blacklisted or reported lost, ensuring safety for all parties.',
  },
  {
    category: 'buy',
    q: 'What is the 32-Point Quality Inspection for refurbished phones?',
    a: 'Every refurbished phone on Fundu undergoes a 32-point technical audit covering display pixels, touch responsiveness, front & rear cameras, speaker, microphone, battery health (minimum 85%+), Wi-Fi, Face ID / fingerprint unlock, and port connectivity.',
  },
  {
    category: 'buy',
    q: 'What warranty is provided on refurbished smartphones?',
    a: 'All refurbished phones come with a 6-month comprehensive replacement warranty backed by Fundu, along with dedicated customer support across Lucknow.',
  },
  {
    category: 'buy',
    q: 'What is the difference between Superb, Good, and Fair conditions?',
    a: 'Superb means flawless/like-new condition with minimal to zero visible scratches. Good has minor micro-scratches on the body but perfect display. Fair has visible signs of previous usage with 100% fully functional hardware.',
  },
  {
    category: 'repair',
    q: 'How does 30-minute doorstep mobile repair work in Lucknow?',
    a: 'You select your mobile brand, model, and issue (e.g. cracked screen or dead battery). Our certified technician arrives at your chosen home or office slot with specialized tools and repairs the phone right in front of you within 20-30 minutes.',
  },
  {
    category: 'repair',
    q: 'What warranty do I get on doorstep screen and battery replacements?',
    a: 'Screen and battery replacements come with up to 6 months of replacement warranty. If you face any touch or display issues within the warranty period, we fix it for free.',
  },
  {
    category: 'repair',
    q: 'Are the spare parts used during repair genuine and tested?',
    a: 'Yes! We only use grade-A certified, OEM-compliant, and rigorously tested replacement screens, batteries, charging ports, and camera lenses.',
  },
];

export default function FaqSection() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filteredFaqs =
    activeCategory === 'all'
      ? DETAILED_FAQS
      : DETAILED_FAQS.filter((f) => f.category === activeCategory);

  return (
    <section className="container-page py-8">
      <div className="rounded-3xl border border-white/80 bg-white/85 p-6 sm:p-8 md:p-10 shadow-[0_16px_40px_rgba(0,0,0,0.04)] backdrop-blur-xl">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          {/* Left Summary Box */}
          <div className="flex flex-col justify-between rounded-2xl bg-white/80 p-6 border border-white/90 shadow-sm">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-teal-700">
                <HelpCircle className="h-3.5 w-3.5" />
                Frequently Asked Questions
              </div>
              <h2 className="mt-3 font-display text-2xl sm:text-3xl font-extrabold text-gray-900">
                Everything You Need to Know About Fundu
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
                Got questions about selling, buying refurbished, or booking doorstep repair in Lucknow? We've got you covered.
              </p>

              {/* Category selector pills */}
              <div className="mt-6 flex flex-wrap gap-2">
                {FAQ_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setActiveCategory(cat.id);
                      setOpenIndex(0);
                    }}
                    className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                      activeCategory === cat.id
                        ? 'bg-teal-500 text-white shadow-sm'
                        : 'bg-white border border-gray-200 text-gray-700 hover:border-teal-300'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Helpline Box */}
            <div className="mt-8 rounded-xl bg-white p-4 border border-gray-200">
              <p className="text-xs font-bold text-gray-900">Still have questions?</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Our Lucknow support desk is available 7 days a week (9 AM - 9 PM).
              </p>
              <div className="mt-3 flex items-center justify-between">
                <a
                  href="tel:+919876543210"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800"
                >
                  <PhoneCall className="h-3.5 w-3.5" /> Call +91 98765 43210
                </a>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-1 text-xs font-bold text-gray-700 hover:text-teal-600"
                >
                  Contact Form <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* Right Accordion List */}
          <div className="space-y-3">
            {filteredFaqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={index}
                  className={`rounded-2xl border transition-all duration-200 ${
                    isOpen
                      ? 'border-teal-400 bg-teal-50/20 shadow-sm'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="flex w-full items-start justify-between gap-4 p-4 text-left"
                  >
                    <span className="text-sm font-bold text-gray-900 leading-snug">{faq.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 mt-0.5 ${
                        isOpen ? 'rotate-180 text-teal-600' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs leading-relaxed text-gray-600 border-t border-teal-100/60 mt-1">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
