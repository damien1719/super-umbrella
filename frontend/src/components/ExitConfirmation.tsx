import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ExitConfirmationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export default function ExitConfirmation({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
}: ExitConfirmationProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Quitter l'éditeur ?</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {/* Rester (ferme seulement la modale) */}
          <AlertDialogCancel>Rester</AlertDialogCancel>
          {/* Quitter sans enregistrer */}
          <AlertDialogAction
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={onCancel}
          >
            Quitter sans enregistrer
          </AlertDialogAction>
          {/* Enregistrer et quitter */}
          <AlertDialogAction onClick={onConfirm}>
            Enregistrer et quitter
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
