import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { TreePine, QrCode, Heart, MessageCircle, Shield } from "lucide-react";
import heroTree from "@/assets/hero-tree.jpg";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: QrCode,
      title: "Scan & Discover",
      description: "Scan QR codes on trees to learn their unique stories and details",
    },
    {
      icon: Heart,
      title: "Show Your Love",
      description: "Like your favorite trees and see which ones are campus favorites",
    },
    {
      icon: MessageCircle,
      title: "Share Memories",
      description: "Post comments and memories about trees that have touched your life",
    },
    {
      icon: Shield,
      title: "Admin Control",
      description: "Administrators can easily add and manage all campus trees",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${heroTree})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70" />
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <TreePine className="w-20 h-20 mx-auto mb-6 text-primary-foreground animate-fade-in" />
          <h1 className="text-5xl md:text-6xl font-bold text-primary-foreground mb-6 animate-fade-in">
            Campus Tree Directory
          </h1>
          <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8 animate-fade-in">
            Discover, appreciate, and share the stories of trees on our campus
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-8"
              onClick={() => navigate("/auth")}
            >
              Admin Login
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-background to-secondary/20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-primary mb-4">
              Connect with Nature
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Every tree has a story. Scan, explore, and share your connection with the
              natural beauty of our campus.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="text-center shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 border-2"
              >
                <CardContent className="pt-8 pb-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <feature.icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-primary">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-secondary/20 to-background">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-primary mb-4">How It Works</h2>
          </div>

          <div className="space-y-8">
            <Card className="shadow-lg border-2">
              <CardContent className="p-8 flex gap-6 items-start">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-xl flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-primary mb-2">
                    Find a Tree with a QR Code
                  </h3>
                  <p className="text-muted-foreground">
                    Look for trees around campus that have QR codes attached to them.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-2">
              <CardContent className="p-8 flex gap-6 items-start">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-xl flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-primary mb-2">
                    Scan the QR Code
                  </h3>
                  <p className="text-muted-foreground">
                    Use your phone's camera to scan the QR code and discover the tree's
                    unique page.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-2">
              <CardContent className="p-8 flex gap-6 items-start">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-xl flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-primary mb-2">
                    Explore, Like & Comment
                  </h3>
                  <p className="text-muted-foreground">
                    Read about the tree, like it, and share your memories or thoughts in
                    the comments.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t bg-gradient-to-br from-background to-secondary/10">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; 2025 Campus Tree Directory. Connecting people with nature.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
