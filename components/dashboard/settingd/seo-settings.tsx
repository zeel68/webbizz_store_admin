"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Save, Loader2, Globe, Search, Plus, X, ExternalLink } from 'lucide-react'
import { useStoreConfigStore } from "@/store/storeConfigStore"


interface SEOSettingsProps {
    storeConfig: iStoreConfig | null
}

interface SEOFormData {
    meta_title: string
    meta_description: string
    keywords: string[]
}

export function SEOSettings({ storeConfig }: SEOSettingsProps) {
    const { updateStoreConfig, loading } = useStoreConfigStore()

    const [keywords, setKeywords] = useState<string[]>([])
    const [newKeyword, setNewKeyword] = useState("")
    const [structuredData, setStructuredData] = useState({
        organization: {
            name: "",
            url: "",
            logo: "",
            description: "",
            telephone: "",
            email: "",
            address: {
                streetAddress: "",
                addressLocality: "",
                addressRegion: "",
                postalCode: "",
                addressCountry: ""
            }
        },
        website: {
            name: "",
            url: "",
            description: "",
            inLanguage: "en-US"
        }
    })

    const form = useForm<SEOFormData>({
        defaultValues: {
            meta_title: "",
            meta_description: "",
            keywords: [],
        },
    })

    useEffect(() => {
        if (storeConfig?.seo_settings) {
            form.reset({
                meta_title: storeConfig.seo_settings.meta_title || "",
                meta_description: storeConfig.seo_settings.meta_description || "",
                keywords: storeConfig.seo_settings.keywords || [],
            })
            setKeywords(storeConfig.seo_settings.keywords || [])
        }

        // Populate structured data from store config
        if (storeConfig) {
            setStructuredData({
                organization: {
                    name: storeConfig.name || "",
                    url: storeConfig.contact_info?.website || "",
                    logo: storeConfig.logo_url || "",
                    description: storeConfig.description || "",
                    telephone: storeConfig.contact_info?.phone || "",
                    email: storeConfig.contact_info?.email || "",
                    address: {
                        streetAddress: storeConfig.address?.street || "",
                        addressLocality: storeConfig.address?.city || "",
                        addressRegion: storeConfig.address?.state || "",
                        postalCode: storeConfig.address?.postal_code || "",
                        addressCountry: storeConfig.address?.country || ""
                    }
                },
                website: {
                    name: storeConfig.name || "",
                    url: storeConfig.contact_info?.website || "",
                    description: storeConfig.description || "",
                    inLanguage: "en-US"
                }
            })
        }
    }, [storeConfig, form])

    const addKeyword = () => {
        if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
            const updatedKeywords = [...keywords, newKeyword.trim()]
            setKeywords(updatedKeywords)
            setNewKeyword("")
        }
    }

    const removeKeyword = (keywordToRemove: string) => {
        const updatedKeywords = keywords.filter(keyword => keyword !== keywordToRemove)
        setKeywords(updatedKeywords)
    }

    const onSubmit = async (data: SEOFormData) => {
        try {
            const seoData = {
                ...data,
                keywords
            }

            const formData = new FormData()
            formData.append('seo_settings', JSON.stringify(seoData))

            await updateStoreConfig(formData as any)
            toast.success("SEO settings updated successfully")
        } catch (error: any) {
            toast.error(error.message || "Failed to update SEO settings")
        }
    }

    const generateStructuredData = () => {
        const organizationSchema = {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": structuredData.organization.name,
            "url": structuredData.organization.url,
            "logo": structuredData.organization.logo,
            "description": structuredData.organization.description,
            "telephone": structuredData.organization.telephone,
            "email": structuredData.organization.email,
            "address": {
                "@type": "PostalAddress",
                "streetAddress": structuredData.organization.address.streetAddress,
                "addressLocality": structuredData.organization.address.addressLocality,
                "addressRegion": structuredData.organization.address.addressRegion,
                "postalCode": structuredData.organization.address.postalCode,
                "addressCountry": structuredData.organization.address.addressCountry
            }
        }

        const websiteSchema = {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": structuredData.website.name,
            "url": structuredData.website.url,
            "description": structuredData.website.description,
            "inLanguage": structuredData.website.inLanguage
        }

        return {
            organization: organizationSchema,
            website: websiteSchema
        }
    }

    const watchedValues = form.watch()

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Search className="h-5 w-5" />
                        Meta Tags
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="meta_title">Meta Title</Label>
                        <Input
                            id="meta_title"
                            {...form.register("meta_title")}
                            placeholder="Your Store - Best Products Online"
                            maxLength={60}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Recommended: 50-60 characters</span>
                            <span>{watchedValues.meta_title?.length || 0}/60</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="meta_description">Meta Description</Label>
                        <Textarea
                            id="meta_description"
                            {...form.register("meta_description")}
                            placeholder="Discover amazing products at great prices. Fast shipping, excellent customer service, and quality guaranteed."
                            rows={3}
                            maxLength={160}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Recommended: 150-160 characters</span>
                            <span>{watchedValues.meta_description?.length || 0}/160</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Label>Meta Keywords</Label>
                        <div className="flex gap-2">
                            <Input
                                value={newKeyword}
                                onChange={(e) => setNewKeyword(e.target.value)}
                                placeholder="Add a keyword"
                                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addKeyword())}
                            />
                            <Button type="button" onClick={addKeyword} variant="outline">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        {keywords.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {keywords.map((keyword, index) => (
                                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                        {keyword}
                                        <X
                                            className="h-3 w-3 cursor-pointer"
                                            onClick={() => removeKeyword(keyword)}
                                        />
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="mt-6 p-4 bg-muted rounded-lg">
                        <h4 className="font-medium mb-2">SEO Preview</h4>
                        <div className="space-y-1">
                            <div className="text-blue-600 text-lg hover:underline cursor-pointer">
                                {watchedValues.meta_title || "Your Store Title"}
                            </div>
                            <div className="text-green-700 text-sm">
                                {storeConfig?.contact_info?.website || "https://yourstore.com"}
                            </div>
                            <div className="text-sm text-gray-600">
                                {watchedValues.meta_description || "Your store description will appear here..."}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        Structured Data (Schema.org)
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Structured data helps search engines understand your content better and can improve your search results appearance.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h4 className="font-medium">Organization Schema</h4>
                            <div className="space-y-2">
                                <Label>Organization Name</Label>
                                <Input
                                    value={structuredData.organization.name}
                                    onChange={(e) => setStructuredData(prev => ({
                                        ...prev,
                                        organization: {
                                            ...prev.organization,
                                            name: e.target.value
                                        }
                                    }))}
                                    placeholder="Your Store Name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Website URL</Label>
                                <Input
                                    value={structuredData.organization.url}
                                    onChange={(e) => setStructuredData(prev => ({
                                        ...prev,
                                        organization: {
                                            ...prev.organization,
                                            url: e.target.value
                                        }
                                    }))}
                                    placeholder="https://yourstore.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Logo URL</Label>
                                <Input
                                    value={structuredData.organization.logo}
                                    onChange={(e) => setStructuredData(prev => ({
                                        ...prev,
                                        organization: {
                                            ...prev.organization,
                                            logo: e.target.value
                                        }
                                    }))}
                                    placeholder="https://yourstore.com/logo.png"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-medium">Website Schema</h4>
                            <div className="space-y-2">
                                <Label>Website Name</Label>
                                <Input
                                    value={structuredData.website.name}
                                    onChange={(e) => setStructuredData(prev => ({
                                        ...prev,
                                        website: {
                                            ...prev.website,
                                            name: e.target.value
                                        }
                                    }))}
                                    placeholder="Your Store"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Website Description</Label>
                                <Textarea
                                    value={structuredData.website.description}
                                    onChange={(e) => setStructuredData(prev => ({
                                        ...prev,
                                        website: {
                                            ...prev.website,
                                            description: e.target.value
                                        }
                                    }))}
                                    placeholder="Your store description"
                                    rows={3}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Language</Label>
                                <Input
                                    value={structuredData.website.inLanguage}
                                    onChange={(e) => setStructuredData(prev => ({
                                        ...prev,
                                        website: {
                                            ...prev.website,
                                            inLanguage: e.target.value
                                        }
                                    }))}
                                    placeholder="en-US"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <h4 className="font-medium mb-2">Generated Schema Preview</h4>
                        <div className="bg-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
                            <pre>{JSON.stringify(generateStructuredData(), null, 2)}</pre>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>SEO Tools & Resources</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <h4 className="font-medium">Testing Tools</h4>
                            <div className="space-y-2">
                                <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                                    <a href="https://search.google.com/test/rich-results" target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        Google Rich Results Test
                                    </a>
                                </Button>
                                <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                                    <a href="https://validator.schema.org/" target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        Schema.org Validator
                                    </a>
                                </Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-medium">Search Console</h4>
                            <div className="space-y-2">
                                <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                                    <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        Google Search Console
                                    </a>
                                </Button>
                                <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                                    <a href="https://www.bing.com/webmasters" target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        Bing Webmaster Tools
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button type="submit" disabled={loading} className="flex items-center gap-2">
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    <Save className="h-4 w-4" />
                    Save SEO Settings
                </Button>
            </div>
        </form>
    )
}
