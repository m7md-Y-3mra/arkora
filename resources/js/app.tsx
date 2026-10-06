import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { DirectionProvider } from '@radix-ui/react-direction';
import { Toaster } from 'sonner';

const appName = import.meta.env.VITE_APP_NAME || 'أركورا';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <DirectionProvider dir="rtl">
                <App {...props} />
                <Toaster richColors position="top-center" dir="rtl" />
            </DirectionProvider>,
        );
    },
    progress: {
        color: '#B59A7A',
    },
});
