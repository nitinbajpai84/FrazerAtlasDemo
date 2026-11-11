import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import type { ValuationField } from '../../types/investor';
import Badge from '../common/Badge';

interface ExtractedFieldProps {
  field: ValuationField;
  validated: boolean;
  confirmedValue: string | null;
  onSelect: () => void;
}

function ExtractedField({
  field,
  validated,
  confirmedValue,
  onSelect,
}: ExtractedFieldProps) {
  const reviewRequired = field.requiresReview && !validated;

  return (
    <article
      className={`extracted-field ${
        reviewRequired ? 'extracted-field--review' : ''
      }`}
    >
      <div className="extracted-field-top">
        <h3>{field.label}</h3>
        <span className="field-confidence">
          {field.confidence}% confidence
        </span>
      </div>

      <p className="extracted-field-value">
        {validated && confirmedValue ? confirmedValue : field.value}
      </p>

      <div className="extracted-field-bottom">
        {validated ? (
          <span className="field-validation-label">
            <CheckCircle2 size={15} aria-hidden="true" />
            Validated by Finance
          </span>
        ) : reviewRequired ? (
          <Badge tone="review">Review required</Badge>
        ) : (
          <Badge>Extracted · not Finance-validated</Badge>
        )}

        <button
          type="button"
          className="text-action"
          onClick={onSelect}
          aria-label={`View source evidence for ${field.label}`}
        >
          {reviewRequired ? 'Review field' : 'View evidence'}
          <ArrowUpRight size={14} aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}

export default ExtractedField;