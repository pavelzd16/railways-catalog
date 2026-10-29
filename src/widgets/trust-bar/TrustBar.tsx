export function TrustBar() {
  return (
    <section className="py-6 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]/50">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 text-sm text-[hsl(var(--muted-foreground))]">
          <span className="font-medium">700+ позиций в каталоге</span>
          <span className="hidden md:inline text-[hsl(var(--border))]">•</span>
          <span className="font-medium">48 часов до отгрузки</span>
          <span className="hidden md:inline text-[hsl(var(--border))]">•</span>
          <span className="font-medium">РФ и СНГ</span>
        </div>
      </div>
    </section>
  )
}
