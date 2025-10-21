import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import { authHeader } from "../../config/api";
import { ExternalLink } from "lucide-react";
import axios from "axios";

const FieldSizeChart = () => {
  const [chart, setChart] = useState({ labels: [], data: [] });
  const navigate = useNavigate();
  
  useEffect(() => {
    axios.get("/api/analytics/field-size-by-crop", { headers: authHeader() })
      .then(res => setChart(res.data));
  }, []);

  const chartData = {
    labels: chart.labels || [],
    datasets: [{
      label: "Total Area (ha)",
      data: chart.data || [],
      backgroundColor: "#34d399"
    }]
  };

  const isEmpty = !chart.labels?.length || !chart.data?.length;

  // Smart y-axis padding for visual balance
  const maxY = Math.max(...(chart.data || [0]));
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false }
    },
    layout: { padding: { top: 40, bottom: 40 } },
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: maxY ? maxY * 1.3 : 20, // ~30% above the largest bar
        ticks: { stepSize: 5 }
      }
    },
    onClick: () => navigate('/analytics/field-area')
  };

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800">Field Area by Crop</h3>
        <button 
          onClick={() => navigate('/analytics/field-area')}
          className="text-teal-600 hover:text-teal-700 flex items-center gap-1 text-sm font-medium transition-colors"
          title="View detailed analytics"
        >
          Details <ExternalLink className="w-3 h-3" />
        </button>
      </div>
      {!isEmpty ? (
        <div className="cursor-pointer hover:opacity-80 transition-opacity">
          <Bar data={chartData} options={chartOptions} height={280} />
        </div>
      ) : (
        <div className="text-gray-400 py-6">No field area data available.</div>
      )}
    </>
  );
};

export default FieldSizeChart;
