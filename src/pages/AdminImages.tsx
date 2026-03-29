import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { products } from "@/data/products";
import { uploadShoeImage } from "@/lib/shoe-images";
import { useShoeImage } from "@/hooks/useShoeImage";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, Check, ArrowLeft, Image as ImageIcon } from "lucide-react";

const ProductImageRow = ({ product }: { product: typeof products[0] }) => {
  const { toast } = useToast();
  const imageUrl = useShoeImage(product.id, product.image);
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      await uploadShoeImage(product.id, file, `${product.brand} ${product.model}`);
      setUploaded(true);
      toast({ title: "Image uploadée", description: `${product.brand} ${product.model}` });
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 border border-border rounded-xl bg-card">
      <div className="w-20 h-20 bg-secondary rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
        <img
          src={imageUrl}
          alt={`${product.brand} ${product.model}`}
          className="w-full h-full object-contain p-1"
          onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{product.brand}</p>
        <p className="font-semibold truncate">{product.model}</p>
        <p className="text-xs text-muted-foreground truncate">{product.id}</p>
      </div>
      <div className="flex items-center gap-2">
        {uploaded && <Check className="w-4 h-4 text-primary" />}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
          }}
        />
        <Button
          size="sm"
          variant="outline"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="w-3.5 h-3.5" />
          {uploading ? "..." : "Upload"}
        </Button>
      </div>
    </div>
  );
};

const AdminImages = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Accès restreint</h1>
          <p className="text-muted-foreground">Connectez-vous pour gérer les images.</p>
          <Button asChild><Link to="/connexion">Se connecter</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container flex items-center h-16 gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/shoes"><ArrowLeft className="w-5 h-5" /></Link>
          </Button>
          <ImageIcon className="w-5 h-5 text-primary" />
          <h1 className="font-bold">Gestion des images</h1>
        </div>
      </div>

      <main className="pt-20 pb-16">
        <div className="container max-w-3xl space-y-3">
          <p className="text-sm text-muted-foreground mb-6">
            Uploadez les images des chaussures. Elles remplaceront automatiquement les images par défaut sur tout le site.
          </p>
          {products.map((p) => (
            <ProductImageRow key={p.id} product={p} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminImages;
