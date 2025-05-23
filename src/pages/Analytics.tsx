
import { useMemo } from "react";
import { ArrowLeft, TrendingUp, Users, Calendar, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Task } from "@/types/task";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

const Analytics = () => {
  const navigate = useNavigate();
  const [tasks] = useLocalStorage<Task[]>("tasks", []);

  const analytics = useMemo(() => {
    const statusCounts = {
      pending: tasks.filter(t => t.status === "pending").length,
      "in-progress": tasks.filter(t => t.status === "in-progress").length,
      completed: tasks.filter(t => t.status === "completed").length,
    };

    const priorityCounts = {
      low: tasks.filter(t => t.priority === "low").length,
      medium: tasks.filter(t => t.priority === "medium").length,
      high: tasks.filter(t => t.priority === "high").length,
      urgent: tasks.filter(t => t.priority === "urgent").length,
    };

    const assigneeCounts = tasks.reduce((acc, task) => {
      if (task.assignee) {
        acc[task.assignee] = (acc[task.assignee] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const completionRate = tasks.length > 0 
      ? (statusCounts.completed / tasks.length) * 100 
      : 0;

    // Tasks created over time (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const tasksOverTime = last7Days.map(date => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      tasks: tasks.filter(task => task.createdAt.split('T')[0] === date).length,
      completed: tasks.filter(task => 
        task.createdAt.split('T')[0] === date && task.status === "completed"
      ).length,
    }));

    return {
      statusCounts,
      priorityCounts,
      assigneeCounts,
      completionRate,
      tasksOverTime,
      totalTasks: tasks.length,
      overdueTasks: tasks.filter(task => 
        task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "completed"
      ).length,
    };
  }, [tasks]);

  const statusData = [
    { name: "Pending", value: analytics.statusCounts.pending, color: "#f59e0b" },
    { name: "In Progress", value: analytics.statusCounts["in-progress"], color: "#3b82f6" },
    { name: "Completed", value: analytics.statusCounts.completed, color: "#10b981" },
  ];

  const priorityData = [
    { name: "Low", value: analytics.priorityCounts.low },
    { name: "Medium", value: analytics.priorityCounts.medium },
    { name: "High", value: analytics.priorityCounts.high },
    { name: "Urgent", value: analytics.priorityCounts.urgent },
  ];

  const assigneeData = Object.entries(analytics.assigneeCounts).map(([name, count]) => ({
    name: name || "Unassigned",
    tasks: count,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Analytics Dashboard
              </h1>
              <p className="text-lg text-gray-600">
                Insights into your task management performance
              </p>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalTasks}</div>
              <p className="text-xs text-muted-foreground">
                Across all projects
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.completionRate.toFixed(1)}%</div>
              <Progress value={analytics.completionRate} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Assignees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Object.keys(analytics.assigneeCounts).length}</div>
              <p className="text-xs text-muted-foreground">
                Team members involved
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{analytics.overdueTasks}</div>
              <p className="text-xs text-muted-foreground">
                Need immediate attention
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Task Status Distribution</CardTitle>
              <CardDescription>Overview of task statuses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Priority Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Priority Distribution</CardTitle>
              <CardDescription>Tasks by priority level</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={priorityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tasks Over Time */}
          <Card>
            <CardHeader>
              <CardTitle>Tasks Over Time</CardTitle>
              <CardDescription>Task creation and completion trends (Last 7 days)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.tasksOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="tasks" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Created"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="completed" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Completed"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Assignee Workload */}
          <Card>
            <CardHeader>
              <CardTitle>Assignee Workload</CardTitle>
              <CardDescription>Tasks assigned to team members</CardDescription>
            </CardHeader>
            <CardContent>
              {assigneeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={assigneeData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="tasks" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No assigned tasks yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
