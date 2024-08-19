import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import { Image } from "@nextui-org/image";

export default function IndexPage() {
  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-lg text-center justify-center">
          <h1 className={title()}>E-Commerce&nbsp;</h1>
          <br />
          <h1 className={title({ color: "violet" })}>With Jazz&nbsp;</h1>
        </div>
        <div className="hidden sm:block home-image light:before:blur-3xl before:opacity-45 dark:opacity-100">
          <Image
            src="/musical-notes.png"
            alt="jazz notes"
            width="full"
          />
        </div>
      </section>
    </DefaultLayout>
  );
}
