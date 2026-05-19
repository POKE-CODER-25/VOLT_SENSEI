function PageHeader({ eyebrow, title, description }) {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-8 pt-12 md:px-8 md:pt-16">
      <p className="text-sm font-black uppercase text-electric">{eyebrow}</p>
      <h1 className="mt-3 max-w-4xl text-4xl font-black text-slate-950 dark:text-white md:text-6xl">
        {title}
      </h1>
      {description && (
        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
          {description}
        </p>
      )}
    </section>
  );
}

export default PageHeader;
