import { create } from "zustand";
import { Material } from "@/types/material";

interface MaterialsState {
  materials: Material[];
  loading: boolean;
  lastFetch: number | null;
  fetchMaterials: (force?: boolean) => Promise<void>;
  addMaterial: (material: Material) => void;
  updateMaterial: (id: string, material: Partial<Material>) => void;
  deleteMaterial: (id: string) => void;
  reset: () => void;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useMaterialsStore = create<MaterialsState>((set, get) => ({
  materials: [],
  loading: false,
  lastFetch: null,

  fetchMaterials: async (force = false) => {
    const { lastFetch, loading } = get();
    const now = Date.now();

    if (!force && lastFetch && now - lastFetch < CACHE_DURATION && !loading) {
      return;
    }

    if (loading) return;

    set({ loading: true });
    try {
      const response = await fetch("/api/materials");
      if (!response.ok) throw new Error("Failed to fetch materials");
      const data = await response.json();
      set({
        materials: Array.isArray(data) ? data : [],
        lastFetch: now,
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching materials:", error);
      set({ loading: false });
    }
  },

  addMaterial: (material) => {
    set((state) => ({
      materials: [...state.materials, material],
    }));
  },

  updateMaterial: (id, updatedMaterial) => {
    set((state) => ({
      materials: state.materials.map((material) =>
        material._id === id ? { ...material, ...updatedMaterial } : material
      ),
    }));
  },

  deleteMaterial: (id) => {
    set((state) => ({
      materials: state.materials.filter((material) => material._id !== id),
    }));
  },

  reset: () => {
    set({
      materials: [],
      loading: false,
      lastFetch: null,
    });
  },
}));
