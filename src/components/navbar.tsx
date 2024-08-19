import { useEffect, useState } from "react";
import { Link } from "@nextui-org/link";
import {
  Navbar as NextUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
} from "@nextui-org/navbar";
import { link as linkStyles } from "@nextui-org/theme";
import clsx from "clsx";
import Cookies from "js-cookie";
import { Divider } from "@nextui-org/divider";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import { PhLinuxLogo } from "@/components/icons";
import { verifyJWT, JWT_SECRET } from "@/config/io";
import { useAppSelector } from "@/hooks/reduxHooks";

export const Navbar = () => {
  const [token, setToken] = useState<string | null>(Cookies.get("token") || null);
  const stateId = useAppSelector(state => state.user.id)
  if (token) {
    siteConfig.navItems = siteConfig.navItems.filter((item) => ["/signin", "/signup"].indexOf(item.href) === -1);
  }
  useEffect(() => {
    const verified = token ? verifyJWT(token, JWT_SECRET) : Promise.reject()
    const allowedRoutes = ["/", "/signin", "/signup"]
    const loggedOutRoutes = ["/signin", "/signup"]
    const location = window.location.pathname
    const checkProtected = allowedRoutes.indexOf(location) === -1
    const checkUnprotected = loggedOutRoutes.indexOf(location) !== -1
    verified
      .then((payload) => {
        setToken(payload.payload as string)
        const checkIdConsistency = stateId === token
        if (!checkIdConsistency) throw new Error("id mismatch")
        checkUnprotected && (window.location.pathname = "/")
      })
      .catch(() => {
        checkProtected && (window.location.pathname = "/signin")
      })
  }, [token])

  return (
    <NextUINavbar maxWidth="full" position="sticky" className="justify-between">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand className="gap-3 max-w-fit">
          <Link
            className="flex justify-start items-center gap-1"
            color="foreground"
            href="/"
          >
            <PhLinuxLogo className="w-9 h-9" />
            <p className="font-bold text-inherit">Gotoinc E-Commerce</p>
          </Link>
        </NavbarBrand>
      </NavbarContent>


      <NavbarContent className="basis-1 pl-4" justify="end">
        <div className="hidden lg:flex gap-4 justify-start ml-2">
          {siteConfig[token ? "loggedInNavItems" : "navItems"].map((item, index) => (
            <NavbarItem key={item.href} className="flex gap-4">
              <Link
                className={clsx(
                  linkStyles({ color: "foreground", underline: window.location.pathname === item.href ? "always" : "hover" }),
                  "data-[active=true]:text-primary data-[active=true]:font-medium",
                )}
                href={item.href}
              >
                {item.label}
              </Link>
              {index !== siteConfig[token ? "loggedInNavItems" : "navItems"].length - 1
                && <Divider className="m-0" orientation="vertical" />
              }
            </NavbarItem>
          ))}
        </div>
        <ThemeSwitch />
        <NavbarMenuToggle className="lg:hidden" />
      </NavbarContent>

      <NavbarMenu>
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {token && (
            siteConfig.loggedInNavItems.map((item, index) => (
              <NavbarMenuItem key={`${item}-${index}`}>
                <Link
                  className={clsx(
                    linkStyles({
                      color: "foreground",
                      underline: window.location.pathname === item.href
                        ? "always"
                        : "hover",
                      size: "lg"
                    })
                  )}
                  href={item.href}
                >
                  {item.label}
                </Link>
              </NavbarMenuItem>
            ))
          )}
          {!token && siteConfig.navItems.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              <Link
                className={clsx(
                  linkStyles({
                    color: "foreground",
                    underline: window.location.pathname === item.href
                      ? "always"
                      : "hover",
                    size: "lg"
                  }),
                  "data-[active=true]:text-primary data-[active=true]:font-medium",
                )}
                href={item.href}
              >
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}
        </div>
      </NavbarMenu>
    </NextUINavbar>
  );
};
