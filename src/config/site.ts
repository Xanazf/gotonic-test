export type SiteConfig = typeof siteConfig;

export function buttonProps(condition: boolean, color: string) {
  return !condition ?
    `w-5/6 sm:w-4/12 bg-${color}-400 text-default-100 rounded-lg p-2 hover:bg-${color}-300 hover:text-default-200 transition-all duration-300`
    : "w-5/6 sm:w-4/12 bg-default-400 text-default-100 rounded-lg p-2"
}

export const siteConfig = {
  name: "Gotoinc Test E-Commerce",
  description: "We sellin'.",
  navItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Sign in",
      href: "/signin",
    },
    {
      label: "Sign up",
      href: "/signup",
    },
  ],
  loggedInNavItems: [
    {
      label: "Home",
      href: "/"
    },
    {
      label: "Requests",
      href: "/requests",
    },
    {
      label: "Create",
      href: "/create"
    },
    {
      label: "Sign out",
      href: "/signout"
    }
  ],
};
