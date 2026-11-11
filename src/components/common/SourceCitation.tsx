interface SourceCitationProps {
  number: number;
  title: string;
  onClick: () => void;
}

function SourceCitation({
  number,
  title,
  onClick,
}: SourceCitationProps) {
  return (
    <button
      type="button"
      className="source-reference"
      onClick={onClick}
      aria-label={`View source ${number}: ${title}`}
      title={title}
    >
      [{number}]
    </button>
  );
}

export default SourceCitation;