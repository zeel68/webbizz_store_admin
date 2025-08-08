// stores/customerStore.ts
import ApiClient from "@/lib/apiCalling";
import { getSession } from "next-auth/react";
import { create } from "zustand";
import { persist } from "zustand/middleware";



interface CustomerState {
    customerInfo: iCustomersInfo | null;
    loading: boolean;
    error: string | null;

    fetchCustomers: (query: any) => Promise<void>;
    updateCustomer: (id: string, data: any) => Promise<void>;
    deleteCustomer: (id: string) => Promise<void>;
    clearError: () => void;
}



// Async function to initialize the store with session handling
const initializeStore = async () => {
    const session = await getSession();
    const apiClient = new ApiClient({
        headers: {
            Authorization: `Bearer ${session?.user.accessToken}`,
        },
    });

    return create<CustomerState>()(
        persist(
            (set) => ({
                customerInfo: null,
                loading: false,
                error: null,

                fetchCustomers: async (query: any) => {
                    set({ loading: true, error: null });
                    try {
                        const searchParams = new URLSearchParams();
                        Object.entries(query).forEach(([key, value]) => {
                            if (value && value !== "all") {
                                searchParams.append(key, value.toString());
                            }
                        });

                        const response = (await apiClient.get(
                            `/store-admin/customers?${searchParams.toString()}`
                        )) as ApiResponse<any>;
                        if (response.success) {
                            set({
                                customerInfo: response.data.data,
                                loading: false,
                            });
                        } else {
                            set({
                                error: response.error || "Failed to fetch customers",
                                loading: false,
                            });
                        }
                    } catch (error: any) {
                        set({
                            error: error.message || "Failed to fetch customers",
                            loading: false,
                        });
                    }
                },

                updateCustomer: async (id: string, data: any) => {
                    set({ loading: true, error: null });
                    try {
                        const response = (await apiClient.put(
                            `/store-admin/customers/${id}`,
                            data
                        )) as ApiResponse<any>;
                        if (response.success) {
                            set((state) => ({
                                customerInfo: state.customerInfo
                                    ? {
                                        ...state.customerInfo,
                                        customers: state.customerInfo.customers.map((c) =>
                                            c._id === id ? { ...c, ...response.data } : c
                                        ),
                                    }
                                    : null,
                                loading: false,
                            }));
                        } else {
                            set({
                                error: response.error || "Failed to update customer",
                                loading: false,
                            });
                            throw new Error(response.error || "Failed to update customer");
                        }
                    } catch (error: any) {
                        set({
                            error: error.message || "Failed to update customer",
                            loading: false,
                        });
                        throw error;
                    }
                },

                deleteCustomer: async (id: string) => {
                    set({ loading: true, error: null });
                    try {
                        const response = (await apiClient.delete(
                            `/store-admin/customers/${id}`
                        )) as ApiResponse<any>;
                        if (response.success) {
                            set((state) => ({
                                customerInfo: state.customerInfo
                                    ? {
                                        ...state.customerInfo,
                                        customers: state.customerInfo.customers.filter(
                                            (c) => c._id !== id
                                        ),
                                    }
                                    : null,
                                loading: false,
                            }));
                        } else {
                            set({
                                error: response.error || "Failed to delete customer",
                                loading: false,
                            });
                            throw new Error(response.error || "Failed to delete customer");
                        }
                    } catch (error: any) {
                        set({
                            error: error.message || "Failed to delete customer",
                            loading: false,
                        });
                        throw error;
                    }
                },

                clearError: () => set({ error: null }),
            }),
            {
                name: "customer-store",
            }
        )
    );
};

// Export the store as a promise to handle async initialization
export const useCustomerStore = await initializeStore();