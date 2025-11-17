import { tool } from "ai";
import { z } from "zod";
import { readDocument } from "@/lib/pinecone";

export const readAssignment = tool({
    description: 'Read an assignment and return the content of the assignment',
    inputSchema: z.object({
        query: z.string().describe('A hypothetical document in which similarity search would be performed upon'),
    }),
    execute: async ({ query }) => {
        return await readDocument('assignment', query);
    },
});

