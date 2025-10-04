"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Edit, Trash2, Eye, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import { useUserResources } from '@/hooks/use-user-resources'
import { EditResourceForm } from './edit-resource-form'

interface Resource {
  _id: string
  name: string
  description: string
  category: string
  type: string
  images: string[]
  pricing: {
    price: number
    unit: string
    currency: string
    minimumOrder: number
    bulkDiscounts?: { quantity: number; discountPercentage: number }[]
  }
  specifications: {
    brand?: string
    model?: string
    manufacturer?: string
    weight?: number
    dimensions?: {
      length: number
      width: number
      height: number
      unit: string
    }
    activeIngredients?: string[]
    composition?: any
    applicationMethod?: string
    safetyPeriod?: string
    certifications?: string[]
  }
  availability: {
    status: string
    quantity: number
    leadTime: string
    shippingInfo: {
      methods: string[]
      costs: Record<string, number>
    }
  }
  tags: string[]
  supplierId: string
  createdAt: string
  updatedAt?: string
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'available':
      return <Badge variant="default" className="bg-green-500">Disponible</Badge>
    case 'out_of_stock':
      return <Badge variant="destructive">En rupture</Badge>
    case 'discontinued':
      return <Badge variant="secondary">Arrêté</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

const getAvailabilityStatus = (availability: Resource['availability']) => {
  switch (availability.status) {
    case 'available':
      if (availability.quantity === 0) {
        return <Badge variant="destructive">En rupture</Badge>
      }
      if (availability.quantity < 10) {
        return <Badge variant="secondary">Stock faible</Badge>
      }
      return <Badge variant="default" className="bg-green-500">Disponible</Badge>
    case 'out_of_stock':
      return <Badge variant="destructive">En rupture</Badge>
    case 'pre_order':
      return <Badge variant="secondary">Pré-commande</Badge>
    default:
      return <Badge variant="outline">{availability.status}</Badge>
  }
}

export function UserResourcesList() {
  const { resources, loading, error, updateResource, deleteResource } = useUserResources()
  const [editingResource, setEditingResource] = useState<Resource | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const handleEdit = (resource: Resource) => {
    setEditingResource(resource)
    setIsEditDialogOpen(true)
  }

  const handleUpdate = async (id: string, data: Partial<Resource>) => {
    try {
      await updateResource(id, data)
      return true
    } catch (error) {
      console.error('Error updating resource:', error)
      toast.error('Erreur lors de la mise à jour de la ressource')
      return false
    }
  }

  const handleDelete = async (resource: Resource) => {
    try {
      await deleteResource(resource._id)
      toast.success('Ressource supprimée avec succès')
    } catch (error) {
      console.error('Error deleting resource:', error)
      toast.error('Erreur lors de la suppression de la ressource')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Chargement de vos ressources...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500">Erreur: {error}</div>
      </div>
    )
  }

  if (resources.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-4">Aucune ressource trouvée</div>
        <p className="text-gray-400">Vous n'avez pas encore créé de ressources.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Mes ressources ({resources.length})</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {resources.map((resource) => (
          <Card key={resource._id} className="overflow-hidden">
            <div className="relative">
              {resource.images && resource.images.length > 0 ? (
                <img
                  src={resource.images[0]}
                  alt={resource.name}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-gray-400" />
                </div>
              )}
              <div className="absolute top-2 right-2">
                {getStatusBadge(resource.availability.status)}
              </div>
            </div>

            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg line-clamp-2">{resource.name}</CardTitle>
              </div>
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline" className="text-xs">{resource.category}</Badge>
                <Badge variant="outline" className="text-xs">{resource.type}</Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600 line-clamp-2">
                {resource.description}
              </p>

              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold text-lg">
                    {resource.pricing?.price} {resource.pricing?.currency}
                  </div>
                  <div className="text-sm text-gray-500">
                    par {resource.pricing?.unit}
                  </div>
                </div>
                <div className="text-right">
                  {getAvailabilityStatus(resource.availability)}
                  <div className="text-sm text-gray-500 mt-1">
                    Qty: {resource.availability?.quantity}
                  </div>
                </div>
              </div>

              {resource.tags && resource.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {resource.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {resource.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{resource.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              <div className="flex justify-between items-center pt-3 border-t">
                <div className="text-xs text-gray-500">
                  Créé le {new Date(resource.createdAt).toLocaleDateString('fr-FR')}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(resource)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                        <AlertDialogDescription>
                          Êtes-vous sûr de vouloir supprimer la ressource "{resource.name}" ? 
                          Cette action est irréversible.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(resource)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {editingResource && (
        <EditResourceForm
          resource={editingResource}
          open={isEditDialogOpen}
          onOpenChange={(open) => {
            setIsEditDialogOpen(open)
            if (!open) {
              setEditingResource(null)
            }
          }}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  )
}