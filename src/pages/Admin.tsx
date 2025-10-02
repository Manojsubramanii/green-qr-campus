import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Session } from "@supabase/supabase-js";
import { Plus, LogOut } from "lucide-react";
import TreeForm from "@/components/TreeForm";
import TreeList from "@/components/TreeList";

const Admin = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully",
    });
    navigate("/");
  };

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-primary">Tree Management</h1>
            <p className="text-muted-foreground mt-2">Add and manage campus trees</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowForm(!showForm)} className="gap-2">
              <Plus className="w-4 h-4" />
              {showForm ? "View Trees" : "Add Tree"}
            </Button>
            <Button variant="outline" onClick={handleSignOut} className="gap-2">
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>

        {showForm ? (
          <TreeForm onSuccess={() => setShowForm(false)} />
        ) : (
          <TreeList />
        )}
      </div>
    </div>
  );
};

export default Admin;
