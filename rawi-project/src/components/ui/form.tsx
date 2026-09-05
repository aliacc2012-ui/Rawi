export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-xs font-bold my-4">
      {label}
      {children}
    </label>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full mt-2 border border-gray-300 rounded-xl px-3.5 py-3 bg-[#fafafa] font-normal text-sm focus-visible:outline-2 focus-visible:outline-rawi-yellow ${props.className ?? ""}`}
    />
  );
}

export function PrimaryButton({
  children,
  loading,
  loadingLabel = "Please wait…",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean; loadingLabel?: string }) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`w-full bg-rawi-yellow text-black font-extrabold rounded-full px-5 py-3.5 mt-2 disabled:opacity-60 disabled:cursor-not-allowed hover:brightness-[1.03] transition ${props.className ?? ""}`}
    >
      {loading ? loadingLabel : children}
    </button>
  );
}

export function ErrorNote({ children }: { children: React.ReactNode }) {
  if (!children) return null;
  return (
    <p role="alert" className="text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5 mt-4">
      {children}
    </p>
  );
}

export function SuccessNote({ children }: { children: React.ReactNode }) {
  if (!children) return null;
  return (
    <p role="status" className="text-green-700 text-sm bg-green-50 border border-green-100 rounded-xl px-3.5 py-2.5 mt-4">
      {children}
    </p>
  );
}
