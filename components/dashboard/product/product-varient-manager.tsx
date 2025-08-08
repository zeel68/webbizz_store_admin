// "use client"

// import { useState, useEffect } from "react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Separator } from "@/components/ui/separator"
// import { Plus, Trash2, Edit, Save, X } from 'lucide-react'
// import { formatCurrency } from "@/lib/utils"
// import type { iProductVariant } from "@/models/product.model"

// interface ProductVariantManagerProps {
//     variants: Omit<iProductVariant, '_id' | 'product_id'>[]
//     onVariantsChange: (variants: Omit<iProductVariant, '_id' | 'product_id'>[]) => void
//     basePrice: number
//     colorOptions: Array<{ colorOption: string; isSelected: boolean }>
//     sizeOptions: Array<{ sizeOption: number; isSelected: boolean }>
// }

// export function ProductVariantManager({
//     variants,
//     onVariantsChange,
//     basePrice,
//     colorOptions,
//     sizeOptions
// }: ProductVariantManagerProps) {
//     const [editingIndex, setEditingIndex] = useState<number | null>(null)
//     const [newVariant, setNewVariant] = useState<Omit<iProductVariant, '_id' | 'product_id'>>({
//         attributes: {},
//         price: basePrice,
//         stock: 0
//     })

//     // Generate all possible combinations
//     const generateVariantCombinations = () => {
//         const combinations: Array<Record<string, string>> = []

//         if (colorOptions.length === 0 && sizeOptions.length === 0) {
//             return []
//         }

//         if (colorOptions.length > 0 && sizeOptions.length > 0) {
//             // Both color and size
//             colorOptions.forEach(color => {
//                 sizeOptions.forEach(size => {
//                     combinations.push({
//                         color: color.colorOption,
//                         size: size.sizeOption.toString()
//                     })
//                 })
//             })
//         } else if (colorOptions.length > 0) {
//             // Only colors
//             colorOptions.forEach(color => {
//                 combinations.push({
//                     color: color.colorOption
//                 })
//             })
//         } else if (sizeOptions.length > 0) {
//             // Only sizes
//             sizeOptions.forEach(size => {
//                 combinations.push({
//                     size: size.sizeOption.toString()
//                 })
//             })
//         }

//         return combinations
//     }

//     const generateAllVariants = () => {
//         const combinations = generateVariantCombinations()
//         const newVariants = combinations.map(attributes => ({
//             attributes,
//             price: basePrice,
//             stock: 0
//         }))

//         onVariantsChange(newVariants)
//     }

//     const addVariant = () => {
//         if (Object.keys(newVariant.attributes).length > 0) {
//             onVariantsChange([...variants, newVariant])
//             setNewVariant({
//                 attributes: {},
//                 price: basePrice,
//                 stock: 0
//             })
//         }
//     }

//     const updateVariant = (index: number, updatedVariant: Omit<iProductVariant, '_id' | 'product_id'>) => {
//         const updatedVariants = variants.map((variant, i) =>
//             i === index ? updatedVariant : variant
//         )
//         onVariantsChange(updatedVariants)
//         setEditingIndex(null)
//     }

//     const removeVariant = (index: number) => {
//         const updatedVariants = variants.filter((_, i) => i !== index)
//         onVariantsChange(updatedVariants)
//     }

//     const getVariantDisplayName = (attributes: Record<string, string>) => {
//         return Object.entries(attributes)
//             .map(([key, value]) => `${key}: ${value}`)
//             .join(', ')
//     }

//     return (
//         <div className="space-y-6">
//             {/* Auto-generate variants */}
//             {(colorOptions.length > 0 || sizeOptions.length > 0) && (
//                 <div className="p-4 bg-blue-50 rounded-lg">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <h4 className="font-medium">Auto-generate Variants</h4>
//                             <p className="text-sm text-muted-foreground">
//                                 Generate variants for all combinations of selected colors and sizes
//                             </p>
//                         </div>
//                         <Button onClick={generateAllVariants} variant="outline">
//                             <Plus className="h-4 w-4 mr-2" />
//                             Generate All
//                         </Button>
//                     </div>
//                 </div>
//             )}

