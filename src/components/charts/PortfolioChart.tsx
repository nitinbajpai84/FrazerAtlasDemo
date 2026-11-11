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
import { portfolioImpactData } from '../../data/reports';

function PortfolioChart() {
  return (
    <div
      className="portfolio-impact-chart"
      role="img"
      aria-label="Illustrative portfolio record total: prior SGD 12.315 billion; current SGD 12.800 billion, including a SGD 485 million record addition."
    >
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <BarChart
          data={portfolioImpactData.chart}
          margin={{ top: 14, right: 16, left: 0, bottom: 8 }}
          accessibilityLayer
        >
          <CartesianGrid
            vertical={false}
            stroke="#E2E8F0"
            strokeDasharray="3 3"
          />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748B', fontSize: 12 }}
            tickMargin={10}
          />
          <YAxis
            width={58}
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748B', fontSize: 12 }}
            tickFormatter={(value: number) =>
              value.toLocaleString('en-SG')
            }
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
          <Legend
            verticalAlign="top"
            iconType="square"
            iconSize={9}
            wrapperStyle={{ fontSize: 12, paddingBottom: 16 }}
          />
          <Bar
            dataKey="existing"
            name="Existing portfolio"
            stackId="portfolio"
            fill="#B5BCC4"
            maxBarSize={76}
            isAnimationActive={false}
          />
          <Bar
            dataKey="addition"
            name="Record addition"
            stackId="portfolio"
            fill="#FD5108"
            maxBarSize={76}
            radius={[3, 3, 0, 0]}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default PortfolioChart;