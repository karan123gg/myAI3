import { Pinecone } from '@pinecone-database/pinecone';
import { FilterType } from '@/types/data';
import { searchResultsToChunks, getSourcesFromChunks, getContextFromSources } from '@/lib/sources';

if (!process.env.PINECONE_API_KEY) {
    throw new Error('PINECONE_API_KEY is not set');
}

export const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
});

export const pineconeIndex = pinecone.Index('bit');

export async function readDocument(
    filterType: FilterType,
    query: string,
    class_no?: number
): Promise<string> {
    const filter: Record<string, any> = {
        source_type: { $eq: filterType },
    };
    if (class_no) {
        filter.class_no = { $eq: `${class_no}` };
    }
    const results = await pineconeIndex.namespace('default').searchRecords({
        query: {
            inputs: {
                text: query,
            },
            topK: 40,
            filter: filter,
        },
        fields: ['text', 'pre_context', 'post_context', 'source_url', 'source_description', 'source_type', 'class_no', 'order'],
    });

    console.log(results);

    const chunks = searchResultsToChunks(results);
    const sources = getSourcesFromChunks(chunks);
    const context = getContextFromSources(sources);
    return `<results>${context}</results>`;
}