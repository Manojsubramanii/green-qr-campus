import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";

interface TreeFormProps {
  onSuccess: () => void;
}

const TreeForm = ({ onSuccess }: TreeFormProps) => {
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    let photoUrl = "";

    // Upload photo if provided
    if (photoFile) {
      const fileExt = photoFile.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("tree-photos")
        .upload(fileName, photoFile);

      if (uploadError) {
        toast({
          title: "Error",
          description: "Failed to upload photo",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { data } = supabase.storage.from("tree-photos").getPublicUrl(fileName);
      photoUrl = data.publicUrl;
    }

    // Insert tree data
    const { error } = await supabase.from("trees").insert({
      name: formData.get("name") as string,
      species: formData.get("species") as string,
      age: parseInt(formData.get("age") as string) || null,
      location: formData.get("location") as string,
      description: formData.get("description") as string,
      latitude: parseFloat(formData.get("latitude") as string) || null,
      longitude: parseFloat(formData.get("longitude") as string) || null,
      photo_url: photoUrl,
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Tree added successfully!",
      });
      onSuccess();
    }
    setLoading(false);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Add New Tree</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tree Name *</Label>
              <Input id="name" name="name" placeholder="Ancient Oak" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="species">Species *</Label>
              <Input id="species" name="species" placeholder="Quercus robur" required />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Age (years)</Label>
              <Input id="age" name="age" type="number" placeholder="150" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input id="location" name="location" placeholder="Main Quad, North Side" required />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input id="latitude" name="latitude" type="number" step="any" placeholder="40.7128" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input id="longitude" name="longitude" type="number" step="any" placeholder="-74.0060" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Tell the story of this tree..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="photo">Photo</Label>
            <div className="flex items-center gap-2">
              <Input
                id="photo"
                type="file"
                accept="image/*"
                onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                className="flex-1"
              />
              <Upload className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Adding Tree..." : "Add Tree"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TreeForm;
