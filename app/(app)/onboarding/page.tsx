import { getCurrentUser } from "@/lib/getCurrentUser";
import ProfileForm from "@/components/ProfileForm";

export const dynamic = "force-dynamic";

function ageFrom(birthDate: Date): number | undefined {
  const y = birthDate.getUTCFullYear();
  if (y <= 1900) return undefined;
  return new Date().getFullYear() - y;
}

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const p = user.profile;

  return (
    <>
      <h1>Complete seu perfil</h1>
      <p className="muted">
        Usamos esses dados para calcular suas metas de calorias, proteína e água,
        e para montar sua dieta e treino.
      </p>
      <ProfileForm
        initial={{
          age: p ? ageFrom(p.birthDate) : undefined,
          heightCm: p?.heightCm,
          activityLevel: p?.activityLevel,
          goal: p?.goal,
          startWeightKg: p?.startWeightKg,
          targetWeightKg: p?.targetWeightKg,
        }}
      />
    </>
  );
}
