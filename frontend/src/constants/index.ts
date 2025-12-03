export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL_SERPROD;

if (!API_BASE_URL) {
    throw new Error('NEXT_PUBLIC_API_URL is not defined');
}
