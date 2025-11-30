"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface TaskCompletionChartProps {
  data: {
    activityByType: Array<{ type: string; count: number }>;
    activityByAction: Array<{ action: string; count: number }>;
  } | null;
}

export const TaskCompletionChart = ({ data }: TaskCompletionChartProps) => {
  if (!data) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        Loading chart data...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-4">Activity by Type</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.activityByType}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="type" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Activity by Action</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.activityByAction}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="action" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

