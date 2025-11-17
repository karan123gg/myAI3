import { tool } from "ai";
import { z } from "zod";
import { readDocument } from "@/lib/pinecone";

export const readNotebookLecture = tool({
    description: 'Read a lecture notebook and return the content of the lecture',
    inputSchema: z.object({
        query: z.string().describe('A hypothetical document in which similarity search would be performed upon'),
    }),
    execute: async ({ query }) => {
        return await readDocument('lecture_notebook', query);
    },
});