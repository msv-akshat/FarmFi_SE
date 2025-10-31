import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = {
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#10B981',
  approved: '#10B981',
  pending: '#F59E0B',
  verified: '#3B82F6'
};

const CHART_COLORS = ['#16A34A', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

// Custom label for pie charts
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
  if (percent === 0) return null;
  
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      className="font-semibold text-sm"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export function SeverityPieChart({ data }) {
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <p className="text-sm">No disease prediction data available</p>
      </div>
    );
  }

  const chartData = [
    { name: 'High', value: parseInt(data.high) || 0, color: COLORS.high },
    { name: 'Medium', value: parseInt(data.medium) || 0, color: COLORS.medium },
    { name: 'Low', value: parseInt(data.low) || 0, color: COLORS.low }
  ].filter(item => item.value > 0);

  if (chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <p className="text-sm">No disease predictions recorded yet</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomLabel}
          outerRadius={90}
          fill="#8884d8"
          dataKey="value"
          paddingAngle={2}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value) => [`${value} prediction(s)`, '']}
          contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
        />
        <Legend 
          verticalAlign="bottom" 
          height={36}
          formatter={(value, entry) => `${entry.payload.name} (${entry.payload.value})`}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function CropDistributionChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <p className="text-sm">No crop data available</p>
      </div>
    );
  }

  // Format data for better display
  const formattedData = data.slice(0, 8).map(item => ({
    ...item,
    crop_name: item.crop_name ? (item.crop_name.length > 15 ? item.crop_name.substring(0, 12) + '...' : item.crop_name) : 'Unknown',
    count: parseInt(item.count) || 0
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={formattedData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="crop_name" 
          angle={-45} 
          textAnchor="end" 
          height={80}
          tick={{ fontSize: 12 }}
          interval={0}
        />
        <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
        <Tooltip 
          contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
          formatter={(value) => [`${value} crop(s)`, 'Count']}
        />
        <Bar 
          dataKey="count" 
          fill="#16A34A" 
          radius={[8, 8, 0, 0]}
          maxBarSize={60}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function FieldStatusChart({ data }) {
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <p className="text-sm">No field data available</p>
      </div>
    );
  }

  const chartData = [
    { name: 'Approved', value: parseInt(data.admin_approved) || 0, color: COLORS.approved },
    { name: 'Verified', value: parseInt(data.employee_verified) || 0, color: COLORS.verified },
    { name: 'Pending', value: parseInt(data.pending) || 0, color: COLORS.pending }
  ].filter(item => item.value > 0);

  if (chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <p className="text-sm">No field data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomLabel}
          outerRadius={90}
          fill="#8884d8"
          dataKey="value"
          paddingAngle={2}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value) => [`${value} field(s)`, '']}
          contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
        />
        <Legend 
          verticalAlign="bottom" 
          height={36}
          formatter={(value, entry) => `${entry.payload.name} (${entry.payload.value})`}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function PredictionsTrendChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <p className="text-sm">No trend data available</p>
      </div>
    );
  }

  // Format dates for better display
  const formattedData = data.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={formattedData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12 }}
          interval="preserveStartEnd"
        />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip 
          contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
          formatter={(value) => [`${value} prediction(s)`, 'Count']}
        />
        <Line 
          type="monotone" 
          dataKey="count" 
          stroke="#16A34A" 
          strokeWidth={3}
          dot={{ fill: '#16A34A', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function AreaDistributionChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <p className="text-sm">No area data available</p>
      </div>
    );
  }

  // Format data for better display
  const formattedData = data.slice(0, 8).map(item => ({
    ...item,
    field_name: item.field_name.length > 15 ? item.field_name.substring(0, 12) + '...' : item.field_name,
    area: parseFloat(item.area)
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={formattedData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="field_name" 
          angle={-45} 
          textAnchor="end" 
          height={80}
          tick={{ fontSize: 12 }}
          interval={0}
        />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip 
          contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
          formatter={(value) => [`${value} acres`, 'Area']}
        />
        <Bar 
          dataKey="area" 
          fill="#3B82F6" 
          radius={[8, 8, 0, 0]}
          maxBarSize={60}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
