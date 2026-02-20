import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import LoginButton from "@/components/LoginButton";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24 bg-white text-center">
      <div className="max-w-4xl w-full flex flex-col items-center z-10">
        <h1 className="text-6xl md:text-7xl font-black text-slate-900 mb-6 tracking-tight">
          Dice-Dine<span className="text-rose-600">.</span>
        </h1>
        <p className="text-xl text-slate-500 mb-12 max-w-2xl leading-relaxed">
          Your AI-powered foodie companion. Tell us what you crave, and we'll find the perfect spot for you.
        </p>
        <LoginButton />

        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 text-left w-full border-t border-gray-100 pt-16">
          <div className="p-6 transition-all hover:-translate-y-1">
            <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">01. AI Recommendations</h3>
            <p className="text-slate-500 leading-relaxed text-sm">Powered by GPT-4o to understand your exact cravings and preferences.</p>
          </div>
          <div className="p-6 transition-all hover:-translate-y-1">
            <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">02. Visual Discovery</h3>
            <p className="text-slate-500 leading-relaxed text-sm">Explore recommendations on an interactive map with key details.</p>
          </div>
          <div className="p-6 transition-all hover:-translate-y-1">
            <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">03. Save Favorites</h3>
            <p className="text-slate-500 leading-relaxed text-sm">Keep track of the best spots you've found for future dining.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
