import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

interface PrintRDOProps {
  params: Promise<{ number: string }>;
}

export default async function PrintRDOPage({ params }: PrintRDOProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const resolvedParams = await params;
  const rdoNumber = parseInt(resolvedParams.number);

  if (isNaN(rdoNumber)) redirect("/rdo");

  const rdo = await prisma.rDO.findFirst({
    where: {
      number: rdoNumber,
      project: { members: { some: { userId: session.user.id } } },
    },
    include: {
      project: true,
      workforce: true,
      equipmentUsage: { include: { equipment: true } },
      createdBy: true,
    },
  });

  if (!rdo) redirect("/rdo");

  const weatherMap: Record<string, string> = {
    SUNNY: "Ensolarado",
    PARTLY_CLOUDY: "Parc. Nublado",
    CLOUDY: "Nublado",
    RAINY: "Chuvoso",
    STORMY: "Tempestade",
  };

  const dataReferencia = new Date(rdo.date).toLocaleDateString("pt-BR", {
    weekday: "short",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });

  // Captura a data e hora exata em que o botão de imprimir foi clicado
  const dataImpressao = new Date().toLocaleString("pt-BR");

  return (
    <div className="bg-gray-100 min-h-screen flex items-start justify-center py-8 print:py-0 print:bg-white">
      {/* Container com proporção de Folha A4 */}
      <div className="w-full max-w-[210mm] min-h-[297mm] bg-white text-black p-8 shadow-2xl print:shadow-none print:p-0 relative text-[13px] font-sans">
        {/* CABEÇALHO DO DOCUMENTO */}
        <header className="border-b-2 border-black pb-3 mb-4 flex justify-between items-end">
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight">
              Relatório Diário de Obra
            </h1>
            <p className="text-base font-bold mt-1 text-gray-800">
              {rdo.project.name}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-black text-black">
              RDO Nº {rdo.number.toString().padStart(4, "0")}
            </p>
            <p className="font-semibold text-gray-700 capitalize mt-1">
              Data: {dataReferencia}
            </p>
          </div>
        </header>

        {/* INFORMAÇÕES GERAIS COMPACTAS COM GPS */}
        <section className="mb-6 grid grid-cols-12 gap-4 border border-black p-3 bg-gray-50/50">
          <div className="col-span-12 md:col-span-6">
            <p className="font-bold uppercase text-[10px] text-gray-500 mb-0.5">
              Endereço da Obra
            </p>
            <p className="font-bold leading-tight">
              {rdo.project.address || "Não cadastrado"}
            </p>
            {rdo.latitude && rdo.longitude && (
              <p className="text-[11px] font-mono text-gray-600 mt-1">
                GPS: {rdo.latitude.toFixed(6)}, {rdo.longitude.toFixed(6)}
              </p>
            )}
          </div>
          <div className="col-span-6 md:col-span-3 border-t border-gray-300 pt-2 md:border-t-0 md:pt-0 md:border-l md:pl-3">
            <p className="font-bold uppercase text-[10px] text-gray-500 mb-0.5">
              Clima / Tempo
            </p>
            <p className="font-bold">
              {rdo.weatherCondition
                ? weatherMap[rdo.weatherCondition] || rdo.weatherCondition
                : "N/I"}
            </p>
          </div>
          <div className="col-span-6 md:col-span-3 border-t border-gray-300 pt-2 md:border-t-0 md:pt-0 md:border-l md:pl-3">
            <p className="font-bold uppercase text-[10px] text-gray-500 mb-0.5">
              Temperatura
            </p>
            <p className="font-bold">
              {rdo.temperature !== null ? `${rdo.temperature}°C` : "N/I"}
            </p>
          </div>
        </section>

        {/* ATIVIDADES */}
        <section className="mb-6">
          <h2 className="text-[11px] font-black uppercase bg-black text-white px-2 py-1 inline-block">
            Atividades Executadas
          </h2>
          <div className="min-h-[80px] border border-black p-3 text-[13px] whitespace-pre-wrap leading-snug font-medium">
            {rdo.activities}
          </div>
        </section>

        {/* EFETIVO E EQUIPAMENTOS (Lado a Lado para poupar espaço) */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Mão de Obra */}
          <section>
            <h2 className="text-[11px] font-black uppercase bg-black text-white px-2 py-1 inline-block">
              Efetivo de Pessoal
            </h2>
            <table className="w-full border-collapse border border-black mt-[-1px]">
              <thead>
                <tr className="bg-gray-100 border-b border-black text-[11px]">
                  <th className="text-left p-1.5 border-r border-black uppercase">
                    Função
                  </th>
                  <th className="text-center p-1.5 uppercase w-12">Qtd</th>
                </tr>
              </thead>
              <tbody>
                {rdo.workforce.length === 0 ? (
                  <tr>
                    <td
                      colSpan={2}
                      className="p-2 text-center text-gray-500 italic text-xs"
                    >
                      Sem registros
                    </td>
                  </tr>
                ) : (
                  rdo.workforce.map((worker) => (
                    <tr
                      key={worker.id}
                      className="border-b border-gray-300 last:border-b-0 text-[12px]"
                    >
                      <td className="p-1.5 border-r border-black font-semibold">
                        {worker.category}
                      </td>
                      <td className="p-1.5 text-center font-bold">
                        {worker.quantity}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>

          {/* Equipamentos */}
          <section>
            <h2 className="text-[11px] font-black uppercase bg-black text-white px-2 py-1 inline-block">
              Máquinas e Ferramentas
            </h2>
            <table className="w-full border-collapse border border-black mt-[-1px]">
              <thead>
                <tr className="bg-gray-100 border-b border-black text-[11px]">
                  <th className="text-left p-1.5 border-r border-black uppercase">
                    Item
                  </th>
                  <th className="text-center p-1.5 uppercase w-16">Uso</th>
                </tr>
              </thead>
              <tbody>
                {rdo.equipmentUsage.length === 0 ? (
                  <tr>
                    <td
                      colSpan={2}
                      className="p-2 text-center text-gray-500 italic text-xs"
                    >
                      Sem registros
                    </td>
                  </tr>
                ) : (
                  rdo.equipmentUsage.map((usage) => (
                    <tr
                      key={usage.id}
                      className="border-b border-gray-300 last:border-b-0 text-[12px]"
                    >
                      <td className="p-1.5 border-r border-black font-semibold">
                        {usage.equipment.name}
                      </td>
                      <td className="p-1.5 text-center font-bold">
                        {usage.equipment.type === "MOTORIZED"
                          ? `${usage.hoursUsed}h`
                          : `${usage.quantity}x`}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>
        </div>

        {/* OBSERVAÇÕES E OCORRÊNCIAS */}
        {(rdo.observations || rdo.issues) && (
          <section className="mb-6 space-y-3">
            {rdo.observations && (
              <div>
                <h2 className="text-[10px] font-black uppercase text-gray-600 mb-0.5">
                  Observações Gerais
                </h2>
                <div className="border border-gray-400 p-2 text-xs whitespace-pre-wrap leading-tight">
                  {rdo.observations}
                </div>
              </div>
            )}
            {rdo.issues && (
              <div>
                <h2 className="text-[10px] font-black uppercase text-red-600 mb-0.5">
                  Ocorrências / Atrasos
                </h2>
                <div className="border border-red-600 p-2 text-xs text-red-700 whitespace-pre-wrap leading-tight">
                  {rdo.issues}
                </div>
              </div>
            )}
          </section>
        )}

        {/* ASSINATURA (Rodapé Limpo) */}
        <footer className="mt-auto pt-8 flex flex-col items-center justify-center break-inside-avoid">
          {rdo.authorSignature ? (
            <img
              src={rdo.authorSignature}
              alt="Assinatura"
              className="max-w-[200px] max-h-[80px] object-contain mb-1"
              style={{ filter: "brightness(0)" }}
            />
          ) : (
            <div className="h-16 w-48 mb-2"></div>
          )}
          <div className="w-64 border-t border-black pt-1 text-center">
            <p className="font-bold text-[13px]">
              {rdo.createdBy?.name || "Engenheiro Responsável"}
            </p>
            <p className="text-[10px] font-bold text-gray-500 uppercase mt-0.5">
              Responsável Técnico / Emissor
            </p>
          </div>
        </footer>

        {/* DATA DE IMPRESSÃO (Cantinho) */}
        <div className="absolute bottom-6 left-8 right-8 flex justify-between text-[9px] text-gray-400 border-t border-gray-200 pt-1 print:bottom-0">
          <span>Sistema RDO v1.0</span>
          <span>Gerado em: {dataImpressao}</span>
        </div>
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `window.onload = function() { window.print(); }`,
        }}
      />
    </div>
  );
}
