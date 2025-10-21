import { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { authHeader } from "../../config/api";
import axios from "axios";

const CropPieChart = () => {
    const [chart, setChart] = useState({ labels: [], data: [] });
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
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Crop Distribution</h3>
            {!isEmpty ? (
                <Pie data={chartData} />
            ) : (
                <div className="text-gray-400 py-6">No crop distribution data available.</div>
            )}
        </>
    );
};
export default CropPieChart;
