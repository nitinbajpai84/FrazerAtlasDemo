import { Info } from 'lucide-react';

function DemoDataNotice() {
  return (
    <div className="demo-data-notice">
      <Info size={15} aria-hidden="true" />
      <span>Illustrative prototype data</span>
    </div>
  );
}

export default DemoDataNotice;