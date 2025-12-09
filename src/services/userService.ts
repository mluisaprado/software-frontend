// src/services/userService.ts
import apiClient from "./apiClient";

export interface UserRating {
  id: number;
  score: number;
  comment?: string;
  author?: { id: number; name: string };
  trip?: {
    origin: string;
    destination: string;
    departure_time: string;
  };
}

export interface UserRatingsSummary {
  average: number;
  total: number;
  ratings: UserRating[];
}

async function getUserRatings(userId: number): Promise<UserRatingsSummary> {
  const response = await apiClient.get(`/users/${userId}/ratings`);
  return response.data.data as UserRatingsSummary;
}

const userService = {
  getUserRatings,
};

export default userService;
