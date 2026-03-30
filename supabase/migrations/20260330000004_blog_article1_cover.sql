-- Ajout cover_url sur le premier article de blog
UPDATE public.blog_posts
SET cover_url = 'https://images.pexels.com/photos/3763869/pexels-photo-3763869.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
WHERE slug = 'chaussures-homme-vs-femme-differences'
  AND (cover_url IS NULL OR cover_url = '');
