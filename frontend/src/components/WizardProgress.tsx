interface WizardProgressProps {
  step: number;
  total: number;
}

export function WizardProgress({ step, total }: WizardProgressProps) {
  const items = Array.from({ length: total }, (_, i) => i + 1);
  return (
    <div className="flex space-x-2 mb-4">
      {items.map((i) => (
        <div
          key={i}
          className={`flex-1 h-2 rounded ${i <= step ? 'bg-blue-500' : 'bg-gray-300'}`}
        />
      ))}
    </div>
  );
}
