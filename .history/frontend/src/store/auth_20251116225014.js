import { create } from "zustand";
import { mountStoreDevtool } from "simple-zustand-devtools";

const useAuthStore = create((set, get) => ({
  allUserData: null,
  loading: false,

  user: {
    user_id: null,
    username: null,
  },

  setUser: (user) => {
    set({
      allUserData: user,
      user: {
        user_id: user?.user_id || null,
        username: user?.username || null,
      },
    });
  },

  setLoading: (loading) => set({ loading }),

  isLoggedIn: () => get().allUserData !== null,
}));

if (import.meta.env.DEV) {
  mountStoreDevtool("Store", useAuthStore);
}

export { useAuthStore };
