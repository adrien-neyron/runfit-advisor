-- Ajout cover_url sur le premier article de blog (Unsplash — paire de sneakers)
UPDATE public.blog_posts
SET cover_url = 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=1260&h=750&fit=crop&q=80'
WHERE slug = 'chaussures-homme-vs-femme-differences';
