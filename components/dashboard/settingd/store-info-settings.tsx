"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Save, Loader2, Store, MapPin, Phone, Mail, Globe } from 'lucide-react'
import { useStoreConfigStore } from "@/store/storeConfigStore"
import ImageUpload from "@/components/shared/image-upload"


interface StoreInfoSettingsProps {
    storeConfig: iStoreConfig | null
}

interface StoreInfoFormData {
    name: string
    description: string
    contact_info: {
        email: string
        phone: string
        website: string
    }
    address: {
        street: string
        city: string
        state: string
        country: string
        postal_code: string
    }
    social_media: {
        facebook: string
        twitter: string
        instagram: string
        linkedin: string
    }
}

export function StoreInfoSettings({ storeConfig }: StoreInfoSettingsProps) {
    const { updateStoreConfig, loading } = useStoreConfigStore()

    const [logoImages, setLogoImages] = useState<File[]>([])
    const [bannerImages, setBannerImages] = useState<File[]>([])

    const form = useForm<StoreInfoFormData>({
        defaultValues: {
            name: "",
            description: "",
            contact_info: {
                email: "",
                phone: "",
                website: "",
            },
            address: {
                street: "",
                city: "",
                state: "",
                country: "",
                postal_code: "",
            },
            social_media: {
                facebook: "",
                twitter: "",
                instagram: "",
                linkedin: "",
            },
        },
    })

    useEffect(() => {
        if (storeConfig) {
            form.reset({
                name: storeConfig.name || "",
                description: storeConfig.description || "",
                contact_info: {
                    email: storeConfig.contact_info?.email || "",
                    phone: storeConfig.contact_info?.phone || "",
                    website: storeConfig.contact_info?.website || "",
                },
                address: {
                    street: storeConfig.address?.street || "",
                    city: storeConfig.address?.city || "",
                    state: storeConfig.address?.state || "",
                    country: storeConfig.address?.country || "",
                    postal_code: storeConfig.address?.postal_code || "",
                },
                social_media: {
                    facebook: storeConfig.social_media?.facebook || "",
                    twitter: storeConfig.social_media?.twitter || "",
                    instagram: storeConfig.social_media?.instagram || "",
                    linkedin: storeConfig.social_media?.linkedin || "",
                },
            })
        }
    }, [storeConfig, form])

    const onSubmit = async (data: StoreInfoFormData) => {
        try {
            const formData = new FormData()

            // Append form data
            formData.append('name', data.name)
            formData.append('description', data.description)
            formData.append('contact_info', JSON.stringify(data.contact_info))
            formData.append('address', JSON.stringify(data.address))
            formData.append('social_media', JSON.stringify(data.social_media))

            // Append images
            if (logoImages.length > 0) {
                formData.append('logo', logoImages[0])
            }
            if (bannerImages.length > 0) {
                formData.append('banner', bannerImages[0])
            }

            await updateStoreConfig(formData as any)
            toast.success("Store information updated successfully")
        } catch (error: any) {
            toast.error(error.message || "Failed to update store information")
        }
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Store className="h-5 w-5" />
                        Basic Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Store Name *</Label>
                                <Input
                                    id="name"
                                    {...form.register("name")}
                                    placeholder="Enter your store name"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    {...form.register("description")}
                                    placeholder="Describe your store"
                                    rows={4}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Store Logo</Label>
                                <ImageUpload
                                    onSelectFiles={setLogoImages}
                                    onRemove={() => setLogoImages([])}
                                    value={logoImages}
                                    multiple={false}
                                    showPreview={true}
                                    type="profile"
                                    showLocalPreview={true}
                                />
                                {storeConfig?.logo_url && logoImages.length === 0 && (
                                    <div className="mt-2">
                                        <p className="text-sm text-muted-foreground mb-2">Current logo:</p>
                                        <img
                                            src={storeConfig.logo_url || "/placeholder.svg"}
                                            alt="Store logo"
                                            className="w-24 h-24 object-contain rounded border"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Store Banner</Label>
                                <ImageUpload
                                    onSelectFiles={setBannerImages}
                                    onRemove={() => setBannerImages([])}
                                    value={bannerImages}
                                    multiple={false}
                                    showPreview={true}
                                    type="cover"
                                    showLocalPreview={true}
                                />
                                {storeConfig?.banner_url && bannerImages.length === 0 && (
                                    <div className="mt-2">
                                        <p className="text-sm text-muted-foreground mb-2">Current banner:</p>
                                        <img
                                            src={storeConfig.banner_url || "/placeholder.svg"}
                                            alt="Store banner"
                                            className="w-full h-24 object-cover rounded border"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Phone className="h-5 w-5" />
                        Contact Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                {...form.register("contact_info.email")}
                                placeholder="store@example.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                {...form.register("contact_info.phone")}
                                placeholder="+1 (555) 123-4567"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="website">Website</Label>
                            <Input
                                id="website"
                                type="url"
                                {...form.register("contact_info.website")}
                                placeholder="https://yourstore.com"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Store Address
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="street">Street Address</Label>
                        <Input
                            id="street"
                            {...form.register("address.street")}
                            placeholder="123 Main Street"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input
                                id="city"
                                {...form.register("address.city")}
                                placeholder="New York"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="state">State/Province</Label>
                            <Input
                                id="state"
                                {...form.register("address.state")}
                                placeholder="NY"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="country">Country</Label>
                            <Input
                                id="country"
                                {...form.register("address.country")}
                                placeholder="United States"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="postal_code">Postal Code</Label>
                            <Input
                                id="postal_code"
                                {...form.register("address.postal_code")}
                                placeholder="10001"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        Social Media
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="facebook">Facebook</Label>
                            <Input
                                id="facebook"
                                {...form.register("social_media.facebook")}
                                placeholder="https://facebook.com/yourstore"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="twitter">Twitter</Label>
                            <Input
                                id="twitter"
                                {...form.register("social_media.twitter")}
                                placeholder="https://twitter.com/yourstore"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="instagram">Instagram</Label>
                            <Input
                                id="instagram"
                                {...form.register("social_media.instagram")}
                                placeholder="https://instagram.com/yourstore"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="linkedin">LinkedIn</Label>
                            <Input
                                id="linkedin"
                                {...form.register("social_media.linkedin")}
                                placeholder="https://linkedin.com/company/yourstore"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button type="submit" disabled={loading} className="flex items-center gap-2">
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    <Save className="h-4 w-4" />
                    Save Changes
                </Button>
            </div>
        </form>
    )
}
