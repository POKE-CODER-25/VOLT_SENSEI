function PageHeader({ eyebrow, title, description, subtitle, icon }) {
  const displayDescription = description || subtitle;
  
  return (
    <section className="mx-auto max-w-7xl px-4 pb-8 pt-12 md:px-8 md:pt-16">
      <div className="flex items-center gap-3 mb-3">
        {icon}
        <p className="text-sm font-black uppercase text-electric">{eyebrow}</p>
      </div>
      <h1 className="max-w-4xl text-4xl font-black text-slate-950 dark:text-white md:text-6xl">
        {title}
      </h1>
      {displayDescription && (
        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
          {displayDescription}
        </p>
      )}
    </section>
  );
}

export default PageHeader;
