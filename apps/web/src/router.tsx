import { createRouter, createRoute, createRootRouteWithContext, redirect, Outlet } from '@tanstack/react-router';
import App from './App';
import { Login } from './routes/login';
import { Register } from './routes/register';
import { AuthContextType } from './context/auth-context';

interface RouterContext {
    auth: AuthContextType;
}

// Root component just renders outlet
const RootComponent = () => {
    return <Outlet />;
};

const root = createRootRouteWithContext<RouterContext>()({
    component: RootComponent,
});

const indexRoute = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: App,
    beforeLoad: ({ context }) => {
        if (!context.auth.isAuthenticated && !context.auth.isLoading) {
            throw redirect({
                to: '/login',
            });
        }
    },
});

const loginRoute = createRoute({
    getParentRoute: () => root,
    path: '/login',
    component: Login,
    beforeLoad: ({ context }) => {
        if (context.auth.isAuthenticated) {
            throw redirect({
                to: '/',
            });
        }
    },
});

const registerRoute = createRoute({
    getParentRoute: () => root,
    path: '/register',
    component: Register,
    beforeLoad: ({ context }) => {
        if (context.auth.isAuthenticated) {
            throw redirect({
                to: '/',
            });
        }
    },
});

const routeTree = root.addChildren([indexRoute, loginRoute, registerRoute]);

export const router = createRouter({
    routeTree,
    context: {
        auth: undefined!, // We'll inject this in main.tsx
    },
});

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}
