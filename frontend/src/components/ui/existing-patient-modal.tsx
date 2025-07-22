"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ExistingPatientModalProps {
  isOpen: boolean
  onClose: () => void
}

const dummyPatients = [
  "Alice Dupont",
  "Bob Martin",
  "Claire Dubois",
  "David Lefevre",
  "Emma Garcia",
  "François Petit",
  "Sophie Leroy",
  "Thomas Rousseau",
  "Laura Bernard",
  "Nicolas Durand",
  "Manon Moreau",
  "Antoine Laurent",
  "Camille Simon",
  "Julien Michel",
  "Chloé Richard",
  "Lucas David",
  "Léa Robert",
  "Maxime Thomas",
  "Eva Dubois",
  "Hugo Bertrand",
]

export function ExistingPatientModal({ isOpen, onClose }: ExistingPatientModalProps) {
  const handleSelectPatient = (patientName: string) => {
    console.log("Patient sélectionné:", patientName)
    // Here you would typically navigate to the patient's profile or load their data
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle>Patient existant</DialogTitle>
          <DialogDescription>Choisissez un patient dans la liste.</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-72 w-full rounded-md border p-4">
          <div className="grid gap-2">
            {dummyPatients.map((patient, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => handleSelectPatient(patient)}
              >
                {patient}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}