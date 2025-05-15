export interface Route {
    href: string
    label: string
    active: boolean
}

export interface SiteHeaderProps {
    routes: Route[];
}