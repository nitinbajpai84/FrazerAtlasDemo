import { businessUnits } from '../../data/executiveData';

function BusinessUnitTable() {
  const maximumRevenue = Math.max(
    ...businessUnits.map((unit) => unit.revenue),
  );

  return (
    <div className="table-scroll">
      <table className="data-table business-unit-table visual-business-table">
        <caption className="sr-only">
          Illustrative FY2026 business-unit performance in SGD million.
          Revenue bars compare each unit with the largest listed revenue.
          This schedule does not reconcile to the Group KPI.
        </caption>

        <thead>
          <tr>
            <th scope="col">Business unit</th>
            <th scope="col" className="numeric-cell">Revenue</th>
            <th scope="col" className="numeric-cell">Operating profit</th>
            <th scope="col" className="numeric-cell">YoY</th>
          </tr>
        </thead>

        <tbody>
          {businessUnits.map((unit) => (
            <tr key={unit.id}>
              <th scope="row">{unit.name}</th>

              <td className="numeric-cell">
                <div className="business-revenue-cell">
                  <span>{unit.revenue.toLocaleString('en-SG')}</span>
                  <span className="business-revenue-track" aria-hidden="true">
                    <span
                      style={{
                        width: `${(unit.revenue / maximumRevenue) * 100}%`,
                      }}
                    />
                  </span>
                </div>
              </td>

              <td className="numeric-cell">
                {unit.operatingProfit.toLocaleString('en-SG')}
              </td>

              <td className="numeric-cell">
                <span className="positive-change">{unit.yearOnYear}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default BusinessUnitTable;