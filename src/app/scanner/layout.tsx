export default function ScannerLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="w-full px-4 py-6 pb-24 md:pb-6">
      {children}
    </div>
  )
}
