"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AddResourceForm } from "@/components/add-resource-form"
import { MyResourcesList } from "@/components/my-resources-list"
import { Package, Plus, List } from "lucide-react"
import { useUserRole } from "@/hooks/use-user-role"

export default function MyResourcesPage() {
  const { isSupplier, user } = useUserRole()

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isSupplier) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Package className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">
            Only suppliers can manage resources. Please contact support if you need to become a supplier.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Resource Management</h1>
        <p className="text-muted-foreground">
          Manage your agricultural resources and equipment listings
        </p>
      </div>

      <Tabs defaultValue="list" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            My Resources
          </TabsTrigger>
          <TabsTrigger value="add" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Resource
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          <MyResourcesList />
        </TabsContent>

        <TabsContent value="add" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add New Resource
              </CardTitle>
              <CardDescription>
                Create a new resource listing to share with the agricultural community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <AddResourceForm />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}