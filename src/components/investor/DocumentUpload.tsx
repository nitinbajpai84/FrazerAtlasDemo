import { useId, useRef, useState } from 'react';
import { FileText, UploadCloud } from 'lucide-react';

interface DocumentUploadProps {
  selectedFilename: string | null;
  onSelectFilename: (filename: string) => void;
  onUseSample: () => void;
}

function DocumentUpload({
  selectedFilename,
  onSelectFilename,
  onUseSample,
}: DocumentUploadProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  return (
    <section className="document-upload" aria-label="Document selection">
      <div
        className={`document-drop-zone ${
          dragging ? 'document-drop-zone--active' : ''
        }`}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);

          const file = event.dataTransfer.files.item(0);

          if (file) {
            onSelectFilename(file.name);
          }
        }}
      >
        <UploadCloud size={32} strokeWidth={1.5} aria-hidden="true" />
        <h3>Bring a valuation report into the workflow</h3>
        <p>
          Drop a file here or choose a local file. Only its filename is
          recorded; file contents are never read, uploaded or extracted.
        </p>

        <input
          ref={inputRef}
          id={inputId}
          type="file"
          className="sr-only"
          tabIndex={-1}
          aria-label="Choose a local document; filename only"
          onChange={(event) => {
            const file = event.target.files?.item(0);

            if (file) {
              onSelectFilename(file.name);
            }

            event.target.value = '';
          }}
        />

        <div className="upload-actions">
          <button
            type="button"
            className="button-secondary"
            onClick={() => inputRef.current?.click()}
          >
            Choose local file
          </button>

          <button
            type="button"
            className="button-primary"
            onClick={onUseSample}
          >
            <FileText size={16} aria-hidden="true" />
            Use sample valuation report
          </button>
        </div>
      </div>

      {selectedFilename && (
        <div className="selected-document" role="status">
          <FileText size={19} aria-hidden="true" />
          <div>
            <strong>Local filename recorded</strong>
            <p>{selectedFilename}</p>
            <span>
              This file has not been processed. Use the sample button to run
              the separate, predefined Riverside scenario.
            </span>
          </div>
        </div>
      )}
    </section>
  );
}

export default DocumentUpload;