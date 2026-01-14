/* eslint-disable @typescript-eslint/no-explicit-any */

declare module 'ziggy-js' {
    export interface Config {
        url?: string
        port?: number | null
        defaults?: Record<string, any>
        routes: Record<string, any>
    }
    // Ziggy exporta una función `route` (default) para construir URLs
    const route: (
        name?: string,
        params?: any,
        absolute?: boolean,
        config?: Config
    ) => string

    export default route
}
