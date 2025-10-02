import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Heart, MessageCircle, MapPin, Calendar } from "lucide-react";

interface Tree {
  id: string;
  name: string;
  species: string;
  age: number | null;
  location: string;
  description: string | null;
  photo_url: string | null;
  created_at: string;
}

interface Comment {
  id: string;
  author_name: string;
  comment: string;
  created_at: string;
}

const TreeDetail = () => {
  const { id } = useParams();
  const [tree, setTree] = useState<Tree | null>(null);
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [authorName, setAuthorName] = useState("");
  const { toast } = useToast();

  // Get or create device ID for likes
  const getDeviceId = () => {
    let deviceId = localStorage.getItem("deviceId");
    if (!deviceId) {
      deviceId = `device-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("deviceId", deviceId);
    }
    return deviceId;
  };

  useEffect(() => {
    if (id) {
      fetchTree();
      fetchLikes();
      fetchComments();
      subscribeToUpdates();
    }
  }, [id]);

  const fetchTree = async () => {
    const { data, error } = await supabase
      .from("trees")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Tree not found",
        variant: "destructive",
      });
    } else {
      setTree(data);
    }
  };

  const fetchLikes = async () => {
    const { count } = await supabase
      .from("tree_likes")
      .select("*", { count: "exact", head: true })
      .eq("tree_id", id);

    setLikes(count || 0);

    const deviceId = getDeviceId();
    const { data } = await supabase
      .from("tree_likes")
      .select("*")
      .eq("tree_id", id)
      .eq("device_id", deviceId)
      .maybeSingle();

    setHasLiked(!!data);
  };

  const fetchComments = async () => {
    const { data } = await supabase
      .from("tree_comments")
      .select("*")
      .eq("tree_id", id)
      .order("created_at", { ascending: false });

    setComments(data || []);
  };

  const subscribeToUpdates = () => {
    const channel = supabase
      .channel(`tree-${id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tree_likes",
          filter: `tree_id=eq.${id}`,
        },
        () => fetchLikes()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tree_comments",
          filter: `tree_id=eq.${id}`,
        },
        () => fetchComments()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleLike = async () => {
    const deviceId = getDeviceId();

    if (hasLiked) {
      await supabase
        .from("tree_likes")
        .delete()
        .eq("tree_id", id)
        .eq("device_id", deviceId);
    } else {
      await supabase.from("tree_likes").insert({
        tree_id: id,
        device_id: deviceId,
      });
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim() || !authorName.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both name and comment",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("tree_comments").insert({
      tree_id: id,
      author_name: authorName,
      comment: newComment,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive",
      });
    } else {
      setNewComment("");
      toast({
        title: "Success",
        description: "Comment posted!",
      });
    }
  };

  if (!tree) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {tree.photo_url && (
          <div className="w-full h-[400px] rounded-2xl overflow-hidden mb-8 shadow-xl">
            <img
              src={tree.photo_url}
              alt={tree.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <CardTitle className="text-4xl">{tree.name}</CardTitle>
            <p className="text-xl text-muted-foreground italic">{tree.species}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {tree.description && (
              <p className="text-foreground leading-relaxed">{tree.description}</p>
            )}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {tree.age && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{tree.age} years old</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{tree.location}</span>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                variant={hasLiked ? "default" : "outline"}
                onClick={handleLike}
                className="gap-2"
              >
                <Heart className={`w-5 h-5 ${hasLiked ? "fill-current" : ""}`} />
                {likes} {likes === 1 ? "Like" : "Likes"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Memories & Comments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleComment} className="space-y-4">
              <Input
                placeholder="Your name"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                required
              />
              <Textarea
                placeholder="Share your memory of this tree..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
                required
              />
              <Button type="submit">Post Comment</Button>
            </form>

            <div className="space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-4 rounded-lg bg-gradient-to-br from-card to-secondary/10 border"
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-semibold text-primary">{comment.author_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-foreground">{comment.comment}</p>
                </div>
              ))}
              {comments.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No comments yet. Be the first to share a memory!
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TreeDetail;
