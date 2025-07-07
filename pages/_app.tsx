import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { getAuth, getRedirectResult } from "firebase/auth";
import { auth } from "@/utils/firebase";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    // Handle Google sign-in redirect result
    getRedirectResult(auth)
      .then((result) => {
        if (result && result.user) {
          // Successful sign-in, redirect to /knowledge
          router.push("/knowledge");
        }
      })
      .catch((error) => {
        // Optionally handle errors
        // console.error(error);
      });
  }, [router]);

  return <Component {...pageProps} />;
}
