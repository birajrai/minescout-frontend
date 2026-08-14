export function Placeholder({ label }: { label: string }) {
  return (
    <div className="flex flex-col gap-3 items-center justify-center py-16 text-center">
      <h2 className="font-minecraft text-xl text-stone-900 dark:text-stone-100">{label}</h2>
      <p className="text-sm text-stone-500 dark:text-stone-400">This section is not available yet.</p>
    </div>
  )
}