//             {/* Existing variants */}
//             {variants.length > 0 && (
//                 <div className="space-y-4">
//                     <h4 className="font-medium">Product Variants ({variants.length})</h4>
//                     {variants.map((variant, index) => (
//                         <Card key={index} className="border-l-4 border-l-blue-500">
//                             <CardContent className="pt-4">
//                                 {editingIndex === index ? (
//                                     <EditVariantForm
//                                         variant={variant}
//                                         onSave={(updatedVariant) => updateVariant(index, updatedVariant)}
//                                         onCancel={() => setEditingIndex(null)}
//                                         colorOptions={colorOptions}
//                                         sizeOptions={sizeOptions}
//                                     />
//                                 ) : (
//                                     <div className="flex items-center justify-between">
//                                         <div className="space-y-2">
//                                             <div className="flex items-center gap-2">
//                                                 {Object.entries(variant.attributes).map(([key, value]) => (
//                                                     <Badge key={key} variant="secondary">
//                                                         {key}: {value as any}
//                                                     </Badge>
//                                                 ))}
//                                             </div>
//                                             <div className="flex items-center gap-4 text-sm">
//                                                 <span className="font-medium">
//                                                     Price: {formatCurrency(variant.price || basePrice)}
//                                                 </span>
//                                                 <span>Stock: {variant.stock}</span>
//                                                 {variant.price !== basePrice && (
//                                                     <span className="text-muted-foreground">
//                                                         ({variant.price && variant.price > basePrice ? '+' : ''}{formatCurrency((variant.price || basePrice) - basePrice)} from base)
//                                                     </span>
//                                                 )}
//                                             </div>
//                                         </div>
//                                         <div className="flex items-center gap-2">
//                                             <Button
//                                                 variant="ghost"
//                                                 size="sm"
//                                                 onClick={() => setEditingIndex(index)}
//                                             >
//                                                 <Edit className="h-4 w-4" />
//                                             </Button>
//                                             <Button
//                                                 variant="ghost"
//                                                 size="sm"
//                                                 onClick={() => removeVariant(index)}
//                                                 className="text-destructive hover:text-destructive"
//                                             >
//                                                 <Trash2 className="h-4 w-4" />
//                                             </Button>
//                                         </div>
//                                     </div>
//                                 )}
//                             </CardContent>
//                         </Card>
//                     ))}
//                 </div>
//             )}

//             {/* Add new variant manually */}
//             <Card className="border-dashed">
//                 <CardHeader>
//                     <CardTitle className="text-lg">Add Custom Variant</CardTitle>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                     <div className="grid grid-cols-2 gap-4">
//                         {/* Color selection */}
//                         {colorOptions.length > 0 && (
//                             <div className="space-y-2">
//                                 <Label>Color</Label>
//                                 <select
//                                     className="w-full p-2 border rounded"
//                                     value={newVariant.attributes.color || ''}
//                                     onChange={(e) => setNewVariant(prev => ({
//                                         ...prev,
//                                         attributes: { ...prev.attributes, color: e.target.value }
//                                     }))}
//                                 >
//                                     <option value="">Select color</option>
//                                     {colorOptions.map(color => (
//                                         <option key={color.colorOption} value={color.colorOption}>
//                                             {color.colorOption}
//                                         </option>
//                                     ))}
//                                 </select>
//                             </div>
//                         )}

//                         {/* Size selection */}
//                         {sizeOptions.length > 0 && (
//                             <div className="space-y-2">
//                                 <Label>Size</Label>
//                                 <select
//                                     className="w-full p-2 border rounded"
//                                     value={newVariant.attributes.size || ''}
//                                     onChange={(e) => setNewVariant(prev => ({
//                                         ...prev,
//                                         attributes: { ...prev.attributes, size: e.target.value }
//                                     }))}
//                                 >
//                                     <option value="">Select size</option>
//                                     {sizeOptions.map(size => (
//                                         <option key={size.sizeOption} value={size.sizeOption.toString()}>
//                                             {size.sizeOption}
//                                         </option>
//                                     ))}
//                                 </select>
//                             </div>
//                         )}
//                     </div>

