interface ProgressBarProps {
  value: number;
  label: string;
}

function ProgressBar({ value, label }: ProgressBarProps) {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <div
      className="progress-track"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(safeValue)}
    >
      <div
        className="progress-fill"
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}

export default ProgressBar;