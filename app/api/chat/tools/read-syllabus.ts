import { tool } from "ai";
import { z } from "zod";
import { readDocument } from "@/lib/pinecone";

export const readSyllabus = tool({
    description: 'Read a syllabus and return the content of the syllabus',
    inputSchema: z.object({
        query: z.string().describe('A hypothetical document in which similarity search would be performed upon'),
    }),
    execute: async ({ query }) => {
        return await readDocument('syllabus', query);
    },
});

