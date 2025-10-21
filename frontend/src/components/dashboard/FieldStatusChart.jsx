import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Doughnut } from "react-chartjs-2";
import { authHeader } from "../../config/api";
import { ExternalLink } from "lucide-react";
import axios from "axios";

const FieldStatusChart = () => {
  const [chart, setChart] = useState({ labels: [], data: [] });
  const navigate = useNavigate();
  
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
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Field Status Distribution</h3>
        <button 
          onClick={() => navigate('/analytics/field-status')}
          className="text-teal-600 hover:text-teal-700 flex items-center gap-1 text-sm font-medium transition-colors"
          title="View detailed analytics"
        >
          Details <ExternalLink className="w-3 h-3" />
        </button>
      </div>
      {!isEmpty ? (
        <div className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/analytics/field-status')}>
          <Doughnut data={chartData} />
        </div>
      ) : (
        <div className="text-gray-400 py-6">No field status data available.</div>
      )}
    </>
  );
};
export default FieldStatusChart;
