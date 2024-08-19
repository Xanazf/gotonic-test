import { Input } from "@nextui-org/input";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";

import { PhEye, PhEyeSlash } from "@/components/icons";
import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import { verifyJWT, signUp, JWT_SECRET } from "@/config/io";
import { buttonProps } from "@/config/site";
import { userData } from "@/hooks/slices";
import { useAppDispatch } from "@/hooks/reduxHooks";

export default function SignupPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string | null>(Cookies.get("token") || null);

  const toggleVisibility = () => setIsVisible(!isVisible);
  const dispatch = useAppDispatch();

  const register = async () => {
    return await signUp({ name, email, password, locale: "uk-UA", location: { country: "Ukraine", city: "Kyiv" } });
  }
  const sendRegister = () => {
    if (!name || !email || !password) return
    register().then(async (data) => {
      if (data === 'error' || !data) {
        console.log("unsuccessful")
        return
      }
      console.log(data)
      const verified = await verifyJWT(data.token, JWT_SECRET)
      dispatch(userData({ id: verified.payload as string, username: name, email, location: "Ukraine/Kyiv", locale: "uk-UA" }))
      Cookies.set('token', data.token)
      return
    })
  }
  useEffect(() => {
    if (!token) return;
    const verified = verifyJWT(token, JWT_SECRET)
    verified.then(payload => {
      payload ? window.location.href = "/" : setToken(null)
    })
  }, [token])
  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <h1 className={title({ color: "pink", size: "md" }) + " p-1"}>Sign Up</h1>
        <Input onChange={(e) => setName(e.target.value)} labelPlacement="outside" label="Name" isRequired type="text" className="w-5/6 sm:w-4/12" variant="faded" />
        <Input onChange={(e) => setEmail(e.target.value)} labelPlacement="outside" label="Email" isRequired type="email" className="w-5/6 sm:w-4/12" variant="faded" />
        <Input
          onChange={(e) => setPassword(e.target.value)}
          labelPlacement="outside"
          variant="faded"
          label="Password"
          isRequired
          type={isVisible ? "text" : "password"}
          className="w-5/6 sm:w-4/12"
          onKeyDown={(e) => e.key === "Enter" && sendRegister()}
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
          className={buttonProps(!name || !email || !password, "cyan")}
          onClick={sendRegister}>Sign Up</button>

      </section>
    </DefaultLayout>
  );
}
