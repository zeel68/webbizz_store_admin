// "use client";

// import type React from "react";
// import { useState, useEffect } from "react";

// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Switch } from "@/components/ui/switch";
// import { Separator } from "@/components/ui/separator";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { toast } from "sonner";
// import {
//   Loader2,
//   Package,
//   DollarSign,
//   Upload,
//   X,
//   Plus,
//   ImageIcon,
//   Star,
// } from "lucide-react";

// interface AddProductDialogProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   categoryId: string;
//   categoryName: string;
//   onProductAdded?: (product: any) => void;
// }

// interface ProductFormData {
//   name: string;
//   description: string;
//   price: number;
//   stock: {
//     quantity: number;
//     reserved: number;
//   };
//   images: string[];
//   is_active: boolean;
//   is_featured: boolean;
//   attributes: {
//     color: Array<{
//       colorOption: string;
//       isSelected: boolean;
//     }>;
//     size: Array<{
//       sizeOption: string;
//       isSelected: boolean;
//     }>;
//   };
//   tags: string[];
// }

// export function AddProductDialog({
//   open,
//   onOpenChange,
//   categoryId,
//   categoryName,
//   onProductAdded,
// }: AddProductDialogProps) {
//   const { createProduct } = ();

//   const [formData, setFormData] = useState<ProductFormData>({
//     name: "",
//     description: "",
//     price: 0,
//     stock: {
//       quantity: 0,
//       reserved: 0,
//     },
//     images: [],
//     is_active: true,
//     is_featured: false,
//     attributes: {
//       color: [],
//       size: [],
//     },
//     tags: [],
//   });

//   const [selectedImages, setSelectedImages] = useState<File[]>([]);
//   const [imagePreviews, setImagePreviews] = useState<string[]>([]);
//   const [primaryImageIndex, setPrimaryImageIndex] = useState(0);
//   const [isUploading, setIsUploading] = useState(false);
//   const [colorInput, setColorInput] = useState("");
//   const [sizeInput, setSizeInput] = useState("");
//   const [tagInput, setTagInput] = useState("");

//   // Reset form when dialog opens
//   useEffect(() => {
//     if (open) {
//       setFormData({
//         name: "",
//         description: "",
//         price: 0,
//         stock: { quantity: 0, reserved: 0 },
//         images: [],
//         is_active: true,
//         is_featured: false,
//         attributes: { color: [], size: [] },
//         tags: [],
//       });
//       setSelectedImages([]);
//       setImagePreviews([]);
//       setPrimaryImageIndex(0);
//       setColorInput("");
//       setSizeInput("");
//       setTagInput("");
//     }
//   }, [open]);

//   const handleChange = (field: string, value: any) => {
//     if (field.includes(".")) {
//       const [parent, child] = field.split(".");
//       setFormData((prev) => ({
//         ...prev,
//         [parent]: {
//           ...prev[parent as keyof ProductFormData],
//           [child]: value,
//         },
//       }));
//     } else {
//       setFormData((prev) => ({ ...prev, [field]: value }));
//     }
//   };

//   const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const files = Array.from(event.target.files || []);
//     if (files.length > 0) {
//       setSelectedImages((prev) => [...prev, ...files]);

//       // Create previews
//       files.forEach((file) => {
//         const reader = new FileReader();
//         reader.onload = (e) => {
//           setImagePreviews((prev) => [...prev, e.target?.result as string]);
//         };
//         reader.readAsDataURL(file);
//       });
//     }
//   };

//   const handleImageRemove = (index: number) => {
//     setSelectedImages((prev) => prev.filter((_, i) => i !== index));
//     setImagePreviews((prev) => prev.filter((_, i) => i !== index));

//     if (primaryImageIndex === index) {
//       setPrimaryImageIndex(0);
//     } else if (primaryImageIndex > index) {
//       setPrimaryImageIndex(primaryImageIndex - 1);
//     }
//   };

//   const addColor = () => {
//     if (colorInput.trim()) {
//       setFormData((prev) => ({
//         ...prev,
//         attributes: {
//           ...prev.attributes,
//           color: [
//             ...prev.attributes.color,
//             { colorOption: colorInput.trim(), isSelected: true },
//           ],
//         },
//       }));
//       setColorInput("");
//     }
//   };

//   const addSize = () => {
//     if (sizeInput.trim()) {
//       setFormData((prev) => ({
//         ...prev,
//         attributes: {
//           ...prev.attributes,
//           size: [
//             ...prev.attributes.size,
//             { sizeOption: sizeInput.trim(), isSelected: true },
//           ],
//         },
//       }));
//       setSizeInput("");
//     }
//   };

//   const addTag = () => {
//     if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
//       setFormData((prev) => ({
//         ...prev,
//         tags: [...prev.tags, tagInput.trim()],
//       }));
//       setTagInput("");
//     }
//   };

