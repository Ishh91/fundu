import { Link } from 'react-router-dom';

const CATEGORIES = [
  {
    title: 'PHONES & ACCESSORIES',
    desc: 'High spec, high quality phones at affordable prices',
    image: '/assets/theme/phones_category.jpg',
    href: '/buy',
  },
  {
    title: 'COMPUTER EQUIPMENT',
    desc: 'All your desktop & laptop needs in one place',
    image: '/assets/theme/computer_category.jpg',
    href: '/buy-laptop',
  },
  {
    title: 'MISCELLANEOUS ITEMS',
    desc: "We've got it! New stuff to meet your tech needs",
    image: '/assets/theme/misc_category.jpg',
    href: '/spare-parts',
  },
];

export default function CanvaCategorySection() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-24">
      <div className="container-page space-y-12">
        {/* Centered Heading */}
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-950">
            Shop by category
          </h2>
        </div>

        {/* 3 Column Arch Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {CATEGORIES.map((cat, idx) => (
            <Link
              key={idx}
              to={cat.href}
              className="canva-arch-card group flex flex-col overflow-hidden bg-white/90 backdrop-blur-md transition-all duration-300 hover:shadow-2xl"
            >
              {/* Dark Photographic Top Section */}
              <div className="relative aspect-square w-full overflow-hidden bg-black">
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                />
              </div>

              {/* White Bottom Information Container */}
              <div className="p-6 text-center space-y-2 flex-1 flex flex-col justify-center bg-white">
                <h3 className="text-base sm:text-lg font-black tracking-wide text-slate-950 uppercase">
                  {cat.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                  {cat.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Centered Frosted Pill Button */}
        <div className="flex justify-center pt-4">
          <Link
            to="/buy"
            className="canva-pill-frosted text-base font-extrabold px-10 py-3.5"
          >
            Shop All
          </Link>
        </div>
      </div>
    </section>
  );
}
