type BrandLogoProps = {
  className?: string;
  imageClassName?: string;
  showLocation?: boolean;
};

export default function BrandLogo({
  className = '',
  imageClassName = 'h-11 sm:h-14 md:h-16 w-auto max-w-[240px] sm:max-w-[290px] md:max-w-[320px]',
  showLocation = false,
}: BrandLogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`.trim()}>
      <img
        src="/logo1 (2).svg"
        alt="Fundu - Lucknow"
        className={`object-contain block ${imageClassName}`.trim()}
      />
      {showLocation && (
        <span className="hidden sm:inline-block rounded-md bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">
          LUCKNOW
        </span>
      )}
    </div>
  );
}
