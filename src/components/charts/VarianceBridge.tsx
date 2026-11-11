import type { CSSProperties } from 'react';
import type { VarianceItem } from '../../types';

interface VarianceBridgeProps {
  items: VarianceItem[];
  selectedId: string | null;
  onSelect: (item: VarianceItem) => void;
}

interface BridgePosition {
  item: VarianceItem;
  bottom: number;
  height: number;
}

function VarianceBridge({
  items,
  selectedId,
  onSelect,
}: VarianceBridgeProps) {
  let runningTotal = 0;

  const positions: BridgePosition[] = items.map((item) => {
    if (item.kind === 'total') {
      runningTotal = item.value;

      return {
        item,
        bottom: 0,
        height: item.value,
      };
    }

    const previousTotal = runningTotal;
    runningTotal += item.value;

    return {
      item,
      bottom: Math.min(previousTotal, runningTotal),
      height: Math.abs(item.value),
    };
  });

  const maximum =
    Math.max(...positions.map((position) => position.bottom + position.height)) *
    1.18;

  return (
    <div className="variance-chart-scroll">
      <div
        className="variance-bridge"
        role="group"
        aria-label="Illustrative operating-profit bridge in SGD million. Select a bar for details."
      >
        {positions.map(({ item, bottom, height }) => {
          const style = {
            '--bridge-bottom': `${(bottom / maximum) * 100}%`,
            '--bridge-height': `${(height / maximum) * 100}%`,
          } as CSSProperties;

          const formattedValue = `${item.kind !== 'total' && item.value > 0 ? '+' : ''}${item.value.toLocaleString('en-SG')}`;

          return (
            <button
              key={item.id}
              type="button"
              className={`bridge-column ${
                selectedId === item.id ? 'bridge-column--selected' : ''
              }`}
              style={style}
              onClick={() => onSelect(item)}
              aria-pressed={selectedId === item.id}
              aria-label={`${item.label}: ${formattedValue} SGD million. Select for explanation.`}
            >
              <span className="bridge-plot" aria-hidden="true">
                <span
                  className={`bridge-bar bridge-bar--${item.kind}`}
                >
                  <span className="bridge-value">{formattedValue}</span>
                  {item.kind === 'decrease' && (
                    <span className="bridge-minus">−</span>
                  )}
                </span>
              </span>

              <span className="bridge-label">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default VarianceBridge;