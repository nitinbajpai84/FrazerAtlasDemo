import { useId, useState } from 'react';
import { CheckCircle2, FileText, X } from 'lucide-react';
import type { ValuationField } from '../../types/investor';
import Badge from '../common/Badge';

interface ValidationPanelProps {
  field: ValuationField;
  validated: boolean;
  confirmedNpi: number | null;
  onConfirm: (value: number) => void;
  onClose: () => void;
}

function ValidationPanel({
  field,
  validated,
  confirmedNpi,
  onConfirm,
  onClose,
}: ValidationPanelProps) {
  const inputId = useId();
  const [value, setValue] = useState(
    confirmedNpi !== null ? String(confirmedNpi) : '21100000',
  );
  const [error, setError] = useState('');

  return (
    <section
      className="validation-panel"
      aria-labelledby={`${inputId}-title`}
    >
      <header className="evidence-header">
        <div>
          <p className="section-eyebrow">Finance validation</p>
          <h3 id={`${inputId}-title`}>{field.label}</h3>
        </div>
        <button
          type="button"
          className="icon-button"
          onClick={onClose}
          aria-label="Close field evidence"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </header>

      <div className="validation-evidence-grid">
        <div>
          <dl className="validation-facts">
            <div>
              <dt>Extracted value</dt>
              <dd>{field.value}</dd>
            </div>
            <div>
              <dt>Extraction confidence</dt>
              <dd>{field.confidence}% · illustrative</dd>
            </div>
            <div>
              <dt>Source page</dt>
              <dd>Page {field.sourcePage} · synthetic reference</dd>
            </div>
          </dl>

          {validated ? (
            <Badge>Validated by Finance</Badge>
          ) : field.requiresReview ? (
            <Badge tone="review">Review required</Badge>
          ) : (
            <Badge>Evidence view</Badge>
          )}
        </div>

        <div className="valuation-source-evidence">
          <h4>
            <FileText size={17} aria-hidden="true" />
            Source text
          </h4>
          <blockquote>{field.sourceText}</blockquote>
          <p>
            Synthetic source excerpt, not a rendered PDF page. No document has
            been opened, uploaded or processed.
          </p>
        </div>
      </div>

      {field.requiresReview && (
        validated ? (
          <div className="validation-confirmed" role="status">
            <CheckCircle2 size={19} aria-hidden="true" />
            <div>
              <strong>Validated by Finance</strong>
              <p>
                Confirmed value: SGD{' '}
                {confirmedNpi?.toLocaleString('en-SG', {
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
        ) : (
          <form
            className="validation-form"
            onSubmit={(event) => {
              event.preventDefault();

              const cleanedValue = value.replace(/,/g, '').trim();
              const parsedValue = Number(cleanedValue);

              if (
                cleanedValue === '' ||
                !Number.isFinite(parsedValue) ||
                parsedValue <= 0 ||
                parsedValue > 10000000000
              ) {
                setError(
                  'Enter a positive SGD amount no greater than 10,000,000,000.',
                );
                return;
              }

              setError('');
              onConfirm(Math.round(parsedValue * 100) / 100);
            }}
          >
            <label htmlFor={inputId}>Confirmed Net Property Income (SGD)</label>
            <p id={`${inputId}-help`}>
              Review the evidence, then keep or amend the extracted value.
              Enter an amount in SGD, not millions.
            </p>

            <div className="validation-input-row">
              <input
                id={inputId}
                type="text"
                inputMode="decimal"
                value={value}
                onChange={(event) => {
                  setValue(event.target.value);
                  setError('');
                }}
                aria-describedby={`${inputId}-help ${
                  error ? `${inputId}-error` : ''
                }`}
                aria-invalid={error ? true : undefined}
              />
              <button type="submit" className="button-primary">
                <CheckCircle2 size={16} aria-hidden="true" />
                Confirm
              </button>
            </div>

            {error && (
              <p id={`${inputId}-error`} className="validation-error" role="alert">
                {error}
              </p>
            )}

            <p className="investor-small-note">
              Confirmation records a demonstration action by “Investor Finance
              (demo user)”. It does not approve the full record or a report.
            </p>
          </form>
        )
      )}
    </section>
  );
}

export default ValidationPanel;