type StatCardProps = {
  label: string
  value: number
}

export function StatCard({ label, value }: StatCardProps) {
  return (
    <article className='rounded-2xl bg-surface-container-lowest p-4 shadow-ambient'>
      <p className='font-body-lg text-xs leading-snug text-on-surface-variant'>
        {label}
      </p>
      <p className='mt-3 font-h1 text-3xl leading-none font-semibold tracking-tight text-primary'>
        {value}
      </p>
    </article>
  )
}
