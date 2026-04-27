"use client";

import { useEffect, useState } from "react";
import { useAuthorizedRequest } from "@/features/auth/model/use-authorized-request";
import {
  listCommunityInitiatives,
  listMyCommunities,
  type Initiative,
} from "@/features/communities/api/gateway-communities";
import { formatDeadline } from "@/shared/date/format-deadline";
import { useI18n } from "@/shared/i18n/i18n-context";

type InitiativeWithCommunity = Initiative & { communityName: string };

export default function MyInitiativesPage() {
  const request = useAuthorizedRequest();
  const { t, locale } = useI18n();
  const [loading, setLoading] = useState(true);
  const [initiatives, setInitiatives] = useState<InitiativeWithCommunity[]>([]);

  useEffect(() => {
    const run = async () => {
      try {
        const communities = await listMyCommunities(request);
        const items = await Promise.all(
          communities.map(async (community) => {
            const list = await listCommunityInitiatives(request, community.id);
            return list.map((initiative) => ({
              ...initiative,
              communityName: community.description,
            }));
          }),
        );
        setInitiatives(items.flat());
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, [request]);

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <h1 className="text-2xl font-semibold text-slate-900">{t("initiatives.title")}</h1>
        <p className="mt-1 text-sm text-slate-600">{t("initiatives.subtitle")}</p>
      </section>
      {loading ? (
        <p className="text-sm text-slate-500">{t("common.loading")}</p>
      ) : initiatives.length === 0 ? (
        <article className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
          {t("initiatives.empty")}
        </article>
      ) : (
        initiatives.map((initiative) => (
          <article key={initiative.id} className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-500">{initiative.communityName}</p>
            <h2 className="text-base font-semibold text-slate-900">{initiative.title}</h2>
            {initiative.description ? (
              <p className="mt-1 text-sm text-slate-600">{initiative.description}</p>
            ) : null}
            <p className="mt-2 text-xs text-slate-500">
              {formatDeadline(initiative.deadline, locale)}
            </p>
          </article>
        ))
      )}
    </div>
  );
}
