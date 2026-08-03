export async function fetchText(
    input: RequestInfo | URL,
    init?: RequestInit,
): Promise<string> {
    const response = await fetch(input, init);

    if (!response.ok) {
        throw new Error(
            `Request to ${input} failed (${response.status} ${response.statusText})`,
        );
    }

    return response.text();
}