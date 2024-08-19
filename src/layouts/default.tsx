import { Link } from "@nextui-org/link";
import { Divider } from "@nextui-org/divider";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useSelector } from "react-redux";

import { Navbar } from "@/components/navbar";
import { verifyJWT, JWT_SECRET } from "@/config/io";
import type { RootState } from "@/store";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = useSelector((state: RootState) => state.user.id)
  useEffect(() => {
    if (!token) return;
    const verified = verifyJWT(token, JWT_SECRET)
    verified.then().catch(
      () => Cookies.remove("token"),
    )
  }, [token])
  return (
    <div className="relative flex flex-col h-screen">
      <Navbar />
      <Divider className="m-0" />
      <main className="container mx-auto max-w-7xl px-6 flex-grow pt-16">
        {children}
      </main>
      <footer className="w-full flex items-center justify-center py-3">
        <Link
          isExternal
          className="flex items-center gap-1 text-current"
          href="https://github.com/Xanazf/gotonic-test"
          title="Xanazf Github"
        >
          <span className="text-default-600">Powered by</span>
          <p className="text-primary">Xanazf</p>
        </Link>
      </footer>
    </div>
  );
}
