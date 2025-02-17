"use client";

import { supabase } from "@/lib/supabase/supabse";
import { useEffect, useState } from "react";

export default function Account() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function fetchUser() {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.log("Erro ao obter usuário:", error);
      } else {
        setUser(data.user);
      }
    }

    fetchUser();
  }, []);

  return <h1>VOCÊ está logado {user?.email}</h1>;
}
