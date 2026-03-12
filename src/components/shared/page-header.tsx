export function PageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div>
      <h1 className="text-xl font-semibold tracking-[-0.01em] text-white sm:text-2xl md:text-3xl">
        {title}
      </h1>
      {description && (
        <p className="mt-1.5 text-sm leading-relaxed text-white/40 sm:mt-2 sm:text-[0.9rem]">
          {description}
        </p>
      )}
    </div>
  );
}
