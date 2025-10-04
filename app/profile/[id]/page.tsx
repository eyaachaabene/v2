"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  MapPin, 
  Mail,
  Phone,
  Calendar,
  Loader2,
  Settings,
  Edit,
  Camera,
  Package,
  Briefcase,
  User,
  Award
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DashboardNav } from '@/components/dashboard-nav';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

interface UserProfile {
  _id: string;
  email?: string;
  profile: {
    firstName: string;
    lastName: string;
    phone?: string;
    avatar?: string;
    location: {
      address?: string;
      city?: string;
      governorate?: string;
      coordinates?: {
        longitude: number;
        latitude: number;
      };
    };
    dateOfBirth?: string;
    gender?: string;
    languages?: string[];
    interests?: string[];
  };
  socialProfile?: {
    bio?: string;
    website?: string;
    socialLinks?: any;
    joinDate?: string;
    profileViews?: number;
    isVerified?: boolean;
  };
  socialStats?: {
    followers: number;
    following: number;
    posts: number;
    connections: number;
  };
  role: 'farmer' | 'supplier' | 'buyer';
  connectionStatus?: string;
  isFollowing?: boolean;
  isFollowed?: boolean;
  mutualConnections?: number;
  canViewProfile?: boolean;
  canViewPosts?: boolean;
  canViewContactInfo?: boolean;
  createdAt?: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  unit: string;
  category: string;
  image?: string;
  farmerId: string;
}

interface Resource {
  _id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  unit: string;
  category: string;
  image?: string;
  supplierId: string;
}

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const { user: currentUser } = useAuth();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [userProducts, setUserProducts] = useState<Product[]>([]);
  const [userResources, setUserResources] = useState<Resource[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);

  const isOwnProfile = currentUser?._id === userId;

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  useEffect(() => {
    if (profile && (activeTab === 'products' || isOwnProfile)) {
      fetchUserItems();
    }
  }, [profile, activeTab, isOwnProfile]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      
      const data = await response.json();
      console.log('API Response:', data); // Debug log
      
      if (data.success && data.profile) {
        setProfile(data.profile);
        setError(null);
      } else {
        throw new Error(data.error || 'Profile not found');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError(error instanceof Error ? error.message : 'Failed to load profile');
      toast.error(error instanceof Error ? error.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserItems = async () => {
    if (!profile) return;
    
    try {
      setLoadingItems(true);
      
      if (profile.role === 'farmer') {
        const response = await fetch(`/api/products?farmerId=${userId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setUserProducts(data.products || []);
        }
      } else if (profile.role === 'supplier') {
        const response = await fetch(`/api/resources?supplierId=${userId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setUserResources(data.resources || []);
        }
      }
    } catch (error) {
      console.error('Error fetching user items:', error);
    } finally {
      setLoadingItems(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardNav />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardNav />
        <div className="flex items-center justify-center py-20">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <h2 className="text-lg font-semibold mb-2">Profile Not Found</h2>
              <p className="text-muted-foreground">{error || 'This profile is not available.'}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const fullName = `${profile.profile?.firstName || ''} ${profile.profile?.lastName || ''}`.trim() || 'Unknown User';
  const location = profile.profile?.location ? 
    `${profile.profile.location.city || ''}, ${profile.profile.location.governorate || ''}`.replace(/^,\s*|,\s*$/g, '') : 
    '';
  const joinDate = new Date(profile.socialProfile?.joinDate || Date.now()).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long' 
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />
      
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Profile Header */}
        <Card className="mb-6">
          <div className="relative h-48 bg-gradient-to-r from-green-400 to-blue-500 rounded-t-lg">
            <div className="absolute inset-0 bg-black/20 rounded-t-lg" />
          </div>
          
          <CardContent className="relative">
            {/* Profile Picture */}
            <div className="absolute -top-16 left-6">
              <Avatar className="h-32 w-32 border-4 border-background">
                <AvatarImage src={profile.profile?.avatar} alt={fullName} />
                <AvatarFallback className="text-2xl">
                  {profile.profile?.firstName?.[0] || 'U'}{profile.profile?.lastName?.[0] || 'N'}
                </AvatarFallback>
              </Avatar>
              {isOwnProfile && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="absolute bottom-0 right-0 rounded-full w-10 h-10 p-0"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="pt-20 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                {/* Profile Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-2xl font-bold">{fullName}</h1>
                    <Badge variant="secondary" className="capitalize">
                      {profile.role}
                    </Badge>
                  </div>

                  {profile.socialProfile?.bio && (
                    <p className="text-muted-foreground mb-3">{profile.socialProfile.bio}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    {location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {location}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Joined {joinDate}
                    </div>

                    {isOwnProfile && profile.profile?.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {profile.profile.phone}
                      </div>
                    )}

                    {isOwnProfile && (
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {profile.email}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                {isOwnProfile && (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => router.push('/profile/edit')}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button variant="outline" size="icon">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">
              {profile.role === 'farmer' ? 'My Products' : profile.role === 'supplier' ? 'My Resources' : 'Items'}
            </TabsTrigger>
            <TabsTrigger value="details">Profile Details</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Profile Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Role</span>
                      <Badge variant="outline" className="capitalize">{profile.role}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Items Listed</span>
                      <span className="font-semibold">
                        {profile.role === 'farmer' ? userProducts.length : userResources.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Member Since</span>
                      <span className="font-semibold">{joinDate}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {isOwnProfile && (
                      <>
                        <div className="flex items-center gap-3">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span>{profile.email}</span>
                        </div>
                        {profile.profile.phone && (
                          <div className="flex items-center gap-3">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <span>{profile.profile.phone}</span>
                          </div>
                        )}
                      </>
                    )}
                    {location && (
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{location}</span>
                      </div>
                    )}
                    {(!isOwnProfile && !location && !profile.profile.phone) && (
                      <p className="text-muted-foreground">Contact information is private</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  {profile.role === 'farmer' ? 'Products' : 'Resources'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingItems ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(profile.role === 'farmer' ? userProducts : userResources).map((item: any) => (
                      <Card key={item._id} className="overflow-hidden">
                        {item.image && (
                          <div className="aspect-square relative">
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <CardContent className="p-4">
                          <h3 className="font-semibold mb-2">{item.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {item.description}
                          </p>
                          <div className="flex justify-between items-center">
                            <Badge variant="outline">{item.category}</Badge>
                            <span className="font-semibold">
                              {item.price} {item.currency}/{item.unit}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {(profile.role === 'farmer' ? userProducts : userResources).length === 0 && (
                      <div className="col-span-full text-center py-8">
                        <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          No {profile.role === 'farmer' ? 'products' : 'resources'} listed yet
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Profile Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                      <p className="mt-1">{fullName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Role</label>
                      <p className="mt-1 capitalize">{profile.role}</p>
                    </div>
                    {isOwnProfile && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                        <p className="mt-1">{profile.email}</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    {location && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Location</label>
                        <p className="mt-1">{location}</p>
                      </div>
                    )}
                    {isOwnProfile && profile.profile.phone && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Phone</label>
                        <p className="mt-1">{profile.profile.phone}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Joined</label>
                      <p className="mt-1">{profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Recently'}</p>
                    </div>
                  </div>
                </div>
                
                {profile.socialProfile?.bio && (
                  <div className="mt-6">
                    <label className="text-sm font-medium text-muted-foreground">Biography</label>
                    <p className="mt-1 text-sm">{profile.socialProfile.bio}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}