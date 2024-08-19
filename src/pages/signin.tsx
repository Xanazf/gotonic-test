import { Input } from "@nextui-org/input";
import { useState } from "react";
import Cookies from "js-cookie"

import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import { PhEye, PhEyeSlash } from "@/components/icons";
import { signIn, verifyJWT, JWT_SECRET } from "@/config/io";
import { userData } from "@/hooks/slices";
import { buttonProps } from "@/config/site";
import { useAppDispatch } from "@/hooks/reduxHooks";

export default function SigninPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const dispatch = useAppDispatch()

  function toggleVisibility() {
    setIsVisible(prev => !prev)
  }

  async function sendSignin() {
    try {
      const props = {
        email: email,
        token: password,
      }
      const res = await signIn(props)
      if (typeof res !== "string") return
      const verified = await verifyJWT(res, JWT_SECRET)
      dispatch(userData({ id: verified.payload as string }))
      Cookies.set("token", res, { sameSite: "strict" })
      window.location.href = "/create"
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <h1 className={title({ color: "green", size: "md" }) + " p-1"}>Sign in</h1>
        <Input
          onChange={(e) => setEmail(e.target.value)}
          labelPlacement="outside"
          label="Email"
          isRequired
          type="email"
          className="w-5/6 sm:w-4/12"
          variant="faded"
        />
        <Input
          onChange={(e) => setPassword(e.target.value)}
          labelPlacement="outside"
          variant="faded"
          label="Password"
          isRequired
          type={isVisible ? "text" : "password"}
          className="w-5/6 sm:w-4/12"
          onKeyDown={(e) => e.key === "Enter" && sendSignin()}
          endContent={
            <button className="focus:outline-none" type="button" onClick={toggleVisibility} aria-label="toggle password visibility">
              {isVisible ? (
                <PhEyeSlash className="text-2xl text-default-400 pointer-events-none" />
              ) : (
                <PhEye className="text-2xl text-default-400 pointer-events-none" />
              )}
            </button>
          }
        />
        <button
          className={buttonProps(!email || !password, "green")}
          onClick={sendSignin}>Sign in</button>
      </section>
    </DefaultLayout>
  );
}
