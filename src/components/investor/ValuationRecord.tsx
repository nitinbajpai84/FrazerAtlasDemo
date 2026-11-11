import type {
  ValuationField,
  ValuationRecord as ValuationRecordData,
} from '../../types/investor';
import Badge from '../common/Badge';
import Panel from '../common/Panel';
import ExtractedField from './ExtractedField';

interface ValuationRecordProps {
  record: ValuationRecordData;
  npiValidated: boolean;
  confirmedNpi: number | null;
  onSelectField: (field: ValuationField) => void;
}

function ValuationRecord({
  record,
  npiValidated,
  confirmedNpi,
  onSelectField,
}: ValuationRecordProps) {
  const confirmedValue =
    confirmedNpi !== null
      ? `SGD ${confirmedNpi.toLocaleString('en-SG', {
          maximumFractionDigits: 2,
        })}`
      : null;

  return (
    <Panel
      title="Extracted valuation record"
      subtitle="Predefined sample values · All figures illustrative"
      action={
        <Badge tone={npiValidated ? 'neutral' : 'review'}>
          {npiValidated
            ? 'Required field validated'
            : '1 field requires review'}
        </Badge>
      }
    >
      <div className="valuation-record-summary">
        <div>
          <span className="section-eyebrow">{record.propertyId}</span>
          <h3>{record.property}</h3>
          <p>{record.assetType} · {record.location}</p>
        </div>

        <dl>
          <div>
            <dt>Valuer</dt>
            <dd>{record.valuer}</dd>
          </div>
          <div>
            <dt>Currency</dt>
            <dd>{record.currency}</dd>
          </div>
          <div>
            <dt>Valuation date</dt>
            <dd>{record.valuationDate}</dd>
          </div>
        </dl>
      </div>

      <div className="extracted-fields-grid">
        {record.fields.map((field) => (
          <ExtractedField
            key={field.id}
            field={field}
            validated={field.id === 'npi' && npiValidated}
            confirmedValue={field.id === 'npi' ? confirmedValue : null}
            onSelect={() => onSelectField(field)}
          />
        ))}
      </div>

      <p className="valuation-confidence-note">
        Confidence percentages are predefined demonstration indicators, not
        measured extraction accuracy. The illustrative review threshold is 90%.
        Higher-confidence fields have not automatically been approved by Finance.
      </p>
    </Panel>
  );
}

export default ValuationRecord;