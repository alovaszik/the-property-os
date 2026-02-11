"use client";

import { FileText, Download, Search } from "@/components/icons";
import { useState } from "react";
import { useDocumentsTenant } from "@/lib/supabase/hooks";
import { PageSkeleton } from "@/components/dashboard/page-skeleton";
import { EmptyState } from "@/components/dashboard/empty-state";

export default function DocumentsPage() {
  const { data: raw, isLoading } = useDocumentsTenant();
  const [search, setSearch] = useState("");

  if (isLoading) return <PageSkeleton rows={6} />;

  const documents = (raw ?? []) as Array<Record<string, any>>;
  const filtered = documents.filter(
    (d) =>
      d.name?.toLowerCase().includes(search.toLowerCase()) ||
      d.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="px-4 py-6 lg:px-8 lg:py-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Documents</h1>
          <p className="text-sm text-muted-foreground mt-1">Your rental documents and files</p>
        </div>
      </div>

      <div className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl min-h-[44px] mb-6">
        <Search className="w-4 h-4 text-muted-foreground shrink-0" />
        <input type="text" placeholder="Search documents..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground" />
      </div>

      {documents.length === 0 ? (
        <EmptyState icon={FileText} title="No documents yet" description="Documents shared by your landlord will appear here." />
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((doc) => (
            <div key={doc.id} className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors min-h-[56px]">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{doc.category}</span>
                  <span className="text-xs text-muted-foreground">
                    {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : ""}{doc.file_size ? ` \u00b7 ${doc.file_size}` : ""}
                  </span>
                </div>
              </div>
              {doc.file_url && (
                <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl hover:bg-secondary flex items-center justify-center transition-colors" aria-label="Download">
                  <Download className="w-4 h-4 text-muted-foreground" />
                </a>
              )}
            </div>
          ))}
          {filtered.length === 0 && documents.length > 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-muted-foreground text-sm">No documents match your search.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
