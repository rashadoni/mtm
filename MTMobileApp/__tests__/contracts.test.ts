import { normalizeBaseUrl } from '../src/services/api';
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
});
