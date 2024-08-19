import { Divider } from "@nextui-org/divider";
import { Navbar } from "@/components/navbar";



export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col h-screen">
      <Navbar />
      <Divider className="m-0" />
      <main className="container mx-auto max-w-7xl px-6 flex-grow pt-0.5">
        {children}
      </main>
    </div>
  );
}
