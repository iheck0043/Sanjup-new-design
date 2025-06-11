import { useState, useRef } from "react";

interface UseApiResponse<T = any> {
  loading: boolean;
  data: T | null;
  error: string | null;
  get: (params?: any) => Promise<void>;
  post: (data?: any) => Promise<void>;
}

export function useApi<T = any>(endpoint: string): UseApiResponse<T> {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const baseURL =
    import.meta.env.VITE_BASE_URL || "https://api.your-domain.com";

  const makeRequest = async (
    method: "GET" | "POST",
    params?: any,
    body?: any
  ) => {
    try {
      // Cancel previous request if exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      setLoading(true);
      setError(null);

      // Build URL with params for GET requests
      let url = `${baseURL}/${endpoint}`;
      if (method === "GET" && params) {
        const searchParams = new URLSearchParams();
        Object.keys(params).forEach((key) => {
          if (params[key] !== undefined && params[key] !== null) {
            searchParams.append(key, params[key].toString());
          }
        });
        if (searchParams.toString()) {
          url += `?${searchParams.toString()}`;
        }
      }

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      // Add authorization header if token exists
      const token =
        localStorage.getItem("auth-token") ||
        sessionStorage.getItem("auth-token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const requestOptions: RequestInit = {
        method,
        headers,
        signal: abortControllerRef.current.signal,
      };

      if (method === "POST" && body) {
        requestOptions.body = JSON.stringify(body);
      }

      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();
      setData(responseData);
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setError(err.message || "خطا در ارتباط با سرور");
        console.error("API Error:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const get = async (params?: any) => {
    await makeRequest("GET", params);
  };

  const post = async (body?: any) => {
    await makeRequest("POST", undefined, body);
  };

  return {
    loading,
    data,
    error,
    get,
    post,
  };
}

export default useApi;
