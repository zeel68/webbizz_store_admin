"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, ImageIcon, Star, MessageSquare, Loader2, RefreshCw } from 'lucide-react'
import { useHomepageStore } from "@/store/homepageStore"

import { TrendingCategoriesManager } from "@/components/dashboard/homepage/trending-categories-manager"
import { TrendingProductsManager } from "@/components/dashboard/homepage/trending-products-manager"
import { TestimonialsManager } from "@/components/dashboard/homepage/testimonials-manager"
import { HeroSlidesManager } from "@/components/dashboard/homepage/homepage"

export default function HomepagePage() {
    const {
        homepageConfig,
        heroSlides,
        trendingCategories,
        trendingProducts,
        testimonials,
        loading,
        error,
        fetchHomepageConfig,
        fetchHeroSlides,
        fetchTrendingCategories,
        fetchTrendingProducts,
        fetchTestimonials,
        clearError
    } = useHomepageStore()

    const [activeTab, setActiveTab] = useState("hero")

    useEffect(() => {
        // fetchHomepageConfig()
        fetchHeroSlides()
        fetchTrendingCategories()
        // fetchTrendingProducts()
        // fetchTestimonials()
    }, [])

    const handleRefresh = () => {
        clearError()
        // fetchHomepageConfig()
        // fetchHeroSlides()
        // fetchTrendingCategories()
        // fetchTrendingProducts()
        // fetchTestimonials()
    }

    if (error) {
        return (
            <div className="flex h-full items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-destructive">Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>{error}</p>
                        <Button onClick={handleRefresh} className="mt-4">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Homepage Management</h1>
                    <p className="text-muted-foreground">
                        Manage your store's homepage content and layout
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Hero Slides</CardTitle>
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{heroSlides.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Active slides
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Trending Categories</CardTitle>
                        <Star className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{trendingCategories.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Featured categories
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Trending Products</CardTitle>
                        <Star className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{trendingProducts.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Featured products
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Testimonials</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{testimonials.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Customer reviews
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Tabs */}
            <Card>
                <CardHeader>
                    <CardTitle>Homepage Content</CardTitle>
                    <CardDescription>
                        Manage different sections of your homepage
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="hero">Hero Slides</TabsTrigger>
                            <TabsTrigger value="categories">Trending Categories</TabsTrigger>
                            <TabsTrigger value="products">Trending Products</TabsTrigger>
                            <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
                        </TabsList>

                        <TabsContent value="hero" className="space-y-4 mt-6">
                            <HeroSlidesManager />
                        </TabsContent>

                        <TabsContent value="categories" className="space-y-4 mt-6">
                            <TrendingCategoriesManager />
                        </TabsContent>

                        <TabsContent value="products" className="space-y-4 mt-6">
                            <TrendingProductsManager />
                        </TabsContent>

                        <TabsContent value="testimonials" className="space-y-4 mt-6">
                            <TestimonialsManager />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    )
}
