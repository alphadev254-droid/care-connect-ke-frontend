import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, Search, Clock, DollarSign, LogIn, MapPin, Award, User, Filter, ChevronDown, Calendar, Shield, X, Briefcase } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { BookingModal } from "@/components/booking/BookingModal";
import { RatingDisplay } from "@/components/RatingDisplay";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CLOUDINARY_IMAGES } from "@/config/images";

const PublicCaregivers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [selectedTA, setSelectedTA] = useState("all");
  const [selectedVillage, setSelectedVillage] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [bookingModal, setBookingModal] = useState({ open: false, caregiver: null });
  const [profileDialog, setProfileDialog] = useState<{ open: boolean; caregiver: any }>({ open: false, caregiver: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [appliedFilters, setAppliedFilters] = useState({
    search: '',
    specialty: 'all',
    region: 'all',
    district: 'all',
    traditionalAuthority: 'all',
    village: 'all'
  });
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const pageSize = 70;

  const { data: caregiversData, isLoading, isFetching } = useQuery({
    queryKey: ["public-caregivers", appliedFilters, currentPage],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        ...(appliedFilters.search && { search: appliedFilters.search }),
        ...(appliedFilters.specialty !== 'all' && { specialtyId: appliedFilters.specialty }),
        ...(appliedFilters.region !== 'all' && { region: appliedFilters.region }),
        ...(appliedFilters.district !== 'all' && { district: appliedFilters.district }),
        ...(appliedFilters.traditionalAuthority !== 'all' && { traditionalAuthority: appliedFilters.traditionalAuthority }),
        ...(appliedFilters.village !== 'all' && { village: appliedFilters.village })
      });
      const response = await api.get(`/public/caregivers?${params}`);
      return response.data || {};
    },
  });

  const { data: specialtiesData } = useQuery({
    queryKey: ["specialties"],
    queryFn: async () => {
      const response = await api.get("/public/specialties");
      return response.data.specialties || [];
    },
  });

  // Fetch location data from API endpoints
  const { data: regions } = useQuery({
    queryKey: ["regions-list"],
    queryFn: async () => {
      const response = await api.get('/locations/regions');
      return response.data.data || [];
    }
  });

  const { data: districts } = useQuery({
    queryKey: ["districts-list", selectedRegion],
    queryFn: async () => {
      if (selectedRegion === 'all') return [];
      const response = await api.get(`/locations/districts/${selectedRegion}`);
      return response.data.data || [];
    },
    enabled: selectedRegion !== 'all'
  });

  const { data: traditionalAuthorities } = useQuery({
    queryKey: ["ta-list", selectedRegion, selectedDistrict],
    queryFn: async () => {
      if (selectedDistrict === 'all') return [];
      const response = await api.get(`/locations/traditional-authorities/${selectedRegion}/${selectedDistrict}`);
      return response.data.data || [];
    },
    enabled: selectedDistrict !== 'all'
  });

  const { data: villages } = useQuery({
    queryKey: ["villages-list", selectedRegion, selectedDistrict, selectedTA],
    queryFn: async () => {
      if (selectedTA === 'all') return [];
      const response = await api.get(`/locations/villages/${selectedRegion}/${selectedDistrict}/${selectedTA}`);
      return response.data.data || [];
    },
    enabled: selectedTA !== 'all'
  });

  // Reset dependent filters when parent changes
  const handleRegionChange = (value: string) => {
    setSelectedRegion(value);
    setSelectedDistrict('all');
    setSelectedTA('all');
    setSelectedVillage('all');
  };

  const handleDistrictChange = (value: string) => {
    setSelectedDistrict(value);
    setSelectedTA('all');
    setSelectedVillage('all');
  };

  const handleTAChange = (value: string) => {
    setSelectedTA(value);
    setSelectedVillage('all');
  };

  const caregivers = Array.isArray(caregiversData?.caregivers) ? caregiversData.caregivers : [];
  const specialties = Array.isArray(specialtiesData) ? specialtiesData : [];
  const totalPages = caregiversData?.pagination?.totalPages || 1;
  const hasMore = currentPage < totalPages;

  const applyFilters = () => {
    setAppliedFilters({
      search: searchQuery,
      specialty: selectedSpecialty,
      region: selectedRegion,
      district: selectedDistrict,
      traditionalAuthority: selectedTA,
      village: selectedVillage
    });
    setCurrentPage(1);
  };

  const loadMore = () => {
    if (hasMore && !isFetching) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const filteredCaregivers = caregivers;

  const clearFilters = () => {
    setSelectedSpecialty("all");
    setSelectedRegion("all");
    setSelectedDistrict("all");
    setSelectedTA("all");
    setSelectedVillage("all");
    setSearchQuery("");
    setAppliedFilters({
      search: '',
      specialty: 'all',
      region: 'all',
      district: 'all',
      traditionalAuthority: 'all',
      village: 'all'
    });
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Find Verified Healthcare Caregivers Across Malawi | All Regions</title>
        <meta name="description" content="Browse verified healthcare professionals across all Malawi regions. Registered nurses, health surveillance assistants, and specialized caregivers available for home visits. Northern, Central, and Southern regions covered." />
        <meta name="keywords" content="find caregiver Malawi, registered nurses all regions, healthcare professionals nationwide, home care providers, verified caregivers, health surveillance assistants, nursing care" />
      </Helmet>
      <Header />
      
      {/* Hero Section */}
      <section 
        className="py-6 lg:py-8 relative bg-cover bg-no-repeat rounded-b-3xl overflow-hidden"
        style={{ 
          backgroundImage: `url(caregivers.png)`, 
          backgroundPosition: '0 45%',
          backgroundSize: 'cover'
        }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 items-center mb-6">
            <div className="text-center lg:text-left">
              <div className="flex justify-center lg:justify-start mb-4">
                <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center">
                  <Heart className="h-5 w-5 text-primary" />
                </div>
              </div>
              <h1 className="font-display text-2xl md:text-3xl font-bold mb-3 text-white">
                Our Verified Caregivers
              </h1>
              <p className="text-lg text-white/90 mb-6">
                Meet our team of qualified healthcare professionals ready to provide supportive 
                home care services. Our caregivers focus on assistance, monitoring, and support 
                to complement your physician's medical care.
              </p>
            </div>
            <div className="space-y-4">
              {/* Search and Filters */}
              <div className="flex gap-2">
                <Popover open={showFilters} onOpenChange={setShowFilters}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 h-9"
                    >
                      <Filter className="h-4 w-4" />
                      Filters
                      <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-4" align="end">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-xs font-semibold mb-2 block">Specialty</Label>
                        <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                          <SelectTrigger className="h-9 text-xs">
                            <SelectValue placeholder="All Specialties" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Specialties</SelectItem>
                            {specialties.map((specialty: any) => (
                              <SelectItem key={specialty.id} value={specialty.id.toString()}>
                                {specialty.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-xs font-semibold mb-2 block">Region</Label>
                        <Select value={selectedRegion} onValueChange={handleRegionChange}>
                          <SelectTrigger className="h-9 text-xs">
                            <SelectValue placeholder="All Regions" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Regions</SelectItem>
                            {regions?.map((region: string) => (
                              <SelectItem key={region} value={region}>
                                {region}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-xs font-semibold mb-2 block">District</Label>
                        <Select value={selectedDistrict} onValueChange={handleDistrictChange}>
                          <SelectTrigger className="h-9 text-xs">
                            <SelectValue placeholder="All Districts" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Districts</SelectItem>
                            {districts?.map((district: string) => (
                              <SelectItem key={district} value={district}>
                                {district}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-xs font-semibold mb-2 block">Traditional Authority</Label>
                        <Select value={selectedTA} onValueChange={handleTAChange}>
                          <SelectTrigger className="h-9 text-xs">
                            <SelectValue placeholder="All TAs" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All TAs</SelectItem>
                            {traditionalAuthorities?.map((ta: string) => (
                              <SelectItem key={ta} value={ta}>
                                {ta}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-xs font-semibold mb-2 block">Village</Label>
                        <Select value={selectedVillage} onValueChange={setSelectedVillage}>
                          <SelectTrigger className="h-9 text-xs">
                            <SelectValue placeholder="All Villages" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Villages</SelectItem>
                            {villages?.map((village: string) => (
                              <SelectItem key={village} value={village}>
                                {village}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          className="flex-1 h-9 text-xs"
                          onClick={() => {
                            applyFilters();
                            setShowFilters(false);
                          }}
                          disabled={isFetching}
                        >
                          Apply Filters
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-2 h-9 text-xs"
                          onClick={() => {
                            clearFilters();
                            setShowFilters(false);
                          }}
                        >
                          <X className="h-4 w-4" />
                          Clear
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                
                <Button
                  variant="default"
                  size="sm"
                  className="gap-2 h-9 px-4"
                  onClick={applyFilters}
                  disabled={isFetching}
                >
                  <Search className="h-4 w-4" />
                  Search
                </Button>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, specialty, or location..."
                  className="pl-10 h-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {filteredCaregivers.length} caregiver{filteredCaregivers.length !== 1 ? 's' : ''} found
              {currentPage > 1 && ` (Page ${currentPage})`}
            </p>
            {isFetching && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                Loading...
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="h-12 w-12 bg-muted rounded-full" />
                      <div className="flex-1">
                        <div className="h-4 bg-muted rounded mb-2" />
                        <div className="h-3 bg-muted rounded mb-1" />
                        <div className="h-5 bg-muted rounded w-16" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded" />
                      <div className="h-3 bg-muted rounded w-3/4" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredCaregivers.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No caregivers found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters to see more results
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Clear All Filters
              </Button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCaregivers.map((caregiver: any) => {
                const caregiverData = caregiver.Caregiver || {};
                const name = `${caregiver.firstName || ''} ${caregiver.lastName || ''}`.trim();
                const location = [
                  caregiverData.village,
                  caregiverData.traditionalAuthority,
                  caregiverData.district,
                  caregiverData.region
                ].filter(Boolean).join(', ') || 'Location not specified';

                return (
                  <Card key={caregiver.id} className="overflow-hidden border-t-2 border-primary/40 hover:shadow-md hover:border-primary/60 transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage 
                            src={caregiverData.profileImage} 
                            loading="lazy"
                            className="object-cover"
                          />
                          <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">
                            {name.charAt(0) || 'C'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-sm truncate">{name}</h3>
                            {caregiverData.verificationStatus === 'APPROVED' && (
                              <Shield className="h-3 w-3 text-success flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {caregiverData.qualifications || 'Healthcare Professional'}
                          </p>
                          <Badge
                            variant={
                              caregiverData.verificationStatus === 'APPROVED' ? 'default' :
                              caregiverData.verificationStatus === 'REJECTED' ? 'destructive' :
                              'secondary'
                            }
                            className="mt-1 text-xs h-5"
                          >
                            {caregiverData.verificationStatus === 'APPROVED' && 'Verified'}
                            {caregiverData.verificationStatus === 'PENDING' && 'Pending Verification'}
                            {caregiverData.verificationStatus === 'REJECTED' && 'Rejected'}
                            {!caregiverData.verificationStatus && 'Pending'}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-1.5 mb-3">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 flex-shrink-0" />
                          <span>{caregiverData.experience || '0'} years experience</span>
                        </div>
                        <div className="flex items-start gap-2 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3 flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{location}</span>
                        </div>
                        <RatingDisplay 
                          averageRating={caregiverData.averageRating}
                          totalRatings={caregiverData.totalRatings}
                          size="sm"
                        />
                      </div>

                      {/* Specialties */}
                      {caregiverData.Specialties && caregiverData.Specialties.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-1">
                          {caregiverData.Specialties.slice(0, 3).map((specialty: any) => (
                            <Badge key={specialty.id} variant="outline" className="text-xs">
                              {specialty.name}
                            </Badge>
                          ))}
                          {caregiverData.Specialties.length > 3 && (
                            <Badge variant="outline" className="text-xs text-muted-foreground">
                              +{caregiverData.Specialties.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}

                      <div className="flex gap-2 pt-3 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-8 text-xs"
                          onClick={() => setProfileDialog({ open: true, caregiver })}
                        >
                          View Profile
                        </Button>
                        {isAuthenticated ? (
                          <Button
                            size="sm"
                            className="flex-1 gap-1 h-8 text-xs"
                            onClick={() => setBookingModal({ open: true, caregiver })}
                          >
                            <Calendar className="h-3 w-3" />
                            Book Now
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 gap-1 h-8 text-xs"
                            onClick={() => navigate('/login')}
                          >
                            <Calendar className="h-3 w-3" />
                            Book Now
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
          
          {/* Load More Button */}
          {hasMore && filteredCaregivers.length > 0 && (
            <div className="flex justify-center mt-6">
              <Button
                variant="outline"
                onClick={loadMore}
                disabled={isFetching}
                className="gap-2"
              >
                {isFetching ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    Loading...
                  </>
                ) : (
                  'Load More Caregivers'
                )}
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-10 lg:py-12">
        <div className="container mx-auto px-4">
          <div className="border border-border rounded-sm px-10 py-10">
            <div className="bg-amber-50 border border-amber-200 rounded-sm p-4 mb-8">
              <h3 className="font-semibold text-sm text-amber-800 mb-1">Important Notice</h3>
              <p className="text-sm text-amber-700">
                Our caregivers provide supportive care services and assistance - not medical treatment. 
                All patients must have a physician for medical diagnosis, treatment, and prescriptions. 
                CareConnect complements your doctor's care with supportive home services.
              </p>
            </div>
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="font-display text-2xl font-bold mb-3">Ready to Get Started?</h2>
                <p className="text-base text-muted-foreground max-w-lg">
                  Join thousands of patients who trust CareConnect for their supportive healthcare needs.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 lg:justify-end">
                <Button size="lg" className="bg-primary text-white hover:bg-primary/90">
                  Find Your Caregiver
                </Button>
                <Button size="lg" variant="outline">Learn More</Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Profile Dialog */}
      {profileDialog.caregiver && (
        <Dialog open={profileDialog.open} onOpenChange={(open) => setProfileDialog({ open, caregiver: open ? profileDialog.caregiver : null })}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">Caregiver Profile</DialogTitle>
              <DialogDescription>
                Detailed information about this healthcare professional
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-start gap-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage 
                    src={profileDialog.caregiver.Caregiver?.profileImage} 
                    loading="lazy"
                    className="object-cover"
                  />
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                    {profileDialog.caregiver.firstName?.charAt(0)}{profileDialog.caregiver.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">
                    {profileDialog.caregiver.firstName} {profileDialog.caregiver.lastName}
                  </h3>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge
                      variant={
                        profileDialog.caregiver.Caregiver?.verificationStatus === 'APPROVED' ? 'default' :
                        profileDialog.caregiver.Caregiver?.verificationStatus === 'REJECTED' ? 'destructive' :
                        'secondary'
                      }
                      className="gap-1"
                    >
                      {profileDialog.caregiver.Caregiver?.verificationStatus === 'APPROVED' && (
                        <>
                          <Shield className="h-3 w-3" />
                          Verified Professional
                        </>
                      )}
                      {profileDialog.caregiver.Caregiver?.verificationStatus === 'PENDING' && 'Pending Verification'}
                      {profileDialog.caregiver.Caregiver?.verificationStatus === 'REJECTED' && 'Verification Rejected'}
                      {!profileDialog.caregiver.Caregiver?.verificationStatus && 'Pending Verification'}
                    </Badge>
                    {profileDialog.caregiver.Caregiver?.Specialties?.map((specialty: any) => (
                      <Badge key={specialty.id} variant="outline">
                        {specialty.name}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      {profileDialog.caregiver.Caregiver?.experience} years experience
                    </div>
                  </div>
                </div>
              </div>

              {/* Specialties */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Heart className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold">Specialties & Services</h4>
                  </div>
                  <div className="grid gap-3">
                    {profileDialog.caregiver.Caregiver?.Specialties?.map((specialty: any) => (
                      <div key={specialty.id} className="p-3 rounded-lg border bg-muted/30">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-sm">{specialty.name}</h5>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                          {specialty.description}
                        </p>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="flex items-center justify-between p-2 bg-background rounded">
                            <span className="text-muted-foreground">Session Fee:</span>
                            <span className="font-semibold text-primary">
                              MWK {specialty.sessionFee ? Number(specialty.sessionFee).toFixed(0) : '0'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-background rounded">
                            <span className="text-muted-foreground">Booking Fee:</span>
                            <span className="font-semibold text-secondary">
                              MWK {specialty.bookingFee ? Number(specialty.bookingFee).toFixed(0) : '0'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )) || (
                      <p className="text-sm text-muted-foreground">No specialties listed</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Bio */}
              {profileDialog.caregiver.Caregiver?.bio && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-3">
                      <User className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold">About</h4>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {profileDialog.caregiver.Caregiver.bio}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Qualifications */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold">Qualifications & Licensing</h4>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Verification Status</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant={
                            profileDialog.caregiver.Caregiver?.verificationStatus === 'APPROVED' ? 'default' :
                            profileDialog.caregiver.Caregiver?.verificationStatus === 'REJECTED' ? 'destructive' :
                            'secondary'
                          }
                        >
                          {profileDialog.caregiver.Caregiver?.verificationStatus === 'APPROVED' && (
                            <>
                              <Shield className="h-3 w-3 mr-1" />
                              Verified
                            </>
                          )}
                          {profileDialog.caregiver.Caregiver?.verificationStatus === 'PENDING' && 'Pending'}
                          {profileDialog.caregiver.Caregiver?.verificationStatus === 'REJECTED' && 'Rejected'}
                          {!profileDialog.caregiver.Caregiver?.verificationStatus && 'Pending'}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Qualifications</Label>
                      <p className="text-sm mt-1">{profileDialog.caregiver.Caregiver?.qualifications || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Licensing Institution</Label>
                      <p className="text-sm mt-1">{profileDialog.caregiver.Caregiver?.licensingInstitution || 'Not specified'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Location */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold">Service Location</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Region</Label>
                      <p className="text-sm mt-1 capitalize">{profileDialog.caregiver.Caregiver?.region || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">District</Label>
                      <p className="text-sm mt-1 uppercase">{profileDialog.caregiver.Caregiver?.district || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Traditional Authority</Label>
                      <p className="text-sm mt-1 uppercase">{profileDialog.caregiver.Caregiver?.traditionalAuthority || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Village</Label>
                      <p className="text-sm mt-1 uppercase">{profileDialog.caregiver.Caregiver?.village || 'Not specified'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Appointment Details */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold">Appointment Information</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Default Duration</Label>
                      <p className="text-sm mt-1">{profileDialog.caregiver.Caregiver?.appointmentDuration || 60} minutes</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Auto-Confirm</Label>
                      <p className="text-sm mt-1">
                        {profileDialog.caregiver.Caregiver?.autoConfirm ? 'Yes' : 'No'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                {isAuthenticated ? (
                  <Button
                    className="flex-1"
                    onClick={() => {
                      setProfileDialog({ open: false, caregiver: null });
                      setBookingModal({ open: true, caregiver: profileDialog.caregiver });
                    }}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Appointment
                  </Button>
                ) : (
                  <Button
                    className="flex-1"
                    onClick={() => {
                      setProfileDialog({ open: false, caregiver: null });
                      navigate('/login');
                    }}
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Login to Book
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setProfileDialog({ open: false, caregiver: null })}
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {bookingModal.caregiver && isAuthenticated && (
        <BookingModal
          open={bookingModal.open}
          onClose={() => setBookingModal({ open: false, caregiver: null })}
          caregiverId={bookingModal.caregiver.Caregiver?.id || bookingModal.caregiver.id}
          caregiverName={`${bookingModal.caregiver.firstName || ''} ${bookingModal.caregiver.lastName || ''}`.trim() || 'Caregiver'}
          specialties={bookingModal.caregiver.Caregiver?.Specialties || []}
        />
      )}
    </div>
  );
};

export default PublicCaregivers;