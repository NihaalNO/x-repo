import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

interface HistogramProps {
    data: { [key: string]: number } | undefined;
}

const Histogram: React.FC<HistogramProps> = ({ data }) => {
    if (!data) {
        return (
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-200 text-gray-400">
                No simulation data available
            </div>
        );
    }

    // Transform data for Recharts
    // data is like { "00": 1024, "01": 0 } or { "00": 0.5, "01": 0.5 } depending on backend
    const totalShots = Object.values(data).reduce((acc, val) => acc + val, 0);

    const chartData = Object.entries(data)
        .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
        .map(([state, count]) => ({
            state,
            probability: (count / totalShots) * 100, // Convert to percentage
            count
        }));

    return (
        <div className="h-64 w-full bg-white p-4 rounded-lg border border-gray-100">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={chartData}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="state" />
                    <YAxis label={{ value: 'Probability (%)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip
                        formatter={(value: any, name: any) => [
                            name === 'probability' ? `${Number(value).toFixed(1)}%` : value,
                            name === 'probability' ? 'Probability' : 'Count'
                        ]}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="probability" name="Probability" fill="#4f46e5" radius={[4, 4, 0, 0]}>
                        {chartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={`hsl(${240 + index * 10}, 70%, 60%)`} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default Histogram;