//   const removeColor = (index: number) => {
//     setFormData((prev) => ({
//       ...prev,
//       attributes: {
//         ...prev.attributes,
//         color: prev.attributes.color.filter((_, i) => i !== index),
//       },
//     }));
//   };

//   const removeSize = (index: number) => {
//     setFormData((prev) => ({
//       ...prev,
//       attributes: {
//         ...prev.attributes,
//         size: prev.attributes.size.filter((_, i) => i !== index),
//       },
//     }));
//   };

//   const removeTag = (index: number) => {
//     setFormData((prev) => ({
//       ...prev,
//       tags: prev.tags.filter((_, i) => i !== index),
//     }));
//   };

//   const uploadToCloudinary = async (file: File): Promise<string> => {
//     const formData = new FormData();
//     formData.append("file", file);
//     formData.append(
//       "upload_preset",
//       process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "BizzWeb",
//     );
//     formData.append("folder", "ecommerce_uploads/products");

//     const res = await fetch(
//       `https://api.cloudinary.com/v1_1/₹{process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
//       {
//         method: "POST",
//         body: formData,
//       },
//     );

//     if (!res.ok) {
//       const err = await res.json();
//       throw new Error(err.error?.message || "Upload failed");
//     }

//     const data = await res.json();
//     return data.secure_url;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!formData.name.trim()) {
//       toast.error("Product name is required");
//       return;
//     }

//     if (formData.price <= 0) {
//       toast.error("Product price must be greater than 0");
//       return;
//     }

//     if (selectedImages.length === 0) {
//       toast.error("Please select at least one product image");
//       return;
//     }

//     try {
//       setIsUploading(true);

//       // Upload images to Cloudinary
//       toast.info("Uploading product images...");
//       const uploadedUrls = await Promise.all(
//         selectedImages.map((file) => uploadToCloudinary(file)),
//       );
//       toast.success(`₹{uploadedUrls.length} image(s) uploaded successfully`);

//       // Prepare product data
//       const productData = {
//         ...formData,
//         images: uploadedUrls,
//         category: categoryId,
//         primary_image: uploadedUrls[primaryImageIndex],
//       };

//       // Create product
//       await createProduct(productData);
//       toast.success("Product added successfully");

//       onProductAdded?.(productData);
//       onOpenChange(false);
//     } catch (error: any) {
//       console.error("Product creation failed:", error);
//       toast.error(error.message || "Failed to add product");
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
//         <DialogHeader className="flex-shrink-0 space-y-3">
//           <DialogTitle className="flex items-center gap-2 text-xl">
//             <Package className="h-5 w-5 text-blue-600" />
//             Add Product to {categoryName}
//           </DialogTitle>
//           <DialogDescription className="text-sm text-muted-foreground">
//             Create a new product and add it to the selected category.
//           </DialogDescription>
//         </DialogHeader>

//         <form
//           onSubmit={handleSubmit}
//           className="flex flex-col flex-1 overflow-hidden"
//         >
//           <div className="flex-1 overflow-hidden">
//             <ScrollArea className="h-full">
//               <div className="space-y-6 p-1">
//                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                   {/* Basic Product Info */}
//                   <Card>
//                     <CardHeader>
//                       <CardTitle className="flex items-center gap-2 text-lg">
//                         <Package className="h-4 w-4 text-green-600" />
//                         Product Information
//                       </CardTitle>
//                     </CardHeader>
//                     <CardContent className="space-y-4">
//                       <div className="space-y-2">
//                         <Label>
//                           Product Name <span className="text-red-500">*</span>
//                         </Label>
//                         <Input
//                           value={formData.name}
//                           onChange={(e) => handleChange("name", e.target.value)}
//                           placeholder="e.g. iPhone 15 Pro"
//                           required
//                         />
//                       </div>

//                       <div className="space-y-2">
//                         <Label>Description</Label>
//                         <Textarea
//                           value={formData.description}
//                           onChange={(e) =>
//                             handleChange("description", e.target.value)
//                           }
//                           placeholder="Product description..."
//                           rows={3}
//                         />
//                       </div>

//                       <div className="grid grid-cols-2 gap-4">
//                         <div className="space-y-2">
//                           <Label>
//                             Price <span className="text-red-500">*</span>
//                           </Label>
//                           <div className="relative">
//                             <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//                             <Input
//                               type="number"
//                               value={formData.price}
//                               onChange={(e) =>
//                                 handleChange(
//                                   "price",
//                                   Number.parseFloat(e.target.value) || 0,
//                                 )
//                               }
//                               placeholder="0.00"
//                               className="pl-10"
//                               min="0"
//                               step="0.01"
//                               required
//                             />
//                           </div>
//                         </div>

