import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/getCurrentUser";
import NavBar from "@/components/NavBar";
import PwaRegister from "@/components/PwaRegister";
import ReminderBanner from "@/components/ReminderBanner";

// Layout do grupo autenticado: bloqueia acesso sem sessão.
export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/signin");

  return (
    <>
      <PwaRegister />
      <NavBar />
      <div className="container">
        <ReminderBanner />
        {children}
      </div>
      <div className="container disclaimer">
        ⚠️ As estimativas de calorias, macros e dose são educacionais e não
        substituem acompanhamento médico/nutricional. A titulação de GLP-1 é
        decisão do seu médico.
      </div>
    </>
  );
}
