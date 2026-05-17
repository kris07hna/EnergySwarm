type GooeyFilterProps = {
  id: string;
  strength?: number;
};

export function GooeyFilter({ id, strength = 6 }: GooeyFilterProps) {
  const stdDeviation = Math.max(0, strength);

  return (
    <svg
      aria-hidden="true"
      width="0"
      height="0"
      className="absolute opacity-0 pointer-events-none"
    >
      <defs>
        <filter id={id} colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceGraphic" stdDeviation={stdDeviation} result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10"
            result="gooey"
          />
          <feBlend in="SourceGraphic" in2="gooey" />
        </filter>
      </defs>
    </svg>
  );
}
