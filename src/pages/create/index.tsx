import { Link } from "@nextui-org/link";
import { Divider } from "@nextui-org/divider";

import { title } from "@/components/primitives";
import DashboardLayout from "@/layouts/dashboard";
import { PhArrowFatLinesUp, PhArrowFatLinesDown } from "@/components/icons";
import styles from "./Create.module.css"

export default function CreatePage() {
  return (
    <DashboardLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-4">
        <h1 className={title()}>Create</h1>
        <div className="flex flex-col w-full md:grid md:grid-cols-2 md:gap-x-2.5 md:mt-3">
          <Link href="/create/order" className="text-default-foreground">
            <div className={styles["creation-card"] + " md:m-0"} data-type="order">
              <p className="text-md">Order</p>
              <PhArrowFatLinesUp />
            </div>
          </Link>
          <Link href="/create/delivery" className="text-default-foreground">
            <div className={styles["creation-card"]} data-type="delivery">
              <p className="text-md">Delivery</p>
              <PhArrowFatLinesDown />
            </div>
          </Link>
        </div>
      </section>
    </DashboardLayout>
  );
}
