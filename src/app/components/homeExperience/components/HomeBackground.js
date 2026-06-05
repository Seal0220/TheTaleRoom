import Image from "next/image";

export function HomeBackground({ backgroundRef, layers }) {
  return (
    <div
      ref={backgroundRef}
      className="absolute inset-x-[-6vw] inset-y-[-6vh] will-change-all"
      style={{ transform: "translate3d(0, 0, 0)" }}
    >
      {layers.map((layer, index) => (
        <Image
          alt=""
          className={`object-cover blur-xs transition-opacity duration-[1100ms] ease-in-out
            ${layer.active ? "opacity-100" : "opacity-0"}`}
          fill
          key={layer.id}
          priority={index === layers.length - 1}
          sizes="112vw"
          src={layer.src}
        />
      ))}
    </div>
  );
}
