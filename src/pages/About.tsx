import { Link } from 'react-router-dom';
import { Smartphone, Truck, ShieldCheck, Wrench, Users, MapPin, Award, Heart, Target, Eye } from 'lucide-react';

export default function About() {
  return (
    <div>
      <section className="gradient-mesh">
        <div className="container-page py-16 md:py-24 text-center">
          <p className="text-sm font-bold uppercase tracking-wider text-brand-600">About Fundu</p>
          <h1 className="mt-3 font-display text-4xl md:text-5xl font-extrabold text-ink-900 text-balance max-w-3xl mx-auto">
            Lucknow's most trusted phone marketplace & repair service
          </h1>
          <p className="mt-5 max-w-2xl mx-auto text-lg text-ink-600">
            Born in the heart of Lucknow, Fundu makes buying, selling, and repairing smartphones effortless — with free doorstep pickup & drop across the city.
          </p>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="grid gap-10 lg:grid-cols-2 items-center">
          <div>
            <h2 className="font-display text-3xl font-extrabold text-ink-900">Our story</h2>
            <p className="mt-4 text-ink-600 leading-relaxed">
              Fundu started with a simple frustration: getting a phone fixed or sold in Lucknow meant haggling at markets, traveling across the city, and never quite knowing if you got a fair deal.
            </p>
            <p className="mt-3 text-ink-600 leading-relaxed">
              We built Fundu to change that. Transparent pricing, certified refurbished phones, genuine spare parts, and expert technicians who come to your door — whether you live in Gomti Nagar, Hazratganj, or the far corners of Telibagh.
            </p>
            <p className="mt-3 text-ink-600 leading-relaxed">
              Today, we serve thousands of happy customers across Lucknow with a promise: fair prices, genuine parts, and free doorstep service, always.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Users, value: '3,100+', label: 'Customers served' },
              { icon: Wrench, value: '5,800+', label: 'Repairs completed' },
              { icon: Smartphone, value: '2,400+', label: 'Phones sold' },
              { icon: Award, value: '4.8/5', label: 'Average rating' },
            ].map((s) => (
              <div key={s.label} className="card p-6">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600"><s.icon className="h-5 w-5" /></div>
                <p className="mt-3 font-display text-3xl font-extrabold text-ink-900">{s.value}</p>
                <p className="text-sm text-ink-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink-100/30 py-16">
        <div className="container-page">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-sm font-bold uppercase tracking-wider text-brand-600">Our values</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold text-ink-900">What we stand for</h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              { icon: Heart, title: 'Customer first', desc: 'Every decision starts with what\'s best for our customers. Fair prices, honest advice, no pushy upsells.' },
              { icon: ShieldCheck, title: 'Trust & transparency', desc: 'Certified phones, genuine parts, and clear pricing. What you see is exactly what you get.' },
              { icon: Truck, title: 'Doorstep convenience', desc: 'We come to you. Free pickup and drop across all of Lucknow — no travel, no hassle.' },
            ].map((v) => (
              <div key={v.title} className="card p-6">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-600"><v.icon className="h-6 w-6" /></div>
                <h3 className="mt-4 font-display text-lg font-bold text-ink-900">{v.title}</h3>
                <p className="mt-1.5 text-sm text-ink-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="grid gap-10 md:grid-cols-2">
          <div className="card p-8">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-accent-50 text-accent-600"><Target className="h-6 w-6" /></div>
            <h2 className="mt-4 font-display text-2xl font-extrabold text-ink-900">Our Mission</h2>
            <p className="mt-3 text-ink-600 leading-relaxed">
              To make smartphone ownership effortless and affordable for every resident of Lucknow — whether you're buying your first phone, upgrading to the latest model, or getting a cracked screen fixed.
            </p>
          </div>
          <div className="card p-8">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-600"><Eye className="h-6 w-6" /></div>
            <h2 className="mt-4 font-display text-2xl font-extrabold text-ink-900">Our Vision</h2>
            <p className="mt-3 text-ink-600 leading-relaxed">
              To become Uttar Pradesh's most trusted smartphone marketplace — known for fair pricing, genuine products, and service that comes to your door.
            </p>
          </div>
        </div>
      </section>

      <section className="container-page pb-16">
        <div className="surface-panel p-10 md:p-14 text-center">
          <MapPin className="mx-auto h-10 w-10 text-brand-400" />
          <h2 className="mt-4 font-display text-3xl font-extrabold">Proudly based in Lucknow</h2>
          <p className="mt-3 text-ink-300">Serving all areas — from Hazratganj to Gomti Nagar, Aliganj to Telibagh.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/contact" className="btn border border-ink-200 bg-ink-100 px-5 py-3 text-ink-900 hover:bg-ink-200">Get in Touch</Link>
            <Link to="/buy" className="btn border border-ink-200 bg-ink-200/40 px-5 py-3 text-ink-900 hover:bg-ink-200">Browse Phones</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
