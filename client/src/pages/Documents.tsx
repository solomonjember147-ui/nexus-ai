import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardNav } from "@/components/DashboardNav";
import { Plus, Trash2, FileText, Lock, Users, Globe } from "lucide-react";
import { toast } from "sonner";

const accessIcons = {
  private: Lock,
  team: Users,
  public: Globe,
};

export default function Documents() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [isPublic, setIsPublic] = useState<"private" | "team" | "public">("private");

  const { data: documents = [], isLoading, refetch } = trpc.documents.list.useQuery();
  const createMutation = trpc.documents.create.useMutation({
    onSuccess: () => {
      toast.success("Document created successfully!");
      setTitle("");
      setContent("");
      setCategory("");
      setTags("");
      setIsPublic("private");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to create document: ${error.message}`);
    },
  });

  const deleteMutation = trpc.documents.delete.useMutation({
    onSuccess: () => {
      toast.success("Document deleted!");
      refetch();
    },
  });

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Document title is required");
      return;
    }
    await createMutation.mutateAsync({
      title,
      content,
      category,
      tags,
      isPublic,
    });
  };

  const handleDeleteDocument = (docId: number) => {
    if (confirm("Are you sure you want to delete this document?")) {
      deleteMutation.mutate({ id: docId });
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardNav />

      <main className="flex-1 lg:ml-64 p-4 lg:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Knowledge Base</h1>
            <p className="text-muted-foreground">Store and organize your documents with AI-powered search</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Create Document Form */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  New Document
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateDocument} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Title</label>
                    <Input
                      placeholder="Document title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground">Content</label>
                    <textarea
                      placeholder="Document content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full mt-1 p-2 rounded border border-border text-foreground bg-background text-sm"
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground">Category</label>
                    <Input
                      placeholder="e.g., Research, Notes"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground">Tags</label>
                    <Input
                      placeholder="Comma-separated tags"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground">Access Level</label>
                    <select
                      value={isPublic}
                      onChange={(e) => setIsPublic(e.target.value as any)}
                      className="w-full mt-1 p-2 rounded border border-border text-foreground bg-background"
                    >
                      <option value="private">Private</option>
                      <option value="team">Team</option>
                      <option value="public">Public</option>
                    </select>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? "Creating..." : "Create Document"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Documents List */}
            <div className="lg:col-span-2 space-y-4">
              {isLoading ? (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground">Loading documents...</p>
                  </CardContent>
                </Card>
              ) : documents.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground text-center">No documents yet. Create one to get started!</p>
                  </CardContent>
                </Card>
              ) : (
                documents.map((doc) => {
                  const AccessIcon = accessIcons[doc.isPublic as keyof typeof accessIcons] || Lock;
                  return (
                    <Card key={doc.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <FileText className="w-5 h-5 text-muted-foreground" />
                              <h3 className="font-semibold text-foreground">{doc.title}</h3>
                            </div>

                            {doc.content && (
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                {doc.content}
                              </p>
                            )}

                            <div className="flex flex-wrap gap-2">
                              {doc.category && (
                                <Badge variant="outline">{doc.category}</Badge>
                              )}
                              {doc.tags && doc.tags.split(",").map((tag) => (
                                <Badge key={tag.trim()} variant="secondary">
                                  {tag.trim()}
                                </Badge>
                              ))}
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <AccessIcon className="w-3 h-3" />
                                {doc.isPublic}
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => handleDeleteDocument(doc.id)}
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
