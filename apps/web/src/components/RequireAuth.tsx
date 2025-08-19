import { PropsWithChildren, useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { Navigate, useLocation } from "react-router-dom";
import { ME } from "../graphql/queries";
import { REFRESH } from "../graphql/mutations";

export default function RequireAuth({ children }: PropsWithChildren) {
  const { data, loading, refetch } = useQuery(ME, { fetchPolicy: "cache-and-network" });
  const [refresh] = useMutation(REFRESH);
  const [trying, setTrying] = useState(false);
  const [tried, setTried] = useState(false);
  const loc = useLocation();
  
  useEffect(() => {
    // If ME says no user and we haven't attempted a refresh yet, try once
    if (!loading && !tried && !data?.me && !trying) {
      setTrying(true);
      (async () => {
        try {
          await refresh();
          await refetch();
        } catch {}
        finally {
          setTrying(false);
          setTried(true);
        }
      })();
    }
  }, [loading, data?.me, tried, trying, refresh, refetch]);

  if (loading || trying) return <div className="py-10 text-center">Loading…</div>;
  const user = data?.me;
  if (!user) return <Navigate to="/" replace state={{ from: loc.pathname }} />;
  return <>{children}</>;
}
