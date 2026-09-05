import 'react-native-get-random-values';

import { v4 as uuidv4 } from 'uuid';

/** UUID v4 safe on Hermes (uuid@14 uses bare `crypto`, which RN lacks). */
export function createId(): string {
  const random = new Uint8Array(16);
  globalThis.crypto.getRandomValues(random);

  return uuidv4({ random });
}
