import { config } from './config';
import { createClient } from './contracts';

/** The app-wide client for the configured network. */
export const settlix = createClient(config);
