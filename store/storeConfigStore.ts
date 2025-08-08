import { create } from 'zustand'
import { devtools } from 'zustand/middleware'


interface StoreConfigState {
    // Store Configuration
    loading: boolean
    storeConfig: iStoreConfig | null

    error: string | null

    // Theme Settings
    themeSettings: iStoreTheme | null


    // Features
    features: iStoreFeatures | null


    // Actions
    fetchStoreConfig: () => Promise<void>
    updateStoreConfig: (config: Partial<iStoreConfig>) => Promise<void>
    updateThemeSettings: (theme: iStoreTheme) => Promise<void>
    updateFeatures: (features: iStoreFeatures) => Promise<void>
    clearError: () => void
}

export const useStoreConfigStore = create<StoreConfigState>()(
    devtools(
        (set, get) => ({
            // Initial state
            storeConfig: null,
            loading: false,
            error: null,
            themeSettings: null,
            features: null,


            // Fetch store configuration
            fetchStoreConfig: async () => {
                set({ loading: true, error: null })
                try {
                    const response = await fetch('/api/store/config')
                    const data = await response.json()

                    if (data.success) {
                        set({
                            storeConfig: data.data,
                            themeSettings: data.data.theme_settings,
                            features: data.data.features,
                            loading: false
                        })
                    } else {
                        set({ error: data.message, loading: false })
                    }
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Failed to fetch store config',
                        loading: false
                    })
                }
            },

            // Update store configuration
            updateStoreConfig: async (config: Partial<iStoreConfig>) => {
                set({ loading: true, error: null })
                try {
                    const formData = new FormData()

                    // Handle file uploads
                    if (config.logo_url) {
                        formData.append('store_logo', config.logo_url)
                        delete config.logo_url
                    }

                    if (config.banner_url) {
                        formData.append('store_banner', config.banner_url)
                        delete config.banner_url
                    }

                    // Append other data
                    Object.entries(config).forEach(([key, value]) => {
                        if (value !== undefined && value !== null) {
                            if (typeof value === 'object') {
                                formData.append(key, JSON.stringify(value))
                            } else {
                                formData.append(key, value.toString())
                            }
                        }
                    })

                    const response = await fetch('/api/store/config', {
                        method: 'PUT',
                        body: formData
                    })

                    const data = await response.json()

                    if (data.success) {
                        set(state => ({
                            storeConfig: { ...state.storeConfig, ...data.data },
                            loading: false
                        }))
                    } else {
                        set({ error: data.message, loading: false })
                    }
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Failed to update store config',
                        loading: false
                    })
                }
            },

            // Update theme settings
            updateThemeSettings: async (theme: iStoreTheme) => {
                set({ loading: true, error: null })
                try {
                    const response = await fetch('/api/store/theme', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ theme_settings: theme })
                    })

                    const data = await response.json()

                    // if (data.success) {
                    //     set(state => ({
                    //         themeSettings: theme,
                    //         storeConfig: state.storeConfig ? {
                    //             ...state.storeConfig,
                    //             theme_settings: theme
                    //         } : null,
                    //         loading: false
                    //     }))
                    // } else {
                    //     set({ error: data.message, loading: false })
                    // }
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Failed to update theme',
                        loading: false
                    })
                }
            },

            // Update features
            updateFeatures: async (features: iStoreFeatures) => {
                set({ loading: true, error: null })
                try {
                    const response = await fetch('/api/store/features', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ features })
                    })

                    const data = await response.json()

                    if (data.success) {
                        set(state => ({
                            features,
                            storeConfig: state.storeConfig ? {
                                ...state.storeConfig,
                                features
                            } : null,
                            loading: false
                        }))
                    } else {
                        set({ error: data.message, loading: false })
                    }
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Failed to update features',
                        loading: false
                    })
                }
            },

            // Clear error
            clearError: () => set({ error: null })
        }),
        { name: 'store-config-store' }
    )
)
