import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ExternalLink } from "lucide-react";

interface RedirectDialogProps {
  open: boolean;
  merchant: string;
  url: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const RedirectDialog = ({ open, merchant, url, onConfirm, onCancel }: RedirectDialogProps) => (
  <AlertDialog open={open} onOpenChange={(v) => !v && onCancel()}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle className="flex items-center gap-2">
          <ExternalLink className="w-5 h-5 text-primary" />
          Redirection vers {merchant}
        </AlertDialogTitle>
        <AlertDialogDescription>
          Vous allez être redirigé vers le site partenaire pour finaliser votre achat.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel onClick={onCancel}>Annuler</AlertDialogCancel>
        <AlertDialogAction onClick={onConfirm}>Continuer</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export default RedirectDialog;