//                         <div className="space-y-2">
//                           <Label>Stock Quantity</Label>
//                           <Input
//                             type="number"
//                             value={formData.stock.quantity}
//                             onChange={(e) =>
//                               handleChange(
//                                 "stock.quantity",
//                                 Number.parseInt(e.target.value) || 0,
//                               )
//                             }
//                             placeholder="0"
//                             min="0"
//                           />
//                         </div>
//                       </div>

//                       <Separator />

//                       <div className="space-y-4">
//                         <div className="flex items-center justify-between">
//                           <div className="space-y-0.5">
//                             <Label>Active Product</Label>
//                             <p className="text-sm text-muted-foreground">
//                               Visible to customers
//                             </p>
//                           </div>
//                           <Switch
//                             checked={formData.is_active}
//                             onCheckedChange={(checked) =>
//                               handleChange("is_active", checked)
//                             }
//                           />
//                         </div>

//                         <div className="flex items-center justify-between">
//                           <div className="space-y-0.5">
//                             <Label>Featured Product</Label>
//                             <p className="text-sm text-muted-foreground">
//                               Highlight in featured sections
//                             </p>
//                           </div>
//                           <Switch
//                             checked={formData.is_featured}
//                             onCheckedChange={(checked) =>
//                               handleChange("is_featured", checked)
//                             }
//                           />
//                         </div>
//                       </div>
//                     </CardContent>
//                   </Card>

//                   {/* Product Images */}
//                   <Card>
//                     <CardHeader>
//                       <CardTitle className="flex items-center gap-2 text-lg">
//                         <ImageIcon className="h-4 w-4 text-purple-600" />
//                         Product Images
//                       </CardTitle>
//                     </CardHeader>
//                     <CardContent className="space-y-4">
//                       <div className="space-y-2">
//                         <Label>
//                           Product Images <span className="text-red-500">*</span>
//                         </Label>
//                         <div className="flex items-center justify-center w-full">
//                           <label
//                             htmlFor="image-upload"
//                             className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
//                           >
//                             <div className="flex flex-col items-center justify-center pt-5 pb-6">
//                               <Upload className="w-8 h-8 mb-4 text-gray-500" />
//                               <p className="mb-2 text-sm text-gray-500">
//                                 <span className="font-semibold">
//                                   Click to upload
//                                 </span>
//                               </p>
//                               <p className="text-xs text-gray-500">
//                                 PNG, JPG (MAX. 5MB each)
//                               </p>
//                             </div>
//                             <input
//                               id="image-upload"
//                               type="file"
//                               className="hidden"
//                               accept="image/*"
//                               multiple
//                               onChange={handleImageSelect}
//                             />
//                           </label>
//                         </div>
//                       </div>

//                       {imagePreviews.length > 0 && (
//                         <div className="grid grid-cols-2 gap-3">
//                           {imagePreviews.map((preview, index) => (
//                             <div key={index} className="relative group">
//                               <img
//                                 src={preview || "/placeholder.svg"}
//                                 alt={`Preview ₹{index + 1}`}
//                                 className={`w-full h-20 object-cover rounded-lg border-2 ₹{index === primaryImageIndex
//                                   ? "border-primary"
//                                   : "border-gray-200"
//                                   }`}
//                               />
//                               <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
//                                 <div className="flex gap-1">
//                                   <Button
//                                     type="button"
//                                     size="sm"
//                                     variant="secondary"
//                                     onClick={() => setPrimaryImageIndex(index)}
//                                     className="text-xs h-6"
//                                   >
//                                     <Star className="h-3 w-3" />
//                                   </Button>
//                                   <Button
//                                     type="button"
//                                     size="sm"
//                                     variant="destructive"
//                                     onClick={() => handleImageRemove(index)}
//                                     className="h-6 w-6 p-0"
//                                   >
//                                     <X className="h-3 w-3" />
//                                   </Button>
//                                 </div>
//                               </div>
//                               {index === primaryImageIndex && (
//                                 <Badge className="absolute top-1 left-1 text-xs">
//                                   Primary
//                                 </Badge>
//                               )}
//                             </div>
//                           ))}
//                         </div>
//                       )}
//                     </CardContent>
//                   </Card>
//                 </div>

