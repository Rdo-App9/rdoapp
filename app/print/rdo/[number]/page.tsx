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
    PARTLY_CLOUDY: "Parcialmente Nublado",
    CLOUDY: "Nublado",
    RAINY: "Chuvoso",
    STORMY: "Tempestade",
  };

  const dataReferencia = new Date(rdo.date).toLocaleDateString("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Captura a data e hora exata em que o botão de imprimir foi clicado
  const dataImpressao = new Date().toLocaleString("pt-BR");

  return (
    <div className="bg-gray-100 min-h-screen flex items-start justify-center py-8 print:py-0 print:bg-white">
      {/* Container com proporção de Folha A4 */}
      <div className="w-full max-w-[210mm] min-h-[297mm] bg-white text-black p-10 md:p-12 shadow-2xl print:shadow-none print:p-0 relative">
        {/* CABEÇALHO DO DOCUMENTO */}
        <header className="border-b-2 border-black pb-4 mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-tight">
              Relatório Diário de Obra
            </h1>
            <p className="text-lg font-medium mt-1">{rdo.project.name}</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-gray-800">
              RDO N° {rdo.number.toString().padStart(4, "0")}
            </p>
            <p className="text-sm font-medium text-gray-600 capitalize mt-1">
              {dataReferencia}
            </p>
          </div>
        </header>

        {/* INFORMAÇÕES GERAIS */}
        <section className="mb-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-bold uppercase text-gray-600 text-xs">
              Endereço da Obra
            </p>
            <p className="font-medium">
              {rdo.project.address || "Não cadastrado"}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-bold uppercase text-gray-600 text-xs">Clima</p>
              <p className="font-medium">
                {rdo.weatherCondition
                  ? weatherMap[rdo.weatherCondition] || rdo.weatherCondition
                  : "N/I"}
              </p>
            </div>
            <div>
              <p className="font-bold uppercase text-gray-600 text-xs">
                Temperatura
              </p>
              <p className="font-medium">
                {rdo.temperature !== null ? `${rdo.temperature}°C` : "N/I"}
              </p>
            </div>
          </div>
        </section>

        {/* ATIVIDADES */}
        <section className="mb-8">
          <h2 className="text-xs font-bold uppercase bg-gray-200 text-black px-2 py-1 mb-2 border border-black">
            Atividades Executadas
          </h2>
          <div className="min-h-25 border border-black p-3 text-sm whitespace-pre-wrap leading-relaxed">
            {rdo.activities}
          </div>
        </section>

        {/* EFETIVO E EQUIPAMENTOS (Lado a Lado) */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Mão de Obra */}
          <section>
            <h2 className="text-xs font-bold uppercase bg-gray-200 text-black px-2 py-1 mb-2 border border-black">
              Efetivo de Pessoal
            </h2>
            <table className="w-full text-sm border-collapse border border-black">
              <thead>
                <tr className="border-b border-black">
                  <th className="text-left p-2 border-r border-black font-semibold">
                    Função
                  </th>
                  <th className="text-center p-2 font-semibold w-16">Qtd</th>
                </tr>
              </thead>
              <tbody>
                {rdo.workforce.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="p-2 text-center text-gray-500">
                      Nenhum registro
                    </td>
                  </tr>
                ) : (
                  rdo.workforce.map((worker) => (
                    <tr
                      key={worker.id}
                      className="border-b border-gray-300 last:border-b-0"
                    >
                      <td className="p-2 border-r border-black">
                        {worker.category}
                      </td>
                      <td className="p-2 text-center font-bold">
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
            <h2 className="text-xs font-bold uppercase bg-gray-200 text-black px-2 py-1 mb-2 border border-black">
              Equipamentos e Ferramentas
            </h2>
            <table className="w-full text-sm border-collapse border border-black">
              <thead>
                <tr className="border-b border-black">
                  <th className="text-left p-2 border-r border-black font-semibold">
                    Item
                  </th>
                  <th className="text-center p-2 font-semibold w-24">Uso</th>
                </tr>
              </thead>
              <tbody>
                {rdo.equipmentUsage.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="p-2 text-center text-gray-500">
                      Nenhum registro
                    </td>
                  </tr>
                ) : (
                  rdo.equipmentUsage.map((usage) => (
                    <tr
                      key={usage.id}
                      className="border-b border-gray-300 last:border-b-0"
                    >
                      <td className="p-2 border-r border-black">
                        {usage.equipment.name}
                      </td>
                      <td className="p-2 text-center">
                        {usage.equipment.type === "MOTORIZED"
                          ? `${usage.hoursUsed} h`
                          : `${usage.quantity} un`}
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
          <section className="mb-8 space-y-4">
            {rdo.observations && (
              <div>
                <h2 className="text-xs font-bold uppercase bg-gray-200 text-black px-2 py-1 mb-2 border border-black">
                  Observações Gerais
                </h2>
                <div className="border border-black p-3 text-sm whitespace-pre-wrap">
                  {rdo.observations}
                </div>
              </div>
            )}
            {rdo.issues && (
              <div>
                <h2 className="text-xs font-bold uppercase bg-red-100 text-red-900 px-2 py-1 mb-2 border border-red-900">
                  Ocorrências e Atrasos
                </h2>
                <div className="border border-red-900 p-3 text-sm text-red-900 whitespace-pre-wrap">
                  {rdo.issues}
                </div>
              </div>
            )}
          </section>
        )}

        {/* RODAPÉ E ASSINATURA */}
        <footer className="mt-16 pt-8 flex flex-col items-center justify-center break-inside-avoid">
          {rdo.authorSignature ? (
            <img
              src={rdo.authorSignature}
              alt="Assinatura"
              className="max-w-62.5 max-h-25 object-contain mb-2"
              // O brightness(0) obriga qualquer traço visível (branco, vermelho, azul) a ficar preto!
              style={{ filter: "brightness(0)" }}
            />
          ) : (
            <div className="h-16 w-64 mb-4"></div>
          )}
          <div className="w-72 border-t border-black pt-2 text-center">
            <p className="font-bold text-base">
              {rdo.createdBy?.name || "Engenheiro Responsável"}
            </p>
            <p className="text-xs text-gray-600 uppercase mt-1">
              Responsável Técnico / Emissor
            </p>
          </div>
        </footer>

        {/* DATA DE IMPRESSÃO - Fica no rodapé da folha */}
        <div className="absolute bottom-6 left-0 right-0 text-center text-xs text-gray-400">
          Documento gerado eletronicamente em: {dataImpressao}
        </div>
      </div>

      {/* Aciona a janela de impressão automaticamente ao carregar */}
      <script
        dangerouslySetInnerHTML={{
          __html: `window.onload = function() { window.print(); }`,
        }}
      />
    </div>
  );
}
