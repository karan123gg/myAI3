import { tool } from "ai";
import { z } from "zod";
import { readDocument } from "@/lib/pinecone";

export const readSlideLecture = tool({
    description: 'Read a slide lecture and return the content of the lecture',
    inputSchema: z.object({
        query: z.string().describe('A hypothetical document in which similarity search would be performed upon'),
        class_no: z.number().optional().describe('The class number of the lecture (optional)'),
    }),
    execute: async ({ query, class_no }) => {
        return await readDocument('lecture_slide', query, class_no);
    },
});

