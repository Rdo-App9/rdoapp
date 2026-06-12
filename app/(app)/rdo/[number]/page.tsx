import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Link from "next/link";
import {
  ChevronLeft,
  Cloud,
  Sun,
  User,
  Spanner,
  InfoCircle,
  Printer,
  GlobeAmericas,
} from "@boxicons/react";
import { NetworkStatusIndicator } from "@/components/ui/network-status";

interface RDODetailsProps {
  params: Promise<{ number: string }>;
}

export default async function RDODetailsPage({ params }: RDODetailsProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const resolvedParams = await params;
  const rdoNumber = parseInt(resolvedParams.number);

  if (isNaN(rdoNumber)) {
    redirect("/rdo");
  }

  // Busca o RDO e INCLUI o usuário que o criou (createdBy)
  const rdo = await prisma.rDO.findFirst({
    where: {
      number: rdoNumber,
      project: {
        members: {
          some: { userId: session.user.id },
        },
      },
    },
    include: {
      project: true,
      workforce: true,
      equipmentUsage: {
        include: { equipment: true },
      },
      createdBy: true, // Puxando os dados do Engenheiro/Usuário
    },
  });

  if (!rdo) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center h-full bg-background">
        <InfoCircle
          pack="basic"
          width={48}
          height={48}
          className="text-muted-foreground mb-4 opacity-50"
        />
        <h1 className="text-xl font-bold text-foreground">
          RDO não encontrado
        </h1>
        <p className="text-muted-foreground mt-2">
          Este relatório não existe ou você não tem permissão para vê-lo.
        </p>
        <Link
          href="/rdo"
          className="mt-6 px-6 h-12 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center"
        >
          Voltar para Lista
        </Link>
      </div>
    );
  }

  // Traduções simples para o clima
  const weatherMap: Record<string, string> = {
    SUNNY: "Ensolarado",
    PARTLY_CLOUDY: "Parcialmente Nublado",
    CLOUDY: "Nublado",
    RAINY: "Chuvoso",
    STORMY: "Tempestade",
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background relative print:bg-white print:text-black">
      {/* HEADER - Oculto na impressão */}
      <header className="pt-safe sticky top-0 bg-background/80 backdrop-blur-md border-b border-border z-10 print:hidden">
        <div className="px-6 py-4 flex items-center justify-between">
          <Link
            href={`/rdo?projectId=${rdo.projectId}`}
            className="w-10 h-10 rounded-xl border border-input bg-transparent flex items-center justify-center active:bg-secondary/50 transition-colors"
          >
            <ChevronLeft pack="basic" width={24} height={24} />
          </Link>
          <div className="text-center">
            <h1 className="text-base font-bold text-foreground">
              Relatório #{rdo.number}
            </h1>
            <p className="text-xs text-muted-foreground">{rdo.project.name}</p>
          </div>

          <div className="flex items-center gap-2">
            {/* BOTÃO CORRIGIDO: Agora ele abre a nova página A4 em outra aba */}
            <Link
              href={`/rdo/${rdo.number}/print`}
              target="_blank"
              title="Gerar Documento PDF"
              className="w-10 h-10 rounded-xl border border-input bg-transparent flex items-center justify-center active:bg-secondary/50 transition-colors text-foreground hover:bg-secondary/20"
            >
              <Printer pack="basic" width={20} height={20} />
            </Link>
          </div>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 px-6 py-6 overflow-y-auto space-y-6 pb-24 print:pb-0 print:p-8">
        {/* Título visível apenas na impressão */}
        <div className="hidden print:block text-center mb-8 border-b-2 border-black pb-4">
          <h1 className="text-2xl font-bold uppercase">
            Relatório Diário de Obra (RDO)
          </h1>
          <p className="text-lg mt-1">{rdo.project.name}</p>
        </div>

        {/* Cabeçalho do Documento */}
        <div className="p-5 rounded-2xl border border-border bg-card shadow-sm print:shadow-none print:border-black print:rounded-none">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider print:text-black">
                Data do Relatório
              </p>
              <p className="text-lg font-semibold text-foreground mt-1 print:text-black">
                {new Date(rdo.date).toLocaleDateString("pt-BR", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-bold uppercase tracking-wider print:border-black print:text-black print:bg-transparent">
              {rdo.status}
            </span>
          </div>

          <div className="flex gap-6 pt-4 border-t border-border print:border-black">
            <div className="flex items-center gap-2">
              <Sun
                pack="basic"
                width={20}
                height={20}
                className="text-warning print:text-black"
              />
              <span className="text-sm font-medium text-foreground print:text-black">
                {rdo.weatherCondition
                  ? weatherMap[rdo.weatherCondition] || rdo.weatherCondition
                  : "Não informado"}
              </span>
            </div>
            {rdo.temperature !== null && (
              <div className="flex items-center gap-2">
                <Cloud
                  pack="basic"
                  width={20}
                  height={20}
                  className="text-info print:text-black"
                />
                <span className="text-sm font-medium text-foreground print:text-black">
                  {rdo.temperature}°C
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Atividades Executadas */}
        <section className="print:break-inside-avoid">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 print:text-black">
            Atividades do Dia
          </h2>
          <div className="p-5 rounded-2xl border border-border bg-card shadow-sm print:shadow-none print:border-black print:rounded-none">
            <p className="text-base text-foreground leading-relaxed whitespace-pre-wrap print:text-black">
              {rdo.activities}
            </p>
          </div>
        </section>

        {/* Mão de Obra */}
        <section className="print:break-inside-avoid">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2 print:text-black">
            <User pack="basic" width={18} height={18} /> Efetivo de Pessoal
          </h2>
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm print:shadow-none print:border-black print:rounded-none">
            {rdo.workforce.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground text-center print:text-black">
                Nenhum efetivo registrado.
              </p>
            ) : (
              <div className="divide-y divide-border print:divide-black">
                {rdo.workforce.map((worker) => (
                  <div
                    key={worker.id}
                    className="p-4 flex justify-between items-center"
                  >
                    <span className="font-medium text-foreground print:text-black">
                      {worker.category}
                    </span>
                    <span className="font-bold text-primary bg-primary/10 px-3 py-1 rounded-lg print:bg-transparent print:text-black print:border print:border-black">
                      {worker.quantity}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Equipamentos */}
        <section className="print:break-inside-avoid">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2 print:text-black">
            <Spanner pack="basic" width={18} height={18} /> Máquinas e
            Ferramentas
          </h2>
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm print:shadow-none print:border-black print:rounded-none">
            {rdo.equipmentUsage.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground text-center print:text-black">
                Nenhum equipamento registrado.
              </p>
            ) : (
              <div className="divide-y divide-border print:divide-black">
                {rdo.equipmentUsage.map((usage) => (
                  <div key={usage.id} className="p-4">
                    <p className="font-bold text-foreground mb-1 print:text-black">
                      {usage.equipment.name}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground print:text-black">
                        {usage.equipment.type === "MOTORIZED"
                          ? "Horas Operadas"
                          : "Quantidade no Canteiro"}
                      </span>
                      <span className="font-semibold text-foreground print:text-black">
                        {usage.equipment.type === "MOTORIZED"
                          ? `${usage.hoursUsed}h`
                          : `${usage.quantity} un`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Observações e Ocorrências */}
        {(rdo.observations || rdo.issues) && (
          <section className="grid gap-6 print:break-inside-avoid">
            {rdo.observations && (
              <div>
                <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 print:text-black">
                  Observações
                </h2>
                <div className="p-5 rounded-2xl bg-secondary/30 border border-transparent print:bg-transparent print:border-black print:rounded-none">
                  <p className="text-sm text-foreground whitespace-pre-wrap print:text-black">
                    {rdo.observations}
                  </p>
                </div>
              </div>
            )}
            {rdo.issues && (
              <div>
                <h2 className="text-sm font-bold text-destructive uppercase tracking-wider mb-3 print:text-black">
                  Ocorrências / Atrasos
                </h2>
                <div className="p-5 rounded-2xl bg-destructive/5 border border-destructive/20 print:bg-transparent print:border-black print:rounded-none">
                  <p className="text-sm text-destructive whitespace-pre-wrap print:text-black">
                    {rdo.issues}
                  </p>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ASSINATURA E IDENTIFICAÇÃO (RODAPÉ) */}
        <section className="mt-12 pt-10 border-t-2 border-border print:border-black flex flex-col items-center justify-center print:break-inside-avoid">
          {rdo.authorSignature ? (
            <img
              src={rdo.authorSignature}
              alt="Assinatura Digital"
              className="max-w-62.5 max-h-30 object-contain mb-2 print:grayscale"
            />
          ) : (
            <div className="h-24 w-64 border-b-2 border-dashed border-border print:border-black mb-4 flex items-end justify-center">
              <span className="text-xs text-muted-foreground print:text-black mb-1">
                Assinar Acima
              </span>
            </div>
          )}
          <p className="font-bold text-foreground text-lg print:text-black">
            {rdo.createdBy?.name || "Engenheiro(a) Responsável"}
          </p>
          <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider print:text-black">
            Responsável Técnico
          </p>
          <div className="mt-4 flex items-center gap-1 text-sm text-muted-foreground print:text-black">
            <GlobeAmericas pack="basic" width={16} height={16} />
            <p>
              {rdo.project?.address || "Localização da obra não cadastrada"}
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
