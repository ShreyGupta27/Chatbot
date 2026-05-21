export default function WidgetLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="widget-layout">
      {children}
    </div>
  )
}