export default function SetupRequiredPage() {
  return (
    <div className="min-h-screen grid place-items-center p-6 bg-rawi-ink text-white">
      <div className="max-w-md text-center">
        <span className="inline-grid w-10 h-10 rounded-[50%_50%_50%_8px] bg-rawi-yellow place-items-center text-black font-black -rotate-[8deg] mb-6">R</span>
        <h1 className="text-2xl font-extrabold tracking-[-0.02em]">RAWI isn&rsquo;t configured yet</h1>
        <p className="text-gray-400 mt-3 leading-relaxed">
          This deployment is missing its Supabase credentials, so accounts, projects, and galleries
          aren&rsquo;t available yet. Add <code className="text-rawi-yellow">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code className="text-rawi-yellow">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to your environment and redeploy.
        </p>
        <p className="text-gray-500 text-sm mt-6">See README.md for the full setup checklist.</p>
      </div>
    </div>
  );
}
