import { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { authHeader } from "../../config/api";
import axios from "axios";

const FieldStatusChart = () => {
  const [chart, setChart] = useState({ labels: [], data: [] });
  useEffect(() => {
    axios.get("/api/analytics/status-breakdown", { headers: authHeader() }).then(res => setChart(res.data));
  }, []);

  const chartData = {
    labels: chart.labels || [],
    datasets: [{
      data: chart.data || [],
      backgroundColor: ["#60a5fa", "#f59e42", "#10b981", "#a78bfa", "#f87171"],
      borderWidth: 2
    }]
  };

  const isEmpty = !chart.labels?.length || !chart.data?.length;

  return (
    <>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Field Status Distribution</h3>
      {!isEmpty ? (
        <Doughnut data={chartData} />
      ) : (
        <div className="text-gray-400 py-6">No field status data available.</div>
      )}
    </>
  );
};
export default FieldStatusChart;
