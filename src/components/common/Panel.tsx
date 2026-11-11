import { useId } from 'react';
import type { ReactNode } from 'react';

interface PanelProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}

function Panel({
  title,
  subtitle,
  action,
  className = '',
  children,
}: PanelProps) {
  const titleId = useId();

  return (
    <section
      className={`panel ${className}`}
      aria-labelledby={titleId}
    >
      <header className="panel-header">
        <div>
          <h2 id={titleId}>{title}</h2>
          {subtitle && <p className="panel-subtitle">{subtitle}</p>}
        </div>

        {action && <div className="panel-action">{action}</div>}
      </header>

      {children}
    </section>
  );
}

export default Panel;