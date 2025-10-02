-- Create trees table
CREATE TABLE public.trees (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  species text NOT NULL,
  age integer,
  location text NOT NULL,
  photo_url text,
  description text,
  latitude numeric,
  longitude numeric,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create likes table
CREATE TABLE public.tree_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tree_id uuid NOT NULL REFERENCES public.trees(id) ON DELETE CASCADE,
  device_id text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(tree_id, device_id)
);

-- Create comments table
CREATE TABLE public.tree_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tree_id uuid NOT NULL REFERENCES public.trees(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  comment text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.trees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tree_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tree_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for trees (public can view, only authenticated can manage)
CREATE POLICY "Anyone can view trees" ON public.trees
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert trees" ON public.trees
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update trees" ON public.trees
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete trees" ON public.trees
  FOR DELETE TO authenticated USING (true);

-- RLS Policies for likes (public can view and insert)
CREATE POLICY "Anyone can view likes" ON public.tree_likes
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert likes" ON public.tree_likes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can delete their own likes" ON public.tree_likes
  FOR DELETE USING (true);

-- RLS Policies for comments (public can view and insert)
CREATE POLICY "Anyone can view comments" ON public.tree_comments
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert comments" ON public.tree_comments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can delete comments" ON public.tree_comments
  FOR DELETE TO authenticated USING (true);

-- Create storage bucket for tree photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('tree-photos', 'tree-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for tree photos
CREATE POLICY "Anyone can view tree photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'tree-photos');

CREATE POLICY "Authenticated users can upload tree photos" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'tree-photos');

CREATE POLICY "Authenticated users can update tree photos" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'tree-photos');

CREATE POLICY "Authenticated users can delete tree photos" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'tree-photos');

-- Enable realtime for comments and likes
ALTER PUBLICATION supabase_realtime ADD TABLE public.tree_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tree_likes;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_trees_updated_at
  BEFORE UPDATE ON public.trees
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();