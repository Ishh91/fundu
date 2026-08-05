type BrandLogoProps = {
  className?: string;
  imageClassName?: string;
  showLocation?: boolean;
};

export default function BrandLogo({
  className = '',
  imageClassName = 'h-12 w-auto',
  showLocation = false,
}: BrandLogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`.trim()}>
      <img
        src="/logo.svg"
        alt="Fundu logo"
        className={`w-auto object-contain ${imageClassName}`.trim()}
      />
      {showLocation && (
        <span className="hidden sm:inline-block rounded-md bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">
          FUNDU
        </span>
      )}
    </div>
  );
}
