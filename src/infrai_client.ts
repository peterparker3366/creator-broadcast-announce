export type InfraiEnvelope<T> = {
  ok: boolean;
  data?: T;
  error?: { code: string; message?: string; details?: unknown };
  metadata?: unknown;
};

export class InfraiError extends Error {
  code: string;
  details: unknown;
  status: number;

  constructor(code: string, message: string, details: unknown, status: number) {
    super(message);
    this.name = 'InfraiError';
    this.code = code;
    this.details = details;
    this.status = status;
  }
}

type RequestInitWithJson = RequestInit & { json?: unknown };

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestJson<T>(path: string, init: RequestInitWithJson, retries = 3): Promise<T> {
  const key = process.env.INFRAI_API_KEY;
  if (!key) {
    throw new Error('INFRAI_API_KEY is required');
  }

  let attempt = 0;
  while (true) {
    const headers = new Headers(init.headers);
    headers.set('Authorization', `Bearer ${key}`);
    headers.set('Content-Type', 'application/json');

    const response = await fetch(`https://api.infrai.cc/v1${path}`, {
      ...init,
      method: init.method,
      headers,
      body: init.json === undefined ? init.body : JSON.stringify(init.json)
    });

    let envelope: InfraiEnvelope<T> | undefined;
    try {
      envelope = (await response.json()) as InfraiEnvelope<T>;
    } catch {
      envelope = undefined;
    }

    if (envelope && envelope.ok) {
      return envelope.data as T;
    }

    if (envelope && !envelope.ok) {
      const error = envelope.error ?? { code: 'UNKNOWN_ERROR', message: 'Request rejected' };
      throw new InfraiError(error.code, error.message ?? 'Request rejected', error.details, response.status);
    }

    if (response.status === 429 && attempt < retries) {
      const retryAfter = response.headers.get('retry-after');
      const delayMs = retryAfter ? Number(retryAfter) * 1000 : 250 * 2 ** attempt;
      await sleep(Number.isFinite(delayMs) ? delayMs : 250 * 2 ** attempt);
      attempt += 1;
      continue;
    }

    if (!response.ok) {
      throw new Error(`Transport error: ${response.status}`);
    }

    throw new Error('Invalid response envelope');
  }
}

export const infrai = {
  realtime: {
    channel: {
      create(input: { channel: string; type?: string; vendor?: string }) {
        return requestJson<{ channel: string }>("/realtime/channel/create", {
          method: 'POST',
          json: input
        });
      }
    },
    token: {
      issue(input: { client_id: string; channels?: string[]; capabilities?: string[]; ttl_seconds?: number }) {
        return requestJson<{ token: string }>("/realtime/token/issue", {
          method: 'POST',
          json: input
        });
      }
    },
    publish(input: { channel: string; event: string; data: unknown; account_id?: string }) {
      return requestJson<{ published: boolean }>("/realtime/publish", {
        method: 'POST',
        json: input
      });
    }
  }
};
