import { Input } from "@nextui-org/input";
import { DatePicker } from "@nextui-org/date-picker";
import { useState } from "react";
import { getLocalTimeZone, parseDate, today } from "@internationalized/date";
import { Badge } from "@nextui-org/badge";
import { title } from "@/components/primitives";
import DashboardLayout from "@/layouts/dashboard";
import { Divider } from "@nextui-org/divider";
import { createRequest, JWT_SECRET, signJWT, type createRequestProps } from "@/config/io";
import { buttonProps } from "@/config/site";
import { useAppSelector } from "@/hooks/reduxHooks";

export default function OrderPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [contents, setContents] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const userData = useAppSelector((state) => state.user)

  async function sendCreate() {
    if (!from || !to || !userData.id) return;
    const requestProps: createRequestProps = {
      userId: await signJWT(userData.id, JWT_SECRET),
      type: "order",
      route: {
        from,
        to,
      },
      parcel: contents,
      description
    };
    date && (requestProps.date = date);
    const res = await createRequest(requestProps);
    if (typeof res === 'string') {
      setSuccess(true);
      setTimeout(setSuccess, 5000, false);
    }
  }

  return (
    <DashboardLayout>
      <section className="flex flex-col flex-shrink-0 items-center justify-center gap-4 py-8 md:py-10">
        <div className="flex item-center justify-center">
          <h1 className={title()}>Order </h1>
          <Divider className="m-1" orientation="vertical" />
          <h2><a className="text-lg font-medium text-foreground-500 hover:text-foreground-800" href="/create/delivery">Delivery</a></h2>
        </div>
        <Input
          onChange={(e) => setFrom(e.target.value)}
          labelPlacement="outside"
          label="From (city)"
          isRequired
          type="text"
          className="w-5/6 sm:w-4/12"
          variant="faded"
        />
        <Input
          onChange={(e) => setTo(e.target.value)}
          labelPlacement="outside"
          label="To (city)"
          isRequired
          type="text"
          className="w-5/6 sm:w-4/12"
          variant="faded"
        />
        <Input
          onChange={(e) => setContents(e.target.value)}
          labelPlacement="outside"
          label="Parcel contents"
          type="text"
          className="w-5/6 sm:w-4/12"
          variant="faded"
        />
        <Input
          onChange={(e) => setDescription(e.target.value)}
          labelPlacement="outside"
          label="Parcel description"
          type="text"
          className="w-5/6 sm:w-4/12"
          variant="faded"
        />
        <DatePicker
          onChange={(val) => setDate(val.toString())}
          className="w-5/6 sm:w-4/12 mt-4"
          label={"Date of delivery"}
          variant="faded"
          minValue={today(getLocalTimeZone())}
        />
        <button
          className={buttonProps(!from || !to, "green")}
          disabled={!from || !to}
          onClick={sendCreate}>Send</button>
        <Badge className="transition-all" content={success ? "Success!" : undefined} color={success ? "success" : undefined} shape="circle" placement="bottom-right">
          <div></div>
        </Badge>
      </section>
    </DashboardLayout>
  );
}
