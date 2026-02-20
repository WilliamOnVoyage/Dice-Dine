"use client";
import { signIn } from "next-auth/react";

export default function LoginButton() {
    return (
        <button
            onClick={() => signIn("google")}
            className="px-8 py-4 bg-slate-900 text-white rounded-md font-medium text-sm hover:bg-rose-600 transition-colors flex items-center gap-2"
        >
            <span>Sign in with Google</span>
        </button>
    );
}
