import { OpenAI } from "openai";
import { NextResponse } from "next/server";
import { SYSTEM_PROMPT } from "@/lib/constants";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
    try {
        const { message } = await req.json();

        const response = await client.responses.create({
            model: "gpt-5.2",
            instructions: SYSTEM_PROMPT,
            input: message,
        });

        return NextResponse.json({ output_text: response.output_text });

    } catch (error) {
        console.error("Error in chat API:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
