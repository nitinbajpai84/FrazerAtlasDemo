import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { maturityData } from '../../data/previewData';

function MaturityChart() {
  return (
    <>
      <div
        className="maturity-chart"
        role="img"
        aria-label="Illustrative debt maturities in SGD million: 2026, 600; 2027, 1,200; 2028, 900; 2029, 700; 2030 and beyond, 1,100."
      >
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <BarChart
            data={maturityData}
            margin={{ top: 20, right: 20, left: 0, bottom: 12 }}
            accessibilityLayer
          >
            <CartesianGrid
              vertical={false}
              stroke="#E2E8F0"
              strokeDasharray="3 3"
            />
            <XAxis
              dataKey="year"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748B', fontSize: 12 }}
            />
            <YAxis
              width={55}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748B', fontSize: 12 }}
              tickFormatter={(value: number) => value.toLocaleString('en-SG')}
            />
            <Tooltip
              formatter={(value) =>
                `SGD ${Number(value).toLocaleString('en-SG')}M`
              }
              labelFormatter={(label) => `${label} · Illustrative`}
              contentStyle={{
                border: '1px solid #E2E8F0',
                borderRadius: 8,
                fontSize: 13,
              }}
            />
            <Bar
              dataKey="amount"
              name="Illustrative maturities"
              fill="#FD5108"
              maxBarSize={52}
              radius={[4, 4, 0, 0]}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <details className="maturity-data-details">
        <summary>View illustrative maturity data</summary>
        <div className="table-scroll">
          <table className="data-table">
            <caption className="sr-only">
              Illustrative maturity schedule in SGD million
            </caption>
            <thead>
              <tr>
                <th scope="col">Maturity bucket</th>
                <th scope="col" className="numeric-cell">SGD million</th>
              </tr>
            </thead>
            <tbody>
              {maturityData.map((item) => (
                <tr key={item.year}>
                  <th scope="row">{item.year}</th>
                  <td className="numeric-cell">
                    {item.amount.toLocaleString('en-SG')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </>
  );
}

export default MaturityChart;