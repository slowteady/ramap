"use client";

import { useEffect, useState } from "react";
import { hasNewResult } from "./new-results";
import { fetchResultTimes, type ResultTimes } from "./result-times-api";
import { useAuth } from "./use-auth";
import { useProfile } from "./use-profile";

export function useNewResults() {
  const { user } = useAuth();
  const { profileLoaded, reportsSeenAt, photosSeenAt, markSeen } = useProfile();
  const [times, setTimes] = useState<ResultTimes | null>(null);

  useEffect(() => {
    if (!user) {
      setTimes(null);
      return;
    }
    let cancelled = false;
    void fetchResultTimes(user.id).then((result) => {
      if (!cancelled) setTimes(result);
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const ready = profileLoaded && times !== null;
  const reportsNew = ready && hasNewResult(times.reports, reportsSeenAt);
  const photosNew = ready && hasNewResult(times.photos, photosSeenAt);
  return { reportsNew, photosNew, anyNew: reportsNew || photosNew, markSeen };
}
