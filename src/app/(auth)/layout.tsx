import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:flex flex-col justify-between bg-rawi-ink text-white p-12">
        <Link href="/" className="flex items-center gap-2.5 font-extrabold w-fit">
          <span className="w-[30px] h-[30px] rounded-[50%_50%_50%_8px] bg-rawi-yellow grid place-items-center text-black font-black -rotate-[8deg]">
            R
          </span>
          <span className="text-[19px] tracking-[0.12em]">RAWI</span>
        </Link>
        <div>
          <p className="text-4xl leading-tight tracking-[-0.03em] max-w-md">
            Your work deserves <span className="text-rawi-yellow">better</span> than a Drive link.
          </p>
          <p className="text-gray-400 mt-4 max-w-sm">
            Cinematic, branded client galleries — built for the way creators actually work.
          </p>
        </div>
        <p className="text-gray-500 text-sm">RAWI • راوي</p>
      </div>
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