//                 {/* Product Attributes */}
//                 <Card>
//                   <CardHeader>
//                     <CardTitle className="flex items-center gap-2 text-lg">
//                       <Package className="h-4 w-4 text-orange-600" />
//                       Product Attributes
//                     </CardTitle>
//                   </CardHeader>
//                   <CardContent className="space-y-6">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                       {/* Colors */}
//                       <div className="space-y-4">
//                         <h3 className="font-medium text-gray-800">Colors</h3>
//                         <div className="flex gap-2">
//                           <Input
//                             value={colorInput}
//                             onChange={(e) => setColorInput(e.target.value)}
//                             placeholder="Enter color name"
//                             onKeyPress={(e) =>
//                               e.key === "Enter" &&
//                               (e.preventDefault(), addColor())
//                             }
//                           />
//                           <Button
//                             type="button"
//                             onClick={addColor}
//                             variant="outline"
//                             disabled={!colorInput.trim()}
//                           >
//                             <Plus className="h-4 w-4" />
//                           </Button>
//                         </div>
//                         {formData.attributes.color.length > 0 && (
//                           <div className="flex flex-wrap gap-2">
//                             {formData.attributes.color.map((color, index) => (
//                               <Badge
//                                 key={index}
//                                 variant="secondary"
//                                 className="flex items-center gap-1"
//                               >
//                                 {color.colorOption}
//                                 <Button
//                                   type="button"
//                                   variant="ghost"
//                                   size="sm"
//                                   className="h-4 w-4 p-0 text-red-500 hover:text-red-700"
//                                   onClick={() => removeColor(index)}
//                                 >
//                                   <X className="h-3 w-3" />
//                                 </Button>
//                               </Badge>
//                             ))}
//                           </div>
//                         )}
//                       </div>

//                       {/* Sizes */}
//                       <div className="space-y-4">
//                         <h3 className="font-medium text-gray-800">Sizes</h3>
//                         <div className="flex gap-2">
//                           <Input
//                             value={sizeInput}
//                             onChange={(e) => setSizeInput(e.target.value)}
//                             placeholder="Enter size (e.g., XL, 42)"
//                             onKeyPress={(e) =>
//                               e.key === "Enter" &&
//                               (e.preventDefault(), addSize())
//                             }
//                           />
//                           <Button
//                             type="button"
//                             onClick={addSize}
//                             variant="outline"
//                             disabled={!sizeInput.trim()}
//                           >
//                             <Plus className="h-4 w-4" />
//                           </Button>
//                         </div>
//                         {formData.attributes.size.length > 0 && (
//                           <div className="flex flex-wrap gap-2">
//                             {formData.attributes.size.map((size, index) => (
//                               <Badge
//                                 key={index}
//                                 variant="secondary"
//                                 className="flex items-center gap-1"
//                               >
//                                 {size.sizeOption}
//                                 <Button
//                                   type="button"
//                                   variant="ghost"
//                                   size="sm"
//                                   className="h-4 w-4 p-0 text-red-500 hover:text-red-700"
//                                   onClick={() => removeSize(index)}
//                                 >
//                                   <X className="h-3 w-3" />
//                                 </Button>
//                               </Badge>
//                             ))}
//                           </div>
//                         )}
//                       </div>
//                     </div>

//                     {/* Tags */}
//                     <div className="space-y-4">
//                       <h3 className="font-medium text-gray-800">Tags</h3>
//                       <div className="flex gap-2">
//                         <Input
//                           value={tagInput}
//                           onChange={(e) => setTagInput(e.target.value)}
//                           placeholder="Enter tag"
//                           onKeyPress={(e) =>
//                             e.key === "Enter" && (e.preventDefault(), addTag())
//                           }
//                         />
//                         <Button
//                           type="button"
//                           onClick={addTag}
//                           variant="outline"
//                           disabled={!tagInput.trim()}
//                         >
//                           <Plus className="h-4 w-4" />
//                         </Button>
//                       </div>
//                       {formData.tags.length > 0 && (
//                         <div className="flex flex-wrap gap-2">
//                           {formData.tags.map((tag, index) => (
//                             <Badge
//                               key={index}
//                               variant="outline"
//                               className="flex items-center gap-1"
//                             >
//                               {tag}
//                               <Button
//                                 type="button"
//                                 variant="ghost"
//                                 size="sm"
//                                 className="h-4 w-4 p-0 text-red-500 hover:text-red-700"
//                                 onClick={() => removeTag(index)}
//                               >
//                                 <X className="h-3 w-3" />
//                               </Button>
//                             </Badge>
//                           ))}
//                         </div>
//                       )}
//                     </div>
//                   </CardContent>
//                 </Card>
//               </div>
//             </ScrollArea>
//           </div>

//           <div className="flex justify-end gap-3 pt-4 border-t flex-shrink-0">
//             <Button
//               type="button"
//               variant="outline"
//               onClick={() => onOpenChange(false)}
//               disabled={isUploading}
//             >
//               Cancel
//             </Button>
//             <Button
//               type="submit"
//               disabled={isUploading}
//               className="min-w-[140px] bg-blue-600 hover:bg-blue-700"
//             >
//               {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//               {isUploading ? "Adding Product..." : "Add Product"}
//             </Button>
//           </div>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// }