//                     <div className="grid grid-cols-2 gap-4">
//                         <div className="space-y-2">
//                             <Label>Price</Label>
//                             <Input
//                                 type="number"
//                                 step="0.01"
//                                 min="0"
//                                 value={newVariant.price}
//                                 onChange={(e) => setNewVariant(prev => ({
//                                     ...prev,
//                                     price: parseFloat(e.target.value) || 0
//                                 }))}
//                                 placeholder={basePrice.toString()}
//                             />
//                         </div>
//                         <div className="space-y-2">
//                             <Label>Stock</Label>
//                             <Input
//                                 type="number"
//                                 min="0"
//                                 value={newVariant.stock}
//                                 onChange={(e) => setNewVariant(prev => ({
//                                     ...prev,
//                                     stock: parseInt(e.target.value) || 0
//                                 }))}
//                                 placeholder="0"
//                             />
//                         </div>
//                     </div>

//                     <Button
//                         onClick={addVariant}
//                         disabled={Object.keys(newVariant.attributes).length === 0}
//                         className="w-full"
//                     >
//                         <Plus className="h-4 w-4 mr-2" />
//                         Add Variant
//                     </Button>
//                 </CardContent>
//             </Card>
//         </div>
//     )
// }

// interface EditVariantFormProps {
//     variant: Omit<iProductVariant, '_id' | 'product_id'>
//     onSave: (variant: Omit<iProductVariant, '_id' | 'product_id'>) => void
//     onCancel: () => void
//     colorOptions: Array<{ colorOption: string; isSelected: boolean }>
//     sizeOptions: Array<{ sizeOption: number; isSelected: boolean }>
// }

// function EditVariantForm({ variant, onSave, onCancel, colorOptions, sizeOptions }: EditVariantFormProps) {
//     const [editedVariant, setEditedVariant] = useState(variant)

//     const handleSave = () => {
//         onSave(editedVariant)
//     }

//     return (
//         <div className="space-y-4">
//             <div className="grid grid-cols-2 gap-4">
//                 {/* Color selection */}
//                 {colorOptions.length > 0 && (
//                     <div className="space-y-2">
//                         <Label>Color</Label>
//                         <select
//                             className="w-full p-2 border rounded"
//                             value={editedVariant.attributes.color || ''}
//                             onChange={(e) => setEditedVariant(prev => ({
//                                 ...prev,
//                                 attributes: { ...prev.attributes, color: e.target.value }
//                             }))}
//                         >
//                             <option value="">Select color</option>
//                             {colorOptions.map(color => (
//                                 <option key={color.colorOption} value={color.colorOption}>
//                                     {color.colorOption}
//                                 </option>
//                             ))}
//                         </select>
//                     </div>
//                 )}

//                 {/* Size selection */}
//                 {sizeOptions.length > 0 && (
//                     <div className="space-y-2">
//                         <Label>Size</Label>
//                         <select
//                             className="w-full p-2 border rounded"
//                             value={editedVariant.attributes.size || ''}
//                             onChange={(e) => setEditedVariant(prev => ({
//                                 ...prev,
//                                 attributes: { ...prev.attributes, size: e.target.value }
//                             }))}
//                         >
//                             <option value="">Select size</option>
//                             {sizeOptions.map(size => (
//                                 <option key={size.sizeOption} value={size.sizeOption.toString()}>
//                                     {size.sizeOption}
//                                 </option>
//                             ))}
//                         </select>
//                     </div>
//                 )}
//             </div>

//             <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                     <Label>Price</Label>
//                     <Input
//                         type="number"
//                         step="0.01"
//                         min="0"
//                         value={editedVariant.price}
//                         onChange={(e) => setEditedVariant(prev => ({
//                             ...prev,
//                             price: parseFloat(e.target.value) || 0
//                         }))}
//                     />
//                 </div>
//                 <div className="space-y-2">
//                     <Label>Stock</Label>
//                     <Input
//                         type="number"
//                         min="0"
//                         value={editedVariant.stock}
//                         onChange={(e) => setEditedVariant(prev => ({
//                             ...prev,
//                             stock: parseInt(e.target.value) || 0
//                         }))}
//                     />
//                 </div>
//             </div>

//             <div className="flex items-center gap-2">
//                 <Button onClick={handleSave} size="sm">
//                     <Save className="h-4 w-4 mr-2" />
//                     Save
//                 </Button>
//                 <Button onClick={onCancel} variant="outline" size="sm">
//                     <X className="h-4 w-4 mr-2" />
//                     Cancel
//                 </Button>
//             </div>
//         </div>
//     )
// }
