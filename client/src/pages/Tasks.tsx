import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardNav } from "@/components/DashboardNav";
import { Plus, Trash2, CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const priorityColors = {
  low: "bg-blue-100 text-blue-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800",
};

const statusIcons = {
  todo: Circle,
  in_progress: AlertCircle,
  completed: CheckCircle2,
  archived: Circle,
};

export default function Tasks() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
  const [category, setCategory] = useState("");

  const { data: tasks = [], isLoading, refetch } = trpc.tasks.list.useQuery();
  const createMutation = trpc.tasks.create.useMutation({
    onSuccess: () => {
      toast.success("Task created successfully!");
      setTitle("");
      setDescription("");
      setPriority("medium");
      setCategory("");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to create task: ${error.message}`);
    },
  });

  const updateMutation = trpc.tasks.update.useMutation({
    onSuccess: () => {
      toast.success("Task updated!");
      refetch();
    },
  });

  const deleteMutation = trpc.tasks.delete.useMutation({
    onSuccess: () => {
      toast.success("Task deleted!");
      refetch();
    },
  });

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Task title is required");
      return;
    }
    await createMutation.mutateAsync({
      title,
      description,
      priority,
      category,
    });
  };

  const handleToggleStatus = (taskId: number, currentStatus: string) => {
    const nextStatus =
      currentStatus === "todo"
        ? "in_progress"
        : currentStatus === "in_progress"
          ? "completed"
          : "todo";
    updateMutation.mutate({
      id: taskId,
      status: nextStatus as any,
    });
  };

  const handleDeleteTask = (taskId: number) => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteMutation.mutate({ id: taskId });
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardNav />

      <main className="flex-1 lg:ml-64 p-4 lg:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Tasks</h1>
            <p className="text-muted-foreground">Manage your tasks with AI-powered insights</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Create Task Form */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  New Task
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateTask} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Title</label>
                    <Input
                      placeholder="Task title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground">Description</label>
                    <textarea
                      placeholder="Task description (optional)"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full mt-1 p-2 rounded border border-border text-foreground bg-background text-sm"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground">Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                      className="w-full mt-1 p-2 rounded border border-border text-foreground bg-background"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground">Category</label>
                    <Input
                      placeholder="e.g., Work, Personal"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? "Creating..." : "Create Task"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Tasks List */}
            <div className="lg:col-span-2 space-y-4">
              {isLoading ? (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground">Loading tasks...</p>
                  </CardContent>
                </Card>
              ) : tasks.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground text-center">No tasks yet. Create one to get started!</p>
                  </CardContent>
                </Card>
              ) : (
                tasks.map((task) => {
                  const StatusIcon = statusIcons[task.status as keyof typeof statusIcons] || Circle;
                  return (
                    <Card key={task.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <button
                                onClick={() => handleToggleStatus(task.id, task.status)}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <StatusIcon className="w-6 h-6" />
                              </button>
                              <h3 className="font-semibold text-foreground">{task.title}</h3>
                            </div>

                            {task.description && (
                              <p className="text-sm text-muted-foreground mb-3 ml-9">
                                {task.description}
                              </p>
                            )}

                            {task.aiSummary && (
                              <div className="ml-9 mb-3 p-3 bg-accent/10 rounded text-sm text-foreground">
                                <span className="font-medium">AI Insight: </span>
                                {task.aiSummary}
                              </div>
                            )}

                            <div className="flex flex-wrap gap-2 ml-9">
                              <Badge className={priorityColors[task.priority as keyof typeof priorityColors]}>
                                {task.priority}
                              </Badge>
                              {task.category && (
                                <Badge variant="outline">{task.category}</Badge>
                              )}
                              <Badge variant="secondary">{task.status}</Badge>
                            </div>
                          </div>

                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
