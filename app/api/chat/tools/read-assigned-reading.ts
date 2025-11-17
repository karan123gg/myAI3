import { tool } from "ai";
import { z } from "zod";
import { readDocument } from "@/lib/pinecone";

export const readAssignedReading = tool({
    description: 'Read an assigned reading from a specific class and return the content of the reading',
    inputSchema: z.object({
        query: z.string().describe('A hypothetical document in which similarity search would be performed upon'),
        class_no: z.number().optional().describe('The class number of the assigned reading (optional)'),
    }),
    execute: async ({ query, class_no }) => {
        return await readDocument('assigned_reading', query, class_no);
    },
});

