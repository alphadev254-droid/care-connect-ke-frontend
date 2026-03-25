import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { BookingModal } from "@/components/booking/BookingModal";
import { RatingDisplay } from "@/components/RatingDisplay";
import { useAuth } from "@/contexts/AuthContext";
import { mapUserRole } from "@/lib/roleMapper";
import { dashboardCard, responsive } from "@/theme";
import { caregiverService } from "@/services/caregiverService";
import { specialtyService } from "@/services/specialtyService";
import { locationService } from "@/services/locationService";
import {
  Search,
  Filter,
  MapPin,
  Clock,
  Shield,
  ChevronDown,
  Calendar,
  Heart,
  DollarSign,
  X,
  User,
  Award,
  Briefcase,
  FileText,
} from "lucide-react";

const Caregivers = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [selectedTA, setSelectedTA] = useState("all");
  const [selectedVillage, setSelectedVillage] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [bookingModal, setBookingModal] = useState({ open: false, caregiver: null });
  const [profileDialog, setProfileDialog] = useState({ open: false, caregiver: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [appliedFilters, setAppliedFilters] = useState({
    search: '',
    specialty: 'all',
    region: 'all',
    district: 'all',
    traditionalAuthority: 'all',
    village: 'all'
  });
  
  const pageSize = 70;

  const { data: caregiversData, isLoading, isFetching } = useQuery({
    queryKey: ["caregivers", appliedFilters, currentPage],
    queryFn: () => caregiverService.getPublicCaregivers({
      page: currentPage,
      limit: pageSize,
      ...(appliedFilters.search && { search: appliedFilters.search }),
      ...(appliedFilters.specialty !== 'all' && { specialtyId: appliedFilters.specialty }),
      ...(appliedFilters.region !== 'all' && { region: appliedFilters.region }),
      ...(appliedFilters.district !== 'all' && { district: appliedFilters.district }),
      ...(appliedFilters.traditionalAuthority !== 'all' && { traditionalAuthority: appliedFilters.traditionalAuthority }),
      ...(appliedFilters.village !== 'all' && { village: appliedFilters.village })
    }),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const { data: specialtiesData } = useQuery({
    queryKey: ["specialties"],
    queryFn: specialtyService.getSpecialties,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  // Fetch location data from API endpoints
  const { data: regions } = useQuery({
    queryKey: ["regions-list"],
    queryFn: locationService.getRegions,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });

  const { data: districts } = useQuery({
    queryKey: ["districts-list", selectedRegion],
    queryFn: () => locationService.getDistricts(selectedRegion),
    enabled: selectedRegion !== 'all',
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });

  const { data: traditionalAuthorities } = useQuery({
    queryKey: ["ta-list", selectedRegion, selectedDistrict],
    queryFn: () => locationService.getTraditionalAuthorities(selectedRegion, selectedDistrict),
    enabled: selectedDistrict !== 'all',
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });

  const { data: villages } = useQuery({
    queryKey: ["villages-list", selectedRegion, selectedDistrict, selectedTA],
    queryFn: () => locationService.getVillages(selectedRegion, selectedDistrict, selectedTA),
    enabled: selectedTA !== 'all',
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
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

  // For real-time frontend filtering (keeping existing functionality)
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
    <DashboardLayout userRole={mapUserRole(user?.role || 'patient')}>
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div>
          <h1 className={responsive.pageTitle}>Find Caregivers</h1>
          <p className={responsive.pageSubtitle}>Browse verified healthcare professionals</p>
        </div>

        {/* Search and Filters - Compact */}
        <div className="flex flex-wrap gap-2">
          <div className="flex-1 min-w-[160px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, specialty, or location..."
              className="pl-10 h-9 w-full border-border/60 bg-card text-xs sm:text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            type="button"
            className="gap-2 shrink-0 border-border/60"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
            <span className={responsive.body}>Filters</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </Button>
          <Button
            variant="default"
            size="sm"
            type="button"
            className="gap-2 px-4 shrink-0"
            onClick={applyFilters}
            disabled={isFetching}
          >
            <Search className="h-4 w-4" />
            <span className={responsive.body}>Search</span>
          </Button>
        </div>

        <div className="grid lg:grid-cols-4 gap-4">
          {/* Filters Dropdown - Shows when button clicked */}
          {showFilters && (
            <Card className={`lg:col-span-4 ${dashboardCard.base}`}>
              <CardContent className={dashboardCard.compactBody}>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  <div>
                    <Label className={`${responsive.label} mb-2 block`}>Specialty</Label>
                    <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                      <SelectTrigger className="h-9 text-xs border-border/60 bg-card">
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
                    <Label className={`${responsive.label} mb-2 block`}>County</Label>
                    <Select value={selectedRegion} onValueChange={handleRegionChange}>
                      <SelectTrigger className="h-9 text-xs border-border/60 bg-card">
                        <SelectValue placeholder="All Counties" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Counties</SelectItem>
                        {regions?.map((region: string) => (
                          <SelectItem key={region} value={region}>
                            {region}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className={`${responsive.label} mb-2 block`}>Constituency</Label>
                    <Select value={selectedDistrict} onValueChange={handleDistrictChange}>
                      <SelectTrigger className="h-9 text-xs border-border/60 bg-card">
                        <SelectValue placeholder="All Constituencies" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Constituencies</SelectItem>
                        {districts?.map((district: string) => (
                          <SelectItem key={district} value={district}>
                            {district}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className={`${responsive.label} mb-2 block`}>Ward</Label>
                    <Select value={selectedTA} onValueChange={handleTAChange}>
                      <SelectTrigger className="h-9 text-xs border-border/60 bg-card">
                        <SelectValue placeholder="All Wards" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Wards</SelectItem>
                        {traditionalAuthorities?.map((ta: string) => (
                          <SelectItem key={ta} value={ta}>
                            {ta}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className={`${responsive.label} mb-2 block`}>Sub-location</Label>
                    <Select value={selectedVillage} onValueChange={setSelectedVillage}>
                      <SelectTrigger className="h-9 text-xs border-border/60 bg-card">
                        <SelectValue placeholder="All Sub-locations" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sub-locations</SelectItem>
                        {villages?.map((village: string) => (
                          <SelectItem key={village} value={village}>
                            {village}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="default"
                    size="sm"
                    className="text-xs"
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
                    className="gap-2 text-xs border-border/60"
                    onClick={() => {
                      clearFilters();
                      setShowFilters(false);
                    }}
                  >
                    <X className="h-4 w-4" />
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Caregivers Grid */}
          <div className="lg:col-span-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                {isFetching ? 'Loading...' : `${filteredCaregivers.length} caregiver${filteredCaregivers.length !== 1 ? 's' : ''} found`}
                {!isFetching && currentPage > 1 && ` (Page ${currentPage})`}
              </p>
              {isFetching && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  Loading...
                </div>
              )}
            </div>

            {isFetching && currentPage === 1 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className={`${dashboardCard.base} animate-pulse`}>
                    <CardContent className={dashboardCard.statContent}>
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
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
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
                  <Card key={caregiver.id} className={`${dashboardCard.base} overflow-hidden hover:shadow-md hover:border-primary/30 transition-all`}>
                    <CardContent className={dashboardCard.statContent}>
                      <div className="flex items-start gap-3 mb-3">
                        <Avatar className="h-12 w-12 flex-shrink-0">
                          <AvatarImage src={caregiverData.profileImage} alt={name} />
                          <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">
                            {name.charAt(0) || 'C'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className={`font-semibold truncate ${responsive.body}`}>{name}</h3>
                            {caregiverData.verificationStatus === 'verified' && (
                              <Shield className="h-3 w-3 text-success flex-shrink-0" />
                            )}
                          </div>
                          <p className={`truncate ${responsive.bodyMuted}`}>
                            {caregiverData.qualifications || 'Healthcare Professional'}
                          </p>
                          <Badge
                            variant={
                              caregiverData.verificationStatus === 'verified' ? 'default' :
                              caregiverData.verificationStatus === 'rejected' ? 'destructive' :
                              'secondary'
                            }
                            className="mt-1 text-xs h-5"
                          >
                            {caregiverData.verificationStatus === 'verified' && 'Verified'}
                            {caregiverData.verificationStatus === 'pending' && 'Pending Verification'}
                            {caregiverData.verificationStatus === 'rejected' && 'Rejected'}
                            {!caregiverData.verificationStatus && 'Pending'}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-1.5 mb-3">
                        <div className={`flex items-center gap-2 ${responsive.bodyMuted}`}>
                          <Clock className="h-3 w-3 flex-shrink-0" />
                          <span>{caregiverData.experience || '0'} years experience</span>
                        </div>
                        <div className={`flex items-start gap-2 ${responsive.bodyMuted}`}>
                          <MapPin className="h-3 w-3 flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{location}</span>
                        </div>
                        <RatingDisplay 
                          averageRating={caregiverData.averageRating}
                          totalRatings={caregiverData.totalRatings}
                          size="sm"
                        />
                      </div>

                      {/* Specialties with Fees */}
                      {caregiverData.Specialties && caregiverData.Specialties.length > 0 && (
                        <div className="mb-3 space-y-2">
                          {caregiverData.Specialties.slice(0, 2).map((specialty: any) => (
                            <div key={specialty.id} className={dashboardCard.miniCard}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium">{specialty.name}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="text-muted-foreground">Session:</span>
                                  <span className="font-semibold text-primary ml-1">
                                    KES {specialty.sessionFee ? Number(specialty.sessionFee).toFixed(0) : '0'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Booking:</span>
                                  <span className="font-semibold text-secondary ml-1">
                                    KES {specialty.bookingFee ? Number(specialty.bookingFee).toFixed(0) : '0'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                          {caregiverData.Specialties.length > 2 && (
                            <p className="text-xs text-muted-foreground text-center">
                              +{caregiverData.Specialties.length - 2} more specialt{caregiverData.Specialties.length - 2 === 1 ? 'y' : 'ies'}
                            </p>
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
                        <Button
                          size="sm"
                          className="flex-1 gap-1 h-8 text-xs"
                          onClick={() => setBookingModal({ open: true, caregiver })}
                        >
                          <Calendar className="h-3 w-3" />
                          Book Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {filteredCaregivers.length === 0 && !isLoading && !isFetching && (
                <div className="col-span-2 sm:col-span-3 xl:col-span-4 text-center py-12">
                  <Heart className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <h3 className={`font-semibold mb-1 ${responsive.cardTitle}`}>No caregivers found</h3>
                  <p className={`${responsive.bodyMuted} mb-4`}>Try adjusting your filters to see more results</p>
                  <Button variant="outline" onClick={clearFilters}>Clear All Filters</Button>
                </div>
              )}
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
        </div>
      </div>

      {bookingModal.caregiver && (
        <BookingModal
          open={bookingModal.open}
          onClose={() => setBookingModal({ open: false, caregiver: null })}
          caregiverId={bookingModal.caregiver.Caregiver.id}
          caregiverName={`${bookingModal.caregiver.firstName || ''} ${bookingModal.caregiver.lastName || ''}`.trim() || 'Caregiver'}
          specialties={bookingModal.caregiver.Caregiver?.Specialties || []}
        />
      )}

      {/* Profile Dialog */}
      {profileDialog.caregiver && (
        <Dialog open={profileDialog.open} onOpenChange={(open) => setProfileDialog({ open, caregiver: open ? profileDialog.caregiver : null })}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className={responsive.dialogTitle}>Caregiver Profile</DialogTitle>
              <DialogDescription className={responsive.dialogDesc}>
                Detailed information about this healthcare professional
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-start gap-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profileDialog.caregiver.Caregiver?.profileImage} />
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
                        profileDialog.caregiver.Caregiver?.verificationStatus === 'verified' ? 'default' :
                        profileDialog.caregiver.Caregiver?.verificationStatus === 'rejected' ? 'destructive' :
                        'secondary'
                      }
                      className="gap-1"
                    >
                      {profileDialog.caregiver.Caregiver?.verificationStatus === 'verified' && (
                        <>
                          <Shield className="h-3 w-3" />
                          Verified Professional
                        </>
                      )}
                      {profileDialog.caregiver.Caregiver?.verificationStatus === 'pending' && 'Pending Verification'}
                      {profileDialog.caregiver.Caregiver?.verificationStatus === 'rejected' && 'Verification Rejected'}
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

              {/* Bio */}
              {profileDialog.caregiver.Caregiver?.bio && (
                <Card className={dashboardCard.base}>
                  <CardContent className={`${dashboardCard.compactBody} pt-4`}>
                    <div className="flex items-center gap-2 mb-3">
                      <User className="h-5 w-5 text-primary" />
                      <h4 className={responsive.cardTitle}>About</h4>
                    </div>
                    <p className={`leading-relaxed ${responsive.bodyMuted}`}>
                      {profileDialog.caregiver.Caregiver.bio}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Qualifications */}
              <Card className={dashboardCard.base}>
                <CardContent className={`${dashboardCard.compactBody} pt-4`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="h-5 w-5 text-primary" />
                    <h4 className={responsive.cardTitle}>Qualifications & Licensing</h4>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Verification Status</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant={
                            profileDialog.caregiver.Caregiver?.verificationStatus === 'verified' ? 'default' :
                            profileDialog.caregiver.Caregiver?.verificationStatus === 'rejected' ? 'destructive' :
                            'secondary'
                          }
                        >
                          {profileDialog.caregiver.Caregiver?.verificationStatus === 'verified' && (
                            <>
                              <Shield className="h-3 w-3 mr-1" />
                              Verified
                            </>
                          )}
                          {profileDialog.caregiver.Caregiver?.verificationStatus === 'pending' && 'Pending'}
                          {profileDialog.caregiver.Caregiver?.verificationStatus === 'rejected' && 'Rejected'}
                          {!profileDialog.caregiver.Caregiver?.verificationStatus && 'Pending'}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Qualifications</Label>
                      <p className={`mt-1 ${responsive.body}`}>{profileDialog.caregiver.Caregiver?.qualifications || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Licensing Institution</Label>
                      <p className={`mt-1 ${responsive.body}`}>{profileDialog.caregiver.Caregiver?.licensingInstitution || 'Not specified'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Location */}
              <Card className={dashboardCard.base}>
                <CardContent className={`${dashboardCard.compactBody} pt-4`}>
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <h4 className={responsive.cardTitle}>Service Location</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">County</Label>
                      <p className={`mt-1 capitalize ${responsive.body}`}>{profileDialog.caregiver.Caregiver?.region || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Constituency</Label>
                      <p className={`mt-1 uppercase ${responsive.body}`}>{profileDialog.caregiver.Caregiver?.district || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Ward</Label>
                      <p className={`mt-1 uppercase ${responsive.body}`}>{profileDialog.caregiver.Caregiver?.traditionalAuthority || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Sub-location</Label>
                      <p className={`mt-1 uppercase ${responsive.body}`}>{profileDialog.caregiver.Caregiver?.village || 'Not specified'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Appointment Details */}
              <Card className={dashboardCard.base}>
                <CardContent className={`${dashboardCard.compactBody} pt-4`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <h4 className={responsive.cardTitle}>Appointment Information</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Default Duration</Label>
                      <p className={`mt-1 ${responsive.body}`}>{profileDialog.caregiver.Caregiver?.appointmentDuration || 60} minutes</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Auto-Confirm</Label>
                      <p className={`mt-1 ${responsive.body}`}>
                        {profileDialog.caregiver.Caregiver?.autoConfirm ? 'Yes' : 'No'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
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
    </DashboardLayout>
  );
};

export default Caregivers;
