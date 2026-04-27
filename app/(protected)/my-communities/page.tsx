"use client";

import { useEffect, useState } from "react";
import { listMyCommunities, type Community } from "@/features/communities/api/gateway-communities";
import { useAuthorizedRequest } from "@/features/auth/model/use-authorized-request";
import { useI18n } from "@/shared/i18n/i18n-context";

export default function MyCommunitiesPage() {
  const request = useAuthorizedRequest();
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [communities, setCommunities] = useState<Community[]>([]);

  useEffect(() => {
    const run = async () => {
      try {
        setCommunities(await listMyCommunities(request));
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, [request]);

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <h1 className="text-2xl font-semibold text-slate-900">{t("myCommunities.title")}</h1>
        <p className="mt-1 text-sm text-slate-600">{t("myCommunities.subtitle")}</p>
      </section>
      {loading ? (
        <p className="text-sm text-slate-500">{t("common.loading")}</p>
      ) : communities.length === 0 ? (
        <article className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
          {t("communities.empty")}
        </article>
      ) : (
        communities.map((community) => (
          <article key={community.id} className="rounded-2xl border border-slate-200 bg-white p-4">
            <h2 className="text-base font-semibold text-slate-900">{community.description}</h2>
            <p className="mt-1 text-sm text-slate-600">{community.visibility}</p>
          </article>
        ))
      )}
    </div>
  );
}
