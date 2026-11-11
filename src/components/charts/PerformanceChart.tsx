import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { PerformanceMetricDefinition } from '../../types';

interface PerformanceChartProps {
  metric: PerformanceMetricDefinition;
}

function PerformanceChart({ metric }: PerformanceChartProps) {
  return (
    <div className="performance-chart-wrapper">
      <div
        className="performance-chart"
        role="img"
        aria-label={`Illustrative ${metric.label}, actual versus prior year from FY2022 through FY2026. Values in ${metric.unit}. A data table follows.`}
      >
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <BarChart
            data={metric.data}
            margin={{ top: 16, right: 8, bottom: 4, left: 0 }}
            barGap={5}
            accessibilityLayer
          >
            <CartesianGrid
              stroke="#E2E8F0"
              vertical={false}
              strokeDasharray="3 3"
            />

            <XAxis
              dataKey="year"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748B', fontSize: 12 }}
              tickMargin={12}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748B', fontSize: 12 }}
              tickFormatter={(value: number) =>
                value.toLocaleString('en-SG')
              }
              width={52}
            />

            <Tooltip
              cursor={{ fill: '#EBEBEB' }}
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

            <Legend
              verticalAlign="top"
              align="right"
              iconType="square"
              iconSize={9}
              wrapperStyle={{ fontSize: 12, paddingBottom: 20 }}
            />

            <Bar
              dataKey="priorYear"
              name="Prior year"
              fill="#B5BCC4"
              radius={[3, 3, 0, 0]}
              maxBarSize={28}
              isAnimationActive={false}
            />

            <Bar
              dataKey="actual"
              name="Actual (illustrative)"
              fill="#FD5108"
              radius={[3, 3, 0, 0]}
              maxBarSize={28}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <details className="chart-data-details">
        <summary>View chart data</summary>

        <div className="table-scroll">
          <table className="data-table compact-table">
            <caption>
              Illustrative {metric.label} · {metric.unit}
            </caption>
            <thead>
              <tr>
                <th scope="col">Period</th>
                <th scope="col" className="numeric-cell">
                  Actual
                </th>
                <th scope="col" className="numeric-cell">
                  Prior year
                </th>
              </tr>
            </thead>
            <tbody>
              {metric.data.map((point) => (
                <tr key={point.year}>
                  <th scope="row">{point.year}</th>
                  <td className="numeric-cell">
                    {point.actual.toLocaleString('en-SG')}
                  </td>
                  <td className="numeric-cell">
                    {point.priorYear.toLocaleString('en-SG')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}

export default PerformanceChart;