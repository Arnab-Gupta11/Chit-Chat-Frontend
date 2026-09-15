export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-muted/50 p-4 md:p-8">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}

