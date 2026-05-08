type ResponseOptions = {
  status?: number;
  headers?: HeadersInit;
};

export function apiError(message: string, status = 400, headers?: HeadersInit): Response {
  return Response.json({ error: message }, { status, headers });
}

export function apiSuccess<T>(data: T, options: ResponseOptions | number = {}): Response {
  const normalizedOptions: ResponseOptions = typeof options === 'number'
    ? { status: options }
    : options;
  const { status = 200, headers } = normalizedOptions;
  return Response.json(data, { status, headers });
}
