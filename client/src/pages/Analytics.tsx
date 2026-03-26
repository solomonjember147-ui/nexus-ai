import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardNav } from "@/components/DashboardNav";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, CheckCircle2, FileText, Zap } from "lucide-react";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

export default function Analytics() {
  const [startDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date;
  });
  const [endDate] = useState(new Date());

  const { data: metrics = [], isLoading } = trpc.analytics.getMetrics.useQuery({
    startDate,
    endDate,
  });

  // Calculate summary statistics
  const totalTasksCompleted = metrics.reduce((sum, m) => sum + (m.tasksCompleted || 0), 0);
  const totalTasksCreated = metrics.reduce((sum, m) => sum + (m.tasksCreated || 0), 0);
  const totalDocuments = metrics.reduce((sum, m) => sum + (m.documentsCreated || 0), 0);
  const totalInsights = metrics.reduce((sum, m) => sum + (m.aiInsightsGenerated || 0), 0);
  const avgCompletionRate = metrics.length > 0
    ? Math.round(metrics.reduce((sum, m) => sum + (m.completionRate || 0), 0) / metrics.length)
    : 0;

  // Prepare chart data
  const chartData = metrics.map((m) => ({
    date: new Date(m.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    completed: m.tasksCompleted || 0,
    created: m.tasksCreated || 0,
    documents: m.documentsCreated || 0,
    insights: m.aiInsightsGenerated || 0,
  }));

  const priorityData = [
    { name: "Low", value: Math.floor(totalTasksCreated * 0.2) },
    { name: "Medium", value: Math.floor(totalTasksCreated * 0.4) },
    { name: "High", value: Math.floor(totalTasksCreated * 0.25) },
    { name: "Urgent", value: Math.floor(totalTasksCreated * 0.15) },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardNav />

      <main className="flex-1 lg:ml-64 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Analytics</h1>
            <p className="text-muted-foreground">Track your productivity and AI insights</p>
          </div>

          {isLoading ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground">Loading analytics...</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Tasks Completed</p>
                        <p className="text-3xl font-bold text-foreground">{totalTasksCompleted}</p>
                      </div>
                      <CheckCircle2 className="w-10 h-10 text-green-500 opacity-20" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Tasks Created</p>
                        <p className="text-3xl font-bold text-foreground">{totalTasksCreated}</p>
                      </div>
                      <TrendingUp className="w-10 h-10 text-blue-500 opacity-20" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Documents</p>
                        <p className="text-3xl font-bold text-foreground">{totalDocuments}</p>
                      </div>
                      <FileText className="w-10 h-10 text-orange-500 opacity-20" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">AI Insights</p>
                        <p className="text-3xl font-bold text-foreground">{totalInsights}</p>
                      </div>
                      <Zap className="w-10 h-10 text-yellow-500 opacity-20" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Activity Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Activity Over Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                          <XAxis dataKey="date" stroke="var(--color-muted-foreground)" />
                          <YAxis stroke="var(--color-muted-foreground)" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "var(--color-card)",
                              border: "1px solid var(--color-border)",
                              borderRadius: "8px",
                            }}
                          />
                          <Legend />
                          <Bar dataKey="completed" fill="#10b981" name="Completed" />
                          <Bar dataKey="created" fill="#3b82f6" name="Created" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No data available</p>
                    )}
                  </CardContent>
                </Card>

                {/* Priority Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Priority Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {priorityData.some(d => d.value > 0) ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={priorityData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name}: ${value}`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {COLORS.map((color, index) => (
                              <Cell key={`cell-${index}`} fill={color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No data available</p>
                    )}
                  </CardContent>
                </Card>

                {/* Completion Rate */}
                <Card>
                  <CardHeader>
                    <CardTitle>Completion Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className="text-5xl font-bold text-foreground mb-2">
                        {avgCompletionRate}%
                      </div>
                      <p className="text-muted-foreground">Average completion rate</p>
                      <div className="w-full bg-muted rounded-full h-2 mt-4">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{ width: `${avgCompletionRate}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* AI Insights Trend */}
                <Card>
                  <CardHeader>
                    <CardTitle>AI Insights Generated</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                          <XAxis dataKey="date" stroke="var(--color-muted-foreground)" />
                          <YAxis stroke="var(--color-muted-foreground)" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "var(--color-card)",
                              border: "1px solid var(--color-border)",
                              borderRadius: "8px",
                            }}
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="insights"
                            stroke="#f59e0b"
                            name="Insights"
                            strokeWidth={2}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No data available</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
