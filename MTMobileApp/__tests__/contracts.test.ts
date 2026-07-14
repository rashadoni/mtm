import { FIELD_APP_CONFIG } from '../src/config/app';
import { api, normalizeBaseUrl } from '../src/services/api';
import { createOperationId } from '../src/services/offline';

describe('mobile API contract helpers', () => {
  it('normalizes an origin to the MTM v1 API', () => {
    expect(normalizeBaseUrl('https://staging.example.com/')).toBe(
      'https://staging.example.com/api/v1/mtm',
    );
  });

  it('does not duplicate an existing MTM API suffix', () => {
    expect(normalizeBaseUrl('https://staging.example.com/api/v1/mtm')).toBe(
      'https://staging.example.com/api/v1/mtm',
    );
  });

  it('creates UUIDv4-shaped operation ids for idempotent retries', () => {
    expect(createOperationId()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  it('sends the tenant selected by the user in the auth request', async () => {
    const fetchMock = jest.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: { token: 'test-token', agent: {} } }),
    } as Response);

    await api.login('agent@example.com', 'secret', ' Zeytun ');

    expect(fetchMock).toHaveBeenCalledWith(
      `${FIELD_APP_CONFIG.apiBaseUrl}/mobile/auth`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          email: 'agent@example.com',
          password: 'secret',
          organizationSlug: 'zeytun',
        }),
      }),
    );

    await api.logout();
    fetchMock.mockRestore();
  });
});
