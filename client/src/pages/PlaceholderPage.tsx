interface PlaceholderPageProps {
  title: string;
  description: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark mb-4">
        {title}
      </h2>
      <div className="card">
        <p className="text-text-secondary dark:text-text-secondary-dark">
          {description}
        </p>
      </div>
    </div>
  );
}
