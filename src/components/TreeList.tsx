import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Trash2, QrCode, ExternalLink } from "lucide-react";
import QRCode from "qrcode";

interface Tree {
  id: string;
  name: string;
  species: string;
  location: string;
  photo_url: string | null;
}

const TreeList = () => {
  const [trees, setTrees] = useState<Tree[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTrees();
  }, []);

  const fetchTrees = async () => {
    const { data, error } = await supabase
      .from("trees")
      .select("id, name, species, location, photo_url")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load trees",
        variant: "destructive",
      });
    } else {
      setTrees(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("trees").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete tree",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Tree deleted successfully",
      });
      fetchTrees();
    }
  };

  const downloadQRCode = async (treeId: string, treeName: string) => {
    try {
      const url = `${window.location.origin}/tree/${treeId}`;
      const qrCodeDataUrl = await QRCode.toDataURL(url, {
        width: 512,
        margin: 2,
        color: {
          dark: "#2d5016",
          light: "#ffffff",
        },
      });

      const link = document.createElement("a");
      link.href = qrCodeDataUrl;
      link.download = `${treeName.replace(/\s+/g, "-")}-QR.png`;
      link.click();

      toast({
        title: "Success",
        description: "QR code downloaded!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading trees...</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {trees.map((tree) => (
        <Card key={tree.id} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow">
          {tree.photo_url && (
            <div className="h-48 overflow-hidden bg-muted">
              <img
                src={tree.photo_url}
                alt={tree.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <CardHeader>
            <CardTitle className="text-xl">{tree.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{tree.species}</p>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">{tree.location}</p>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => downloadQRCode(tree.id, tree.name)}
                className="gap-1"
              >
                <QrCode className="w-4 h-4" />
                QR Code
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(`/tree/${tree.id}`, "_blank")}
                className="gap-1"
              >
                <ExternalLink className="w-4 h-4" />
                View
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete(tree.id)}
                className="gap-1"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      {trees.length === 0 && (
        <div className="col-span-full text-center py-12 text-muted-foreground">
          No trees added yet. Add your first tree to get started!
        </div>
      )}
    </div>
  );
};

export default TreeList;
