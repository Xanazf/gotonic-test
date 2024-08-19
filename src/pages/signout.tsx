import Cookies from "js-cookie";
import { useEffect } from "react";

import DefaultLayout from "@/layouts/default";
import { signoutUser } from "@/hooks/slices";
import { useAppDispatch } from "@/hooks/reduxHooks";

export default function SignoutPage() {
  const token = Cookies.get("token");
  const dispatch = useAppDispatch()
  useEffect(() => {
    if (token) {
      Cookies.remove("token");
      dispatch(signoutUser())
      window.location.href = "/"
    }
  }, [])
  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        Signing Out...
      </section>
    </DefaultLayout>
  );
}
