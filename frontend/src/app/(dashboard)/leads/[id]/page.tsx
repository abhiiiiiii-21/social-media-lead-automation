interface LeadDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function LeadDetailsPage({ params }: LeadDetailsPageProps) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-neutral-500 uppercase">Lead ID</span>
          <span className="text-xs font-mono text-neutral-300 px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800">
            {id}
          </span>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-neutral-100 mt-1">
          Lead Detail View
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          Detailed profile insights, message interaction logs, and lead status.
        </p>
      </div>

      <div className="p-6 rounded-xl border border-dashed border-neutral-800 bg-neutral-900/20 text-center">
        <span className="text-xs font-mono text-neutral-500">
          Placeholder Dynamic Page: /leads/{id}
        </span>
      </div>
    </div>
  );
}
