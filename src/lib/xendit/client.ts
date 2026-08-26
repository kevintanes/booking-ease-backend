const XENDIT_SECRET_KEY = process.env.XENDIT_SECRET_KEY;

if (!XENDIT_SECRET_KEY) {
  throw new Error("Missing required env var: XENDIT_SECRET_KEY");
}

export const xenditRequest = async <T>(
  endpoint: string,
  method: string,
  body?: Record<string, unknown>,
): Promise<T> => {
  const credentials = Buffer.from(`${XENDIT_SECRET_KEY}:`).toString("base64");
  const response = await fetch(`https://api.xendit.co${endpoint}`, {
    method,
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return response.json() as Promise<T>;
};
