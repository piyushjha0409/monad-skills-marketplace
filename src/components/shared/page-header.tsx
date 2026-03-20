export function PageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div>
      <h1 className="text-xl font-bold tracking-[-0.02em] text-gray-900 sm:text-2xl md:text-[1.75rem]">
        {title}
      </h1>
      {description && (
        <p className="mt-2 text-sm leading-[1.6] text-gray-500 sm:text-[0.9rem]">
          {description}
        </p>
      )}
    </div>
  );
}
