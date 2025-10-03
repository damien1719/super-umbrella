import { useEffect } from 'react';
import { useToastStore, type ToastItem } from '@/store/toast';

function Toast({ item }: { item: ToastItem }) {
  const dismiss = useToastStore((s) => s.dismiss);

  useEffect(() => {
    const t = setTimeout(() => dismiss(item.id), item.duration ?? 2000);
    return () => clearTimeout(t);
  }, [item.id, item.duration, dismiss]);

  const color =
    item.type === 'error'
      ? 'bg-red-600'
      : item.type === 'info'
        ? 'bg-gray-800'
        : 'bg-green-600';

  return (
    <div
      className={`pointer-events-auto shadow-lg rounded-md px-3 py-2 text-white text-sm ${color}`}
    >
      {item.message}
    </div>
  );
}

export default function Toaster() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div className="fixed bottom-4 right-4 z-[1000] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <Toast key={t.id} item={t} />
      ))}
    </div>
  );
}
