import { Bar } from 'react-chartjs-2';
const StatsChart = ({ fields }) => {
  const data = {
    labels: fields.map(f => f.field_name),
    datasets: [{
      label: 'Field Size (ha)',
      data: fields.map(f => Number(f.area)),
      backgroundColor: '#34d399',
    }],
  };
  return (
    <div className="bg-white rounded-2xl p-6 shadow mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Field Size Chart</h3>
      <Bar data={data} />
    </div>
  );
};
export default StatsChart;
