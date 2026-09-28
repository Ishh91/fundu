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
        src="/logo.png"
        alt="Fundu - Smart Choice Smart Price"
        className={`object-contain block ${imageClassName}`.trim()}
      />
      {showLocation && (
        
      )}
    </div>
  );
}
