interface PageHeaderProps {
  title: string;
  subtitle: string;
}

function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div>
        <p className="section-eyebrow">Finance Atlas / Group workspace</p>
        <h1>{title}</h1>
        <p className="page-subtitle">{subtitle}</p>
      </div>

      <span className="page-context">Demonstration environment</span>
    </header>
  );
}

export default PageHeader;