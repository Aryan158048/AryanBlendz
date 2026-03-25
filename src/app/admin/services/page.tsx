'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Clock, DollarSign, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SERVICES, SERVICE_CATEGORIES } from '@/lib/constants'
import { formatCurrency, getDurationLabel } from '@/lib/utils'
import type { Service, ServiceCategory } from '@/types'

const serviceFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Please select a category'),
  price: z.number().min(1, 'Price must be at least $1'),
  duration: z.number().min(5, 'Duration must be at least 5 minutes'),
  is_active: z.boolean(),
})
type ServiceFormValues = z.infer<typeof serviceFormSchema>

const categoryColors: Record<string, string> = {
  haircut: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  beard:   'bg-purple-500/15 text-purple-400 border-purple-500/30',
  combo:   'bg-gold-500/15 text-gold-400 border-gold-500/30',
  kids:    'bg-green-500/15 text-green-400 border-green-500/30',
  premium: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  other:   'bg-gray-500/15 text-gray-400 border-gray-500/30',
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>(SERVICES)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: { is_active: true, category: '' },
  })

  const watchCategory = watch('category')
  const watchIsActive = watch('is_active')

  const openAdd = () => {
    setEditingService(null)
    reset({ name: '', description: '', category: '', price: 0, duration: 30, is_active: true })
    setDialogOpen(true)
  }

  const openEdit = (service: Service) => {
    setEditingService(service)
    reset({
      name: service.name,
      description: service.description,
      category: service.category,
      price: service.price,
      duration: service.duration,
      is_active: service.is_active,
    })
    setDialogOpen(true)
  }

  const onSubmit = async (data: ServiceFormValues) => {
    setIsSaving(true)
    await new Promise((r) => setTimeout(r, 800))

    if (editingService) {
      setServices((prev) =>
        prev.map((s) =>
          s.id === editingService.id
            ? { ...s, ...data, category: data.category as ServiceCategory }
            : s,
        ),
      )
      toast.success('Service updated successfully')
    } else {
      const newService: Service = {
        id: `svc_${Date.now()}`,
        ...data,
        category: data.category as ServiceCategory,
        display_order: services.length + 1,
        image_url: undefined,
      }
      setServices((prev) => [...prev, newService])
      toast.success('Service added successfully')
    }

    setIsSaving(false)
    setDialogOpen(false)
  }

  const toggleActive = (id: string) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, is_active: !s.is_active } : s)),
    )
  }

  const deleteService = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id))
    toast.success('Service deleted')
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-display text-2xl font-bold text-white">Services</h2>
          <p className="text-white/40 text-sm mt-1">
            {services.filter((s) => s.is_active).length} active · {services.length} total
          </p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="w-4 h-4" />
          Add Service
        </Button>
      </div>

      {/* Service grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {services.map((service) => (
          <div
            key={service.id}
            className={`glass rounded-2xl p-5 border transition-colors ${
              service.is_active ? 'gold-border hover:border-gold-400/40' : 'border-white/8 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-base font-bold text-white truncate mb-1.5">
                  {service.name}
                </h3>
                <Badge
                  className={`text-xs px-2 py-0.5 border ${
                    categoryColors[service.category] ?? categoryColors.other
                  }`}
                >
                  {service.category.charAt(0).toUpperCase() + service.category.slice(1)}
                </Badge>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Switch
                  checked={service.is_active}
                  onCheckedChange={() => toggleActive(service.id)}
                  className="data-[state=checked]:bg-gold-500"
                />
              </div>
            </div>

            <p className="text-white/40 text-xs leading-relaxed mb-4 line-clamp-2">
              {service.description}
            </p>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-gold-400" />
                <span className="text-gold-400 font-bold">{formatCurrency(service.price)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-white/40" />
                <span className="text-white/50 text-sm">{getDurationLabel(service.duration)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-white/8">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 h-8 text-xs text-white/60 hover:text-white"
                onClick={() => openEdit(service)}
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 h-8 text-xs text-red-400/60 hover:text-red-400 hover:bg-red-500/10"
                onClick={() => deleteService(service.id)}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-charcoal-900 border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-white">
              {editingService ? 'Edit Service' : 'Add New Service'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white/70">Service Name</Label>
              <Input
                {...register('name')}
                placeholder="e.g. Classic Haircut"
                className="bg-charcoal-800 border-white/10 text-white placeholder:text-white/25 focus:border-gold-500/50"
              />
              {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-white/70">Description</Label>
              <Textarea
                {...register('description')}
                placeholder="Describe the service..."
                rows={3}
                className="bg-charcoal-800 border-white/10 text-white placeholder:text-white/25 focus:border-gold-500/50 resize-none"
              />
              {errors.description && <p className="text-red-400 text-xs">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white/70">Category</Label>
                <Select
                  value={watchCategory}
                  onValueChange={(v) => setValue('category', v)}
                >
                  <SelectTrigger className="bg-charcoal-800 border-white/10 text-white">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent className="bg-charcoal-900 border-white/10">
                    {SERVICE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-red-400 text-xs">{errors.category.message}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-white/70">Price ($)</Label>
                <Input
                  {...register('price')}
                  type="number"
                  placeholder="35"
                  min={1}
                  className="bg-charcoal-800 border-white/10 text-white placeholder:text-white/25 focus:border-gold-500/50"
                />
                {errors.price && <p className="text-red-400 text-xs">{errors.price.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white/70">Duration (minutes)</Label>
                <Input
                  {...register('duration')}
                  type="number"
                  placeholder="45"
                  min={5}
                  className="bg-charcoal-800 border-white/10 text-white placeholder:text-white/25 focus:border-gold-500/50"
                />
                {errors.duration && <p className="text-red-400 text-xs">{errors.duration.message}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-white/70">Active</Label>
                <div className="flex items-center gap-2 h-10">
                  <Switch
                    checked={watchIsActive}
                    onCheckedChange={(v) => setValue('is_active', v)}
                    className="data-[state=checked]:bg-gold-500"
                  />
                  <span className="text-white/50 text-sm">
                    {watchIsActive ? 'Visible' : 'Hidden'}
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setDialogOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : editingService ? (
                  'Save Changes'
                ) : (
                  'Add Service'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
