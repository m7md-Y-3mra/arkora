import type { AxiosStatic } from 'axios';
import type { route as routeFn } from 'ziggy-js';

declare global {
    interface Window {
        axios: AxiosStatic;
    }

    const route: typeof routeFn;
}
