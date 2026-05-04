import { OpenAI } from "openai";
import { NextResponse } from "next/server";
import { SYSTEM_PROMPT } from "@/lib/constants";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { parseBotResponse } from "@/lib/utils";

let client: OpenAI | null = null;

function getClient(): OpenAI {
    if (!client) {
        client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    return client;
}

export async function POST(req: Request) {
    try {
        const { message } = await req.json();
        const session = await getServerSession(authOptions);

        const response = await getClient().responses.create({
            model: "gpt-5.2",
            instructions: SYSTEM_PROMPT,
            input: message,
        });

        const output_text = response.output_text;

        // Log the query to the database asynchronously
        (async () => {
            try {
                let userId = null;
                if (session?.user?.email) {
                    const user = await prisma.user.upsert({
                        where: { email: session.user.email },
                        update: {},
                        create: { email: session.user.email },
                    });
                    userId = user.id;
                }

                // Extract location context from the message string (it is appended by the frontend)
                // The frontend appends ` [Context: User location is ${locationInput}]`
                const locationMatch = message.match(/\[Context: User location is (.*?)\]/);
                const location = locationMatch ? locationMatch[1] : null;

                const parsed = parseBotResponse(output_text);
                let restaurantNames = null;

                if (parsed.type === "recommendation" && parsed.data["Recommended Restaurants"]) {
                    const names = parsed.data["Recommended Restaurants"].map((r: { Name: string }) => r.Name);
                    if (names.length > 0) {
                        restaurantNames = JSON.stringify(names);
                    }
                }

                // Remove the context part from the logged query to keep it clean
                const cleanQuery = message.replace(/\[Context: User location is .*?\]/, "").trim();

                await prisma.searchQuery.create({
                    data: {
                        query: cleanQuery,
                        location,
                        responseType: parsed.type,
                        restaurantNames,
                        userId,
                    }
                });
            } catch (dbError) {
                console.error("Error logging search query:", dbError);
            }
        })();

        return NextResponse.json({ output_text });

    } catch (error) {
        console.error("Error in chat API:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
