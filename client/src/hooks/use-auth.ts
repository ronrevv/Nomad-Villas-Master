import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { User } from "@shared/models/auth";
import { useToast } from "@/hooks/use-toast";

async function fetchUser(): Promise<User | null> {
  const response = await fetch("/api/user"); // Updated path from /api/auth/user

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    // If we can't parse JSON, it might be an HTML error page or similar
    try {
        const error = await response.json();
        throw new Error(error.message || `${response.status}: ${response.statusText}`);
    } catch (e) {
        throw new Error(`${response.status}: ${response.statusText}`);
    }
  }

  return response.json();
}

async function login(credentials: { username: string; password?: string }): Promise<User> {
  const response = await fetch("/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Login failed");
  }

  return response.json();
}

async function logout(): Promise<void> {
  const response = await fetch("/api/logout", {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Logout failed");
  }
}

export function useAuth() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/user"],
    queryFn: fetchUser,
    retry: false,
    staleTime: Infinity, // Don't refetch automatically
  });

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/user"], user);
    },
    onError: (error: Error) => {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      // Optional: redirect to home
      window.location.href = "/";
    },
    onError: (error: Error) => {
      toast({
        title: "Logout Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    loginMutation,
    logout: logoutMutation,
  };
}
