import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pie } from "react-chartjs-2";
import { authHeader } from "../../config/api";
import { ExternalLink } from "lucide-react";
import axios from "axios";

const CropPieChart = () => {
    const [chart, setChart] = useState({ labels: [], data: [] });
    const navigate = useNavigate();
    
    useEffect(() => {
        axios.get("/api/analytics/crop-distribution", { headers: authHeader() }).then(res => {
            setChart(res.data);
        });
    }, []);

    const chartData = {
        labels: chart.labels || [],
        datasets: [{
            data: chart.data || [],
            backgroundColor: ['#38bdf8', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#2dd4bf'],
            borderWidth: 2,
        }]
    };

    const isEmpty = !chart.labels?.length || !chart.data?.length;

    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Crop Distribution</h3>
                <button 
                    onClick={() => navigate('/analytics/crops')}
                    className="text-teal-600 hover:text-teal-700 flex items-center gap-1 text-sm font-medium transition-colors"
                    title="View detailed analytics"
                >
                    Details <ExternalLink className="w-3 h-3" />
                </button>
            </div>
            {!isEmpty ? (
                <div className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/analytics/crops')}>
                    <Pie data={chartData} />
                </div>
            ) : (
                <div className="text-gray-400 py-6">No crop distribution data available.</div>
            )}
        </>
    );
};
export default CropPieChart;
