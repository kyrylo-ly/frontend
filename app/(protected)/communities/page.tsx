"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useI18n } from "@/shared/i18n/i18n-context";
import { formatDeadline } from "@/shared/date/format-deadline";
import { useAuthorizedRequest } from "@/features/auth/model/use-authorized-request";
import {
  createCommunity,
  createCrowdfundingInitiative,
  contributeToInitiative,
  listCommunityInitiatives,
  listMyCommunities,
  type Community,
  type Initiative,
} from "@/features/communities/api/gateway-communities";

type InitiativeFormMode = "optional" | "min" | "exact" | "minmax";

function hryvniaToKopiyky(value: string): number {
  const normalized = value.replace(",", ".").trim();
  if (!normalized) return 0;
  const amount = Number(normalized);
  if (Number.isNaN(amount) || amount < 0) return 0;
  return Math.round(amount * 100);
}

function kopiykyToHryvnia(value?: number): string {
  if (!value) return "0.00";
  return (value / 100).toFixed(2);
}

export default function CommunitiesPage() {
  const { t, locale } = useI18n();
  const request = useAuthorizedRequest();
  const [loading, setLoading] = useState(true);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [initiativesByCommunity, setInitiativesByCommunity] = useState<
    Record<string, Initiative[]>
  >({});
  const [error, setError] = useState<string | null>(null);
  const [communityDescription, setCommunityDescription] = useState("");
  const [visibility, setVisibility] = useState<
    "COMMUNITY_VISIBILITY_PUBLIC" | "COMMUNITY_VISIBILITY_PRIVATE"
  >("COMMUNITY_VISIBILITY_PUBLIC");

  const [selectedCommunityId, setSelectedCommunityId] = useState("");
  const [initiativeTitle, setInitiativeTitle] = useState("");
  const [initiativeDescription, setInitiativeDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [minContribution, setMinContribution] = useState("");
  const [maxContribution, setMaxContribution] = useState("");
  const [exactContribution, setExactContribution] = useState("");
  const [ruleMode, setRuleMode] = useState<InitiativeFormMode>("optional");
  const [contributeAmount, setContributeAmount] = useState<
    Record<string, string>
  >({});

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedCommunities = await listMyCommunities(request);
      setCommunities(fetchedCommunities);
      const pairs = await Promise.all(
        fetchedCommunities.map(async (community) => ({
          communityId: community.id,
          initiatives: await listCommunityInitiatives(request, community.id),
        })),
      );
      const map = pairs.reduce<Record<string, Initiative[]>>((acc, pair) => {
        acc[pair.communityId] = pair.initiatives;
        return acc;
      }, {});
      setInitiativesByCommunity(map);
      if (!selectedCommunityId && fetchedCommunities[0]?.id) {
        setSelectedCommunityId(fetchedCommunities[0].id);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load communities",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allInitiatives = useMemo(
    () =>
      Object.entries(initiativesByCommunity).flatMap(
        ([communityId, initiatives]) =>
          initiatives.map((initiative) => ({
            ...initiative,
            communityId,
          })),
      ),
    [initiativesByCommunity],
  );

  const onCreateCommunity = async (event: FormEvent) => {
    event.preventDefault();
    if (!communityDescription.trim()) return;
    await createCommunity(request, {
      description: communityDescription,
      visibility,
    });
    setCommunityDescription("");
    await loadData();
  };

  const onCreateInitiative = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedCommunityId || !initiativeTitle.trim() || !targetAmount.trim())
      return;

    const payload: {
      title: string;
      description?: string;
      deadline: string;
      targetAmount: number;
      minContribution?: number;
      maxContribution?: number;
      exactContribution?: number;
    } = {
      title: initiativeTitle,
      description: initiativeDescription || undefined,
      deadline,
      targetAmount: hryvniaToKopiyky(targetAmount),
    };

    if (ruleMode === "min" || ruleMode === "minmax") {
      payload.minContribution = hryvniaToKopiyky(minContribution);
    }
    if (ruleMode === "exact") {
      payload.exactContribution = hryvniaToKopiyky(exactContribution);
    }
    if (ruleMode === "minmax") {
      payload.maxContribution = hryvniaToKopiyky(maxContribution);
    }

    await createCrowdfundingInitiative(request, selectedCommunityId, payload);
    setInitiativeTitle("");
    setInitiativeDescription("");
    setTargetAmount("");
    setMinContribution("");
    setMaxContribution("");
    setExactContribution("");
    await loadData();
  };

  const onContribute = async (initiativeId: string) => {
    const raw = contributeAmount[initiativeId];
    if (!raw) return;
    await contributeToInitiative(request, initiativeId, hryvniaToKopiyky(raw));
    setContributeAmount((prev) => ({ ...prev, [initiativeId]: "" }));
  };

  if (loading) {
    return <p className="text-sm text-slate-500">{t("common.loading")}</p>;
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <h1 className="text-2xl font-semibold text-slate-900">
          {t("communities.title")}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          {t("communities.subtitle")}
        </p>
      </section>

      {error ? (
        <section className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2">
        <form
          onSubmit={onCreateCommunity}
          className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4"
        >
          <h2 className="text-base font-semibold text-slate-900">
            {t("communities.create")}
          </h2>
          <input
            value={communityDescription}
            onChange={(event) => setCommunityDescription(event.target.value)}
            placeholder="Community name / description"
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
          />
          <select
            value={visibility}
            onChange={(event) =>
              setVisibility(
                event.target.value as
                  | "COMMUNITY_VISIBILITY_PUBLIC"
                  | "COMMUNITY_VISIBILITY_PRIVATE",
              )
            }
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
          >
            <option value="COMMUNITY_VISIBILITY_PUBLIC">Public</option>
            <option value="COMMUNITY_VISIBILITY_PRIVATE">Private</option>
          </select>
          <button className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white">
            {t("communities.create")}
          </button>
        </form>

        <form
          onSubmit={onCreateInitiative}
          className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4"
        >
          <h2 className="text-base font-semibold text-slate-900">
            {t("initiatives.create")}
          </h2>
          <select
            value={selectedCommunityId}
            onChange={(event) => setSelectedCommunityId(event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
          >
            <option value="">Select community</option>
            {communities.map((community) => (
              <option key={community.id} value={community.id}>
                {community.description}
              </option>
            ))}
          </select>
          <input
            value={initiativeTitle}
            onChange={(event) => setInitiativeTitle(event.target.value)}
            placeholder="Initiative title"
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
          />
          <input
            value={initiativeDescription}
            onChange={(event) => setInitiativeDescription(event.target.value)}
            placeholder="Description"
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
          />
          <input
            type="date"
            value={deadline}
            onChange={(event) => setDeadline(event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
          />
          <input
            value={targetAmount}
            onChange={(event) => setTargetAmount(event.target.value)}
            placeholder="Target amount in UAH (e.g. 500000.00)"
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
          />
          <select
            value={ruleMode}
            onChange={(event) =>
              setRuleMode(event.target.value as InitiativeFormMode)
            }
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
          >
            <option value="optional">Contribution not specified</option>
            <option value="min">Minimum only</option>
            <option value="exact">Exact amount</option>
            <option value="minmax">Minimum + maximum</option>
          </select>
          {(ruleMode === "min" || ruleMode === "minmax") && (
            <input
              value={minContribution}
              onChange={(event) => setMinContribution(event.target.value)}
              placeholder="Min contribution in UAH"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            />
          )}
          {ruleMode === "exact" && (
            <input
              value={exactContribution}
              onChange={(event) => setExactContribution(event.target.value)}
              placeholder="Exact contribution in UAH"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            />
          )}
          {ruleMode === "minmax" && (
            <input
              value={maxContribution}
              onChange={(event) => setMaxContribution(event.target.value)}
              placeholder="Max contribution in UAH"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            />
          )}
          <button className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white">
            {t("initiatives.create")}
          </button>
        </form>
      </section>

      <section className="space-y-3">
        {allInitiatives.length === 0 ? (
          <article className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
            {t("communities.empty")}
          </article>
        ) : (
          allInitiatives.map((initiative) => (
            <article
              key={initiative.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-slate-500">
                    Community #{initiative.communityId}
                  </p>
                  <h3 className="text-base font-semibold text-slate-900">
                    {initiative.title}
                  </h3>
                  {initiative.description ? (
                    <p className="mt-1 text-sm text-slate-600">
                      {initiative.description}
                    </p>
                  ) : null}
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                  {formatDeadline(initiative.deadline, locale)}
                </span>
              </div>
              <div className="mt-3 grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
                <p>Target: {kopiykyToHryvnia(initiative.targetAmount)} UAH</p>
                <p>
                  Min:{" "}
                  {initiative.minContribution !== undefined
                    ? `${kopiykyToHryvnia(initiative.minContribution)} UAH`
                    : "-"}
                </p>
                <p>
                  Max:{" "}
                  {initiative.maxContribution !== undefined
                    ? `${kopiykyToHryvnia(initiative.maxContribution)} UAH`
                    : "-"}
                </p>
                <p>
                  Exact:{" "}
                  {initiative.exactContribution !== undefined
                    ? `${kopiykyToHryvnia(initiative.exactContribution)} UAH`
                    : "-"}
                </p>
              </div>
              <div className="mt-3 flex gap-2">
                <input
                  value={contributeAmount[initiative.id] ?? ""}
                  onChange={(event) =>
                    setContributeAmount((prev) => ({
                      ...prev,
                      [initiative.id]: event.target.value,
                    }))
                  }
                  placeholder="Amount in UAH (e.g. 100.50)"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() => void onContribute(initiative.id)}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white"
                >
                  Contribute
                </button>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
