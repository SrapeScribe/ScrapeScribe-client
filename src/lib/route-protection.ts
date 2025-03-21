export const publicRoutes = [
    '/sign-in',
    '/sign-up',
    '/auth',
    '/',
    '/demo',
    '/about',
    '/help',
    '/uh'
];

export function isPublicRoute(pathname: string): boolean {
    return publicRoutes.some(route =>
        pathname === route ||
        pathname.startsWith(route + '/')
    );
}

export function isProtectedRoute(pathname: string): boolean {
    return !isPublicRoute(pathname);
}
