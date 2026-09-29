import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client.js";
import BioView from "../components/BioView.jsx";
import Spinner from "../components/Spinner.jsx";

export default function PublicBio() {
  const { username } = useParams();
  const [state, setState] = useState({ loading: true, page: null, showBranding: true });

  useEffect(() => {
    api
      .get(`/bio/public/${username}`)
      .then(({ data }) => {
        setState({ loading: false, page: data.page, showBranding: data.showBranding });
        document.title = data.page.displayName || `@${data.page.username}`;
      })
      .catch(() => setState({ loading: false, page: null, showBranding: true }));
  }, [username]);

  if (state.loading) return <Spinner full />;

  if (!state.page) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-center">
        <h1 className="text-2xl font-bold">Page not found</h1>
        <Link to="/" className="text-brand-600">Create your own bio page</Link>
      </div>
    );
  }

  return <BioView page={state.page} showBranding={state.showBranding} />;
}
