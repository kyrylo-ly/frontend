import { type AuthorizedRequest } from "@/shared/api/http";

export type Community = {
  id: string;
  description: string;
  visibility: string;
  avatar?: string;
  cover?: string;
};

export type Initiative = {
  id: string;
  communityId: string;
  title: string;
  description?: string;
  deadline?: string;
  targetAmount?: number;
  minContribution?: number;
  maxContribution?: number;
  exactContribution?: number;
};

export async function listMyCommunities(request: AuthorizedRequest) {
  const data = await request<{ communities?: Community[] }>("/communities/my", {
    method: "GET",
  });
  return data.communities ?? [];
}

export async function createCommunity(
  request: AuthorizedRequest,
  payload: {
    description: string;
    visibility: "COMMUNITY_VISIBILITY_PUBLIC" | "COMMUNITY_VISIBILITY_PRIVATE";
  },
) {
  return request("/communities", {
    method: "POST",
    body: payload,
  });
}

export async function listCommunityInitiatives(
  request: AuthorizedRequest,
  communityId: string,
) {
  const data = await request<{ initiatives?: Initiative[] }>(
    `/communities/${communityId}/initiatives`,
    {
      method: "GET",
    },
  );
  return data.initiatives ?? [];
}

export async function createCrowdfundingInitiative(
  request: AuthorizedRequest,
  communityId: string,
  payload: {
    title: string;
    description?: string;
    deadline: string;
    targetAmount: number;
    minContribution?: number;
    maxContribution?: number;
    exactContribution?: number;
  },
) {
  return request(`/communities/${communityId}/initiatives`, {
    method: "POST",
    body: {
      ...payload,
      type: "INITIATIVE_TYPE_CROWDFUNDING",
    },
  });
}

export async function contributeToInitiative(
  request: AuthorizedRequest,
  initiativeId: string,
  amount: number,
) {
  return request(`/escrow/${initiativeId}/contribute`, {
    method: "POST",
    body: { amount },
  });
}
