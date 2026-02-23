import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Mail, Lock, Eye, EyeOff, User, Phone, ArrowRight, ArrowLeft, Check, CreditCard, Loader2, Plus, Trash2, Clock } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { api } from "@/lib/api";

const AVAILABILITY_DAYS = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 0, label: 'Sunday' },
];

type AvailabilitySlot = { dayOfWeek: number; startTime: string; endTime: string };

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [searchParams] = useSearchParams();
  const referralCodeFromUrl = searchParams.get('ref');

  useEffect(() => {
    fetchSpecialties();
    fetchRegions();
    fetchPlatformCommission();
  }, []);

  const fetchPlatformCommission = async () => {
    try {
      const response = await api.get('/config/platform-commission');
      setPlatformCommission(response.data.commission || 20);
    } catch (error) {
      console.error('Failed to fetch platform commission:', error);
    }
  };

  const fetchSpecialties = async () => {
    try {
      setLoadingSpecialties(true);
      const response = await api.get('/specialties');
      setSpecialties(response.data.specialties || []);
    } catch (error) {
      console.error('Failed to fetch specialties:', error);
      toast.error('Failed to load specialties. Please refresh the page.');
    } finally {
      setLoadingSpecialties(false);
    }
  };

  const fetchRegions = async () => {
    try {
      setLoadingRegions(true);
      const response = await api.get('/locations/regions');
      setRegions(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch regions:', error);
      toast.error('Failed to load regions. Please refresh the page.');
    } finally {
      setLoadingRegions(false);
    }
  };

  const fetchDistricts = async (region: string) => {
    try {
      setLoadingDistricts(true);
      const response = await api.get(`/locations/districts/${encodeURIComponent(region)}`);
      setDistricts(response.data.data || []);
      setTraditionalAuthorities([]);
      setVillages([]);
    } catch (error) {
      console.error('Failed to fetch districts:', error);
      toast.error('Failed to load districts for this region.');
    } finally {
      setLoadingDistricts(false);
    }
  };

  const fetchTraditionalAuthorities = async (region: string, district: string) => {
    try {
      setLoadingTAs(true);
      const response = await api.get(`/locations/traditional-authorities/${encodeURIComponent(region)}/${encodeURIComponent(district)}`);
      setTraditionalAuthorities(response.data.data || []);
      setVillages([]);
    } catch (error) {
      console.error('Failed to fetch traditional authorities:', error);
      toast.error('Failed to load traditional authorities.');
    } finally {
      setLoadingTAs(false);
    }
  };

  const fetchVillages = async (region: string, district: string, ta: string) => {
    try {
      setLoadingVillages(true);
      const response = await api.get(`/locations/villages/${encodeURIComponent(region)}/${encodeURIComponent(district)}/${encodeURIComponent(ta)}`);
      setVillages(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch villages:', error);
      toast.error('Failed to load villages.');
    } finally {
      setLoadingVillages(false);
    }
  };

  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showRateCard, setShowRateCard] = useState(false);
  const [platformCommission, setPlatformCommission] = useState(20);
  const [termsContent, setTermsContent] = useState("");
  const [specialties, setSpecialties] = useState([]);
  const [regions, setRegions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [traditionalAuthorities, setTraditionalAuthorities] = useState([]);
  const [villages, setVillages] = useState([]);
  // Loading states for dropdown data
  const [loadingSpecialties, setLoadingSpecialties] = useState(false);
  const [loadingRegions, setLoadingRegions] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingTAs, setLoadingTAs] = useState(false);
  const [loadingVillages, setLoadingVillages] = useState(false);
  const [formData, setFormData] = useState({
    userType: "patient",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
    // Patient fields
    idNumber: "",
    dateOfBirth: "",
    address: "",
    emergencyContact: "",
    referralCode: referralCodeFromUrl || "",
    // Guardian fields for child/elderly patients
    guardianFirstName: "",
    guardianLastName: "",
    guardianPhone: "",
    guardianEmail: "",
    guardianRelationship: "",
    guardianIdNumber: "",
    // Caregiver fields
    licensingInstitution: "",
    licenseNumber: "",
    experience: "",
    qualifications: "",
    supportingDocuments: null,
    profilePicture: null,
    idDocuments: null,
    specialties: [],
    // Location fields
    region: "",
    district: "",
    traditionalAuthority: "" as string | string[], // Single for patients, array for caregivers
    village: "" as string | string[], // Single for patients, array for caregivers
  });
  const [showCustomRelationship, setShowCustomRelationship] = useState(false);
  const [regAvailability, setRegAvailability] = useState<AvailabilitySlot[]>([]);

  const addAvailabilitySlot = () => {
    setRegAvailability(prev => [...prev, { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }]);
  };
  const removeAvailabilitySlot = (index: number) => {
    setRegAvailability(prev => prev.filter((_, i) => i !== index));
  };
  const updateAvailabilitySlot = (index: number, field: keyof AvailabilitySlot, value: string | number) => {
    setRegAvailability(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string): number => {
    if (!dateOfBirth) return 0;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  // Validate age based on patient type
  const validateAge = (): boolean => {
    if (!formData.dateOfBirth) return true; // Will be caught by required field validation

    const age = calculateAge(formData.dateOfBirth);

    if (formData.userType === 'child_patient') {
      if (age > 18) {
        toast.error("Child patients must be 18 years old or younger. Please select 'Patient (Adult)' or 'Elderly Patient' instead.");
        return false;
      }
      if (age < 0) {
        toast.error("Invalid date of birth. Please enter a valid date.");
        return false;
      }
    } else if (formData.userType === 'patient') {
      if (age < 18) {
        toast.error("Adult patients must be 18 years or older. Please select 'Child Patient' instead.");
        return false;
      }
      if (age >= 60) {
        toast.info("Consider selecting 'Elderly Patient' for better specialized care options.");
      }
    } else if (formData.userType === 'elderly_patient') {
      if (age < 18) {
        toast.error("Please select 'Child Patient' for patients under 18 years old.");
        return false;
      }
      if (age < 60) {
        toast.info("Elderly patient category is typically for patients 60 years and above. You may continue or select 'Patient (Adult)' instead.");
      }
    } else if (formData.userType === 'caregiver') {
      if (age < 18) {
        toast.error("Caregivers must be at least 18 years old.");
        return false;
      }
    }

    return true;
  };

  // Validate mandatory fields based on user type
  const validateMandatoryFields = (): boolean => {
    // Step 2 validations
    if (step === 2) {
      // Common validations for all types
      if (!formData.firstName.trim()) {
        toast.error("First name is required");
        return false;
      }
      if (!formData.lastName.trim()) {
        toast.error("Last name is required");
        return false;
      }
      if (!formData.email.trim() && !(formData.userType === 'child_patient' || formData.userType === 'elderly_patient')) {
        toast.error("Email is required");
        return false;
      }
      if (!formData.phone.trim() && !(formData.userType === 'child_patient' || formData.userType === 'elderly_patient')) {
        toast.error("Phone number is required");
        return false;
      }
      // For child and elderly patients, check guardian email and phone
      if ((formData.userType === 'child_patient' || formData.userType === 'elderly_patient')) {
        if (!formData.guardianEmail.trim()) {
          toast.error("Guardian email is required");
          return false;
        }
        if (!formData.guardianPhone.trim()) {
          toast.error("Guardian phone is required");
          return false;
        }
        // Validate guardian phone format (flexible for international numbers)
        const phoneRegex = /^[+]?[0-9]{9,14}$/;
        if (!phoneRegex.test(formData.guardianPhone.replace(/\s/g, ''))) {
          toast.error("Guardian phone must be 9-14 digits (with optional + for country code)");
          return false;
        }
      }
      // Validate regular phone for other user types
      if (formData.userType !== 'child_patient' && formData.userType !== 'elderly_patient') {
        const phoneRegex = /^[+]?[0-9]{9,14}$/;
        if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
          toast.error("Phone must be 9-14 digits (with optional + for country code)");
          return false;
        }
      }
      if (!formData.dateOfBirth) {
        toast.error("Date of birth is required");
        return false;
      }

      // Caregiver-specific validations - ALL fields mandatory including images
      if (formData.userType === 'caregiver') {
        if (!formData.idNumber.trim()) {
          toast.error("National ID number is required for caregivers");
          return false;
        }
        if (!formData.licensingInstitution.trim()) {
          toast.error("Licensing institution is required");
          return false;
        }
        if (!formData.licenseNumber.trim()) {
          toast.error("License number is required");
          return false;
        }
        if (!formData.experience) {
          toast.error("Years of experience is required");
          return false;
        }
        if (!formData.qualifications.trim()) {
          toast.error("Qualifications are required");
          return false;
        }
        if (formData.specialties.length === 0) {
          toast.error("Please select at least one specialty");
          return false;
        }
        if (!formData.profilePicture) {
          toast.error("Profile picture is required for caregivers");
          return false;
        }
        if (!formData.idDocuments || formData.idDocuments.length === 0) {
          toast.error("ID documents are required for caregivers");
          return false;
        }
        if (!formData.supportingDocuments || formData.supportingDocuments.length === 0) {
          toast.error("Supporting documents (certificates/licenses) are required");
          return false;
        }
      }

      // Patient Adult - ALL fields mandatory
      if (formData.userType === 'patient') {
        if (!formData.idNumber.trim()) {
          toast.error("National ID number is required");
          return false;
        }
        if (!formData.address.trim()) {
          toast.error("Address is required");
          return false;
        }
        if (!formData.emergencyContact.trim()) {
          toast.error("Emergency contact is required");
          return false;
        }
      }

      // Patient Child - Only name and age mandatory, guardian fields ALL mandatory
      if (formData.userType === 'child_patient') {
        // Name and DOB already validated above
        if (!formData.address.trim()) {
          toast.error("Address is required");
          return false;
        }
        if (!formData.emergencyContact.trim()) {
          toast.error("Emergency contact is required");
          return false;
        }
        // Guardian fields mandatory
        if (!formData.guardianFirstName.trim()) {
          toast.error("Guardian first name is required");
          return false;
        }
        if (!formData.guardianLastName.trim()) {
          toast.error("Guardian last name is required");
          return false;
        }
        if (!formData.guardianPhone.trim()) {
          toast.error("Guardian phone is required");
          return false;
        }
        if (!formData.guardianEmail.trim()) {
          toast.error("Guardian email is required");
          return false;
        }
        if (!formData.guardianRelationship) {
          toast.error("Guardian relationship is required");
          return false;
        }
        if (!formData.guardianIdNumber.trim()) {
          toast.error("Guardian ID number is required");
          return false;
        }
      }

      // Patient Elderly - Only name and age mandatory, guardian fields ALL mandatory
      if (formData.userType === 'elderly_patient') {
        // Name and DOB already validated above
        if (!formData.address.trim()) {
          toast.error("Address is required");
          return false;
        }
        if (!formData.emergencyContact.trim()) {
          toast.error("Emergency contact is required");
          return false;
        }
        // Guardian fields mandatory
        if (!formData.guardianFirstName.trim()) {
          toast.error("Guardian first name is required");
          return false;
        }
        if (!formData.guardianLastName.trim()) {
          toast.error("Guardian last name is required");
          return false;
        }
        if (!formData.guardianPhone.trim()) {
          toast.error("Guardian phone is required");
          return false;
        }
        if (!formData.guardianEmail.trim()) {
          toast.error("Guardian email is required");
          return false;
        }
        if (!formData.guardianRelationship) {
          toast.error("Guardian relationship is required");
          return false;
        }
        if (!formData.guardianIdNumber.trim()) {
          toast.error("Guardian ID number is required");
          return false;
        }
      }
    }

    // Step 3 validations - Location mandatory for ALL users
    if (step === 3) {
      if (!formData.region) {
        toast.error("Region is required");
        return false;
      }
      if (!formData.district) {
        toast.error("District is required");
        return false;
      }
      // For caregivers, check if arrays have at least one item
      if (formData.userType === 'caregiver') {
        if (!Array.isArray(formData.traditionalAuthority) || formData.traditionalAuthority.length === 0) {
          toast.error("Please select at least one Traditional Authority");
          return false;
        }
        if (!Array.isArray(formData.village) || formData.village.length === 0) {
          toast.error("Please select at least one Village");
          return false;
        }
      } else {
        // For patients, check single values
        if (!formData.traditionalAuthority) {
          toast.error("Traditional Authority is required");
          return false;
        }
        if (!formData.village) {
          toast.error("Village is required");
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const maxSteps = formData.userType === 'caregiver' ? 4 : 3;

    if (step < maxSteps) {
      // Validate mandatory fields before proceeding
      if (!validateMandatoryFields()) {
        return;
      }
      // Validate age before moving to step 3 if we're on step 2
      if (step === 2) {
        if (!validateAge()) {
          return;
        }
      }
      setStep(step + 1);
      return;
    }

    // Validate final step fields (step 3 location for patients, step 4 is optional availability for caregivers)
    if (!validateMandatoryFields()) {
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!formData.agreeTerms) {
      toast.error("Please agree to the terms and conditions");
      return;
    }

    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      
      formDataToSend.append('email', (formData.userType === 'child_patient' || formData.userType === 'elderly_patient') ? formData.guardianEmail : formData.email);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('firstName', formData.firstName);
      formDataToSend.append('lastName', formData.lastName);
      formDataToSend.append('phone', (formData.userType === 'child_patient' || formData.userType === 'elderly_patient') ? formData.guardianPhone : formData.phone);
      formDataToSend.append('role', formData.userType);

      if (formData.region) formDataToSend.append('region', formData.region);
      if (formData.district) formDataToSend.append('district', formData.district);
      if (formData.traditionalAuthority) formDataToSend.append('traditionalAuthority', formData.traditionalAuthority);
      if (formData.village) formDataToSend.append('village', formData.village);

      if (formData.userType === 'patient' || formData.userType === 'child_patient' || formData.userType === 'elderly_patient') {
        if (formData.idNumber) formDataToSend.append('idNumber', formData.idNumber);
        formDataToSend.append('dateOfBirth', formData.dateOfBirth);
        formDataToSend.append('address', formData.address);
        formDataToSend.append('emergencyContact', formData.emergencyContact);
        if (formData.referralCode) formDataToSend.append('referralCode', formData.referralCode);

        if (formData.userType === 'child_patient' || formData.userType === 'elderly_patient') {
          formDataToSend.append('guardianFirstName', formData.guardianFirstName);
          formDataToSend.append('guardianLastName', formData.guardianLastName);
          formDataToSend.append('guardianPhone', formData.guardianPhone);
          formDataToSend.append('guardianEmail', formData.guardianEmail);
          formDataToSend.append('guardianRelationship', formData.guardianRelationship);
          formDataToSend.append('guardianIdNumber', formData.guardianIdNumber);
          formDataToSend.append('patientType', formData.userType);
        }
        
        formDataToSend.set('role', 'patient');
      } else if (formData.userType === 'guardian') {
        formDataToSend.append('idNumber', formData.idNumber);
        formDataToSend.append('guardianAccountType', formData.guardianAccountType);
        formDataToSend.set('role', 'guardian');
      } else if (formData.userType === 'caregiver') {
        formDataToSend.append('idNumber', formData.idNumber);
        formDataToSend.append('licensingInstitution', formData.licensingInstitution);
        formDataToSend.append('licenseNumber', formData.licenseNumber);
        formDataToSend.append('experience', formData.experience || '0');
        formDataToSend.append('qualifications', formData.qualifications);

        if (formData.specialties.length > 0) {
          formData.specialties.forEach(specialtyId => {
            formDataToSend.append('specialties[]', specialtyId);
          });
        }
        
        if (formData.supportingDocuments) {
          Array.from(formData.supportingDocuments).slice(0, 5).forEach((file: any) => {
            formDataToSend.append('supportingDocuments', file);
          });
        }
        
        if (formData.profilePicture) {
          formDataToSend.append('profilePicture', formData.profilePicture);
        }
        
        if (formData.idDocuments) {
          Array.from(formData.idDocuments).slice(0, 3).forEach((file: any) => {
            formDataToSend.append('idDocuments', file);
          });
        }

        // Add referral code for caregiver-to-caregiver referrals
        if (formData.referralCode) {
          formDataToSend.append('referralCode', formData.referralCode);
        }

        // Add availability data if set
        if (regAvailability.length > 0) {
          formDataToSend.append('availability', JSON.stringify(regAvailability));
        }
      }

      const result = await register(formDataToSend);
      
      if (result?.requiresApproval) {
        toast.success("Registration submitted successfully! Please check your email for confirmation and wait for admin approval.");
        navigate("/login");
      } else {
        toast.success("Account created successfully! Welcome to CareConnect.");
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error("Registration error:", error);

      // Handle specific error messages from backend
      if (error.response?.data) {
        const errorData = error.response.data;

        // Check for specific error codes
        if (errorData.code === 'FILE_TOO_LARGE') {
          toast.error(`File too large! Maximum file size is ${errorData.maxSize}. Please use smaller files.`, {
            duration: 5000
          });
        } else if (errorData.code === 'INVALID_FILE_TYPE') {
          toast.error(errorData.error || 'Invalid file type. Only JPEG, PNG, PDF, DOC, and DOCX files are allowed.', {
            duration: 5000
          });
        } else if (errorData.code === 'TOO_MANY_FILES') {
          toast.error('Too many files uploaded. Please check the file limits.', {
            duration: 5000
          });
        } else if (errorData.error) {
          // Generic error message from backend
          toast.error(errorData.error, { duration: 5000 });
        } else if (errorData.message) {
          toast.error(errorData.message, { duration: 5000 });
        } else {
          toast.error('Registration failed. Please check your information and try again.');
        }
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error('Registration failed. Please check your internet connection and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTerms = async (role: string) => {
    try {
      // Normalize patient types to 'patient' for terms
      const termsRole = ['patient', 'child_patient', 'elderly_patient'].includes(role) ? 'patient' : role;
      const response = await api.get(`/terms/${termsRole}`);
      setTermsContent(response.data.data.terms);
      setShowTerms(true);
    } catch (error) {
      toast.error("Failed to load terms and conditions");
    }
  };

  const userTypes = [
    {
      id: "patient",
      title: "Patient (Adult)",
      description: "I need home healthcare services for myself",
    },
    {
      id: "child_patient",
      title: "Child Patient",
      description: "I'm registering for a child who needs healthcare",
    },
    {
      id: "elderly_patient",
      title: "Elderly Patient",
      description: "I'm registering for an elderly person who needs care",
    },
    {
      id: "caregiver",
      title: "Caregiver",
      description: "I want to provide healthcare services",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="flex items-center justify-center py-8 lg:py-12">
        <div className="container max-w-6xl">
          <Card className="border-0 shadow-xl overflow-hidden">
            <div className="grid lg:grid-cols-2">
              {/* Left Side - Image */}
              <div className="hidden lg:block bg-cover bg-[center_20%] bg-no-repeat" style={{ backgroundImage: 'url(/mission.png)' }}>
                <div className="w-full h-full bg-black/20"></div>
              </div>
              
              {/* Right Side - Form */}
              <div className="p-6">
                <CardHeader className="text-center pb-1 p-0">
                  <div className="flex justify-center mb-3">
                    <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center">
                      <Heart className="h-6 w-6 text-primary-foreground" />
                    </div>
                  </div>
                  <CardTitle className="font-display text-xl">Create Account</CardTitle>
                  <CardDescription className="text-sm">
                    Join CareConnect in just a few steps
                  </CardDescription>

              <div className="flex items-center justify-center gap-1 mt-4">
                {Array.from({ length: formData.userType === 'caregiver' ? 4 : 3 }, (_, i) => i + 1).map((i) => {
                  const totalStepsIndicator = formData.userType === 'caregiver' ? 4 : 3;
                  return (
                  <div key={i} className="flex items-center gap-1">
                    <div
                      className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                        step > i
                          ? "bg-success text-success-foreground"
                          : step === i
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {step > i ? <Check className="h-3 w-3" /> : i}
                    </div>
                    {i < totalStepsIndicator && (
                      <div
                        className={`w-8 h-0.5 rounded ${
                          step > i ? "bg-success" : "bg-muted"
                        }`}
                      />
                    )}
                  </div>
                  );
                })}
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleSubmit} className="space-y-3">
                {step === 1 && (
                  <div className="space-y-3">
                    <Label className="text-sm">I am a...</Label>
                    <RadioGroup
                      value={formData.userType}
                      onValueChange={(value) => {
                        // Initialize arrays for caregivers, reset to empty strings for patients
                        const locationDefaults = value === 'caregiver'
                          ? { traditionalAuthority: [], village: [] }
                          : { traditionalAuthority: "", village: "" };
                        setFormData({ ...formData, userType: value, ...locationDefaults });
                      }}
                      className="grid gap-3"
                    >
                      {userTypes.map((type) => (
                        <div key={type.id}>
                          <RadioGroupItem
                            value={type.id}
                            id={type.id}
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor={type.id}
                            className="flex items-center gap-3 rounded-lg border-2 border-muted bg-card p-3 hover:bg-muted/50 cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 transition-all"
                          >
                            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                              type.id === "patient" ? "bg-primary/10" : "bg-secondary/10"
                            }`}>
                              {type.id === "patient" ? (
                                <User className="h-5 w-5 text-primary" />
                              ) : (
                                <Heart className="h-5 w-5 text-secondary" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{type.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {type.description}
                              </p>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                )}

                {step === 2 && (
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Left Column - Always 6 fields */}
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">{(formData.userType === 'child_patient' || formData.userType === 'elderly_patient') ? 'Patient First Name' : 'First Name'}</Label>
                        <Input
                          id="firstName"
                          placeholder="John"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">{(formData.userType === 'child_patient' || formData.userType === 'elderly_patient') ? 'Patient Last Name' : 'Last Name'}</Label>
                        <Input
                          id="lastName"
                          placeholder="Doe"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">{(formData.userType === 'child_patient' || formData.userType === 'elderly_patient') ? 'Guardian Email' : 'Email Address'}</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="name@example.com"
                          value={(formData.userType === 'child_patient' || formData.userType === 'elderly_patient') ? formData.guardianEmail : formData.email}
                          onChange={(e) => {
                            if (formData.userType === 'child_patient' || formData.userType === 'elderly_patient') {
                              setFormData({ ...formData, guardianEmail: e.target.value });
                            } else {
                              setFormData({ ...formData, email: e.target.value });
                            }
                          }}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">{(formData.userType === 'child_patient' || formData.userType === 'elderly_patient') ? 'Guardian Phone' : 'Phone Number'}</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+265 xxx xxx xxx or 0999 xxx xxx"
                          value={(formData.userType === 'child_patient' || formData.userType === 'elderly_patient') ? formData.guardianPhone : formData.phone}
                          onChange={(e) => {
                            if (formData.userType === 'child_patient' || formData.userType === 'elderly_patient') {
                              setFormData({ ...formData, guardianPhone: e.target.value });
                            } else {
                              setFormData({ ...formData, phone: e.target.value });
                            }
                          }}
                          minLength={9}
                          maxLength={15}
                          required
                        />
                        <p className="text-xs text-muted-foreground">
                          Enter phone number with country code (+265xxx) or local format (0999xxx)
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="idNumber">{(formData.userType === 'child_patient' || formData.userType === 'elderly_patient') ? 'Patient ID Number (Optional)' : 'National ID Number'} <span className="text-destructive">*</span></Label>
                        <Input
                          id="idNumber"
                          placeholder="National ID number"
                          value={formData.idNumber}
                          onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth">
                          {formData.userType === 'child_patient' ? "Child's Date of Birth" :
                           formData.userType === 'elderly_patient' ? "Elderly Person's Date of Birth" :
                           "Date of Birth"}
                        </Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) => {
                            setFormData({ ...formData, dateOfBirth: e.target.value });
                          }}
                          max={new Date().toISOString().split('T')[0]}
                          min={formData.userType === 'child_patient'
                            ? new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]
                            : formData.userType === 'elderly_patient'
                            ? new Date(new Date().setFullYear(new Date().getFullYear() - 120)).toISOString().split('T')[0]
                            : new Date(new Date().setFullYear(new Date().getFullYear() - 120)).toISOString().split('T')[0]
                          }
                          required
                        />
                        <p className="text-xs text-muted-foreground">
                          {formData.userType === 'child_patient' && "Must be 18 years old or younger"}
                          {formData.userType === 'patient' && "Must be 18 years or older"}
                          {formData.userType === 'elderly_patient' && "Typically 60 years or older"}
                          {formData.userType === 'caregiver' && "Must be 18 years or older"}
                        </p>
                      </div>
                      {formData.userType === 'caregiver' && (
                        <div className="space-y-2">
                          <Label htmlFor="profilePicture">Profile Picture <span className="text-destructive">*</span></Label>
                          <Input
                            id="profilePicture"
                            type="file"
                            accept=".jpg,.jpeg,.png"
                            onChange={(e) => setFormData({ ...formData, profilePicture: e.target.files?.[0] || null })}
                          />
                          {formData.profilePicture && (
                            <p className="text-xs text-muted-foreground font-medium">Selected: {formData.profilePicture.name}</p>
                          )}
                          <p className="text-xs text-muted-foreground">Upload a professional photo (JPG, PNG)</p>
                        </div>
                      )}
                    </div>

                    {/* Right Column - Always 6 fields */}
                    <div className="space-y-3">
                      {/* Patient Types */}
                      {(formData.userType === 'patient' || formData.userType === 'child_patient' || formData.userType === 'elderly_patient') && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Input
                              id="address"
                              placeholder="Home address"
                              value={formData.address}
                              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="emergencyContact">Emergency Contact</Label>
                            <Input
                              id="emergencyContact"
                              placeholder="Emergency contact phone"
                              value={formData.emergencyContact}
                              onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="referralCode" className="flex items-center gap-2">
                              Referral Code (Optional)
                              {referralCodeFromUrl && (
                                <Badge variant="secondary" className="text-xs">Auto-filled</Badge>
                              )}
                            </Label>
                            <Input
                              id="referralCode"
                              placeholder="Enter referral code if you have one"
                              value={formData.referralCode}
                              onChange={(e) => setFormData({ ...formData, referralCode: e.target.value.toUpperCase() })}
                              className="uppercase"
                            />
                            <p className="text-xs text-muted-foreground">
                              Have a referral code from a caregiver? Enter it here to support them!
                            </p>
                          </div>
                          {(formData.userType === 'child_patient' || formData.userType === 'elderly_patient') ? (
                            <>
                              <div className="space-y-2">
                                <Label htmlFor="guardianFirstName">Guardian First Name</Label>
                                <Input
                                  id="guardianFirstName"
                                  placeholder="Guardian's first name"
                                  value={formData.guardianFirstName}
                                  onChange={(e) => setFormData({ ...formData, guardianFirstName: e.target.value })}
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="guardianLastName">Guardian Last Name</Label>
                                <Input
                                  id="guardianLastName"
                                  placeholder="Guardian's last name"
                                  value={formData.guardianLastName}
                                  onChange={(e) => setFormData({ ...formData, guardianLastName: e.target.value })}
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="guardianRelationship">Relationship</Label>
                                {showCustomRelationship ? (
                                  <div className="space-y-2">
                                    <Input
                                      id="guardianRelationship"
                                      placeholder="Enter relationship"
                                      value={formData.guardianRelationship}
                                      onChange={(e) => setFormData({ ...formData, guardianRelationship: e.target.value })}
                                      required
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setShowCustomRelationship(false);
                                        setFormData({ ...formData, guardianRelationship: "" });
                                      }}
                                    >
                                      Back to options
                                    </Button>
                                  </div>
                                ) : (
                                  <Select
                                    value={formData.guardianRelationship}
                                    onValueChange={(value) => {
                                      if (value === "other") {
                                        setShowCustomRelationship(true);
                                        setFormData({ ...formData, guardianRelationship: "" });
                                      } else {
                                        setFormData({ ...formData, guardianRelationship: value });
                                      }
                                    }}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select relationship" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {formData.userType === 'child_patient' ? (
                                        <>
                                          <SelectItem value="parent">Parent</SelectItem>
                                          <SelectItem value="guardian">Legal Guardian</SelectItem>
                                          <SelectItem value="grandparent">Grandparent</SelectItem>
                                          <SelectItem value="aunt_uncle">Aunt/Uncle</SelectItem>
                                          <SelectItem value="other">Other (specify)</SelectItem>
                                        </>
                                      ) : (
                                        <>
                                          <SelectItem value="child">Adult Child</SelectItem>
                                          <SelectItem value="spouse">Spouse</SelectItem>
                                          <SelectItem value="sibling">Sibling</SelectItem>
                                          <SelectItem value="caregiver">Professional Caregiver</SelectItem>
                                          <SelectItem value="other">Other (specify)</SelectItem>
                                        </>
                                      )}
                                    </SelectContent>
                                  </Select>
                                )}
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="guardianIdNumber">Guardian ID Number</Label>
                                <Input
                                  id="guardianIdNumber"
                                  placeholder="Guardian's national ID"
                                  value={formData.guardianIdNumber}
                                  onChange={(e) => setFormData({ ...formData, guardianIdNumber: e.target.value })}
                                  required
                                />
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="h-[68px]"></div>
                              <div className="h-[68px]"></div>
                              <div className="h-[68px]"></div>
                              <div className="h-[68px]"></div>
                            </>
                          )}
                        </>
                      )}

                      {/* Caregiver Type */}
                      {formData.userType === 'caregiver' && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="licensingInstitution">Licensing Institution</Label>
                            <Input
                              id="licensingInstitution"
                              placeholder="e.g., Nurses Council of Malawi"
                              value={formData.licensingInstitution}
                              onChange={(e) => setFormData({ ...formData, licensingInstitution: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="licenseNumber">License Number</Label>
                            <Input
                              id="licenseNumber"
                              placeholder="Professional license number"
                              value={formData.licenseNumber}
                              onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="experience">Years of Experience</Label>
                            <Input
                              id="experience"
                              type="number"
                              placeholder="5"
                              value={formData.experience}
                              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="qualifications">Qualifications</Label>
                            <Input
                              id="qualifications"
                              placeholder="RN, BSN, Certified Nursing Assistant"
                              value={formData.qualifications}
                              onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label>Specialties</Label>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setShowRateCard(true)}
                                className="gap-2 h-7 text-xs"
                              >
                                <CreditCard className="h-3 w-3" />
                                Our Rate Card
                              </Button>
                            </div>
                            <div className="max-h-24 overflow-y-auto border rounded-md p-2">
                              {loadingSpecialties ? (
                                <div className="flex items-center justify-center py-4 text-muted-foreground">
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  <span className="text-sm">Loading specialties...</span>
                                </div>
                              ) : specialties.length === 0 ? (
                                <div className="flex items-center justify-center py-4 text-muted-foreground">
                                  <span className="text-sm">No specialties available</span>
                                </div>
                              ) : (
                                specialties.map((specialty: any) => (
                                  <div key={specialty.id} className="flex items-center space-x-2 py-1">
                                    <Checkbox
                                      id={`specialty-${specialty.id}`}
                                      checked={formData.specialties.includes(specialty.id.toString())}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          setFormData({
                                            ...formData,
                                            specialties: [...formData.specialties, specialty.id.toString()]
                                          });
                                        } else {
                                          setFormData({
                                            ...formData,
                                            specialties: formData.specialties.filter(id => id !== specialty.id.toString())
                                          });
                                        }
                                      }}
                                    />
                                    <Label htmlFor={`specialty-${specialty.id}`} className="text-sm">
                                      {specialty.name}
                                    </Label>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="idDocuments">ID Documents <span className="text-destructive">*</span></Label>
                            <Input
                              id="idDocuments"
                              type="file"
                              multiple
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => setFormData({ ...formData, idDocuments: e.target.files })}
                            />
                            {formData.idDocuments && formData.idDocuments.length > 0 && (
                              <div className="text-xs text-muted-foreground">
                                <p className="font-medium">Selected files ({formData.idDocuments.length}/3):</p>
                                {Array.from(formData.idDocuments).slice(0, 3).map((file, index) => (
                                  <p key={index} className="truncate">• {file.name}</p>
                                ))}
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground">Upload ID documents (max 3 files: PDF, JPG, PNG)</p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="supportingDocuments">Supporting Documents (Certificates, Licenses) <span className="text-destructive">*</span></Label>
                            <Input
                              id="supportingDocuments"
                              type="file"
                              multiple
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                              onChange={(e) => setFormData({ ...formData, supportingDocuments: e.target.files })}
                            />
                            {formData.supportingDocuments && formData.supportingDocuments.length > 0 && (
                              <div className="text-xs text-muted-foreground">
                                <p className="font-medium">Selected files ({formData.supportingDocuments.length}/5):</p>
                                {Array.from(formData.supportingDocuments).slice(0, 5).map((file, index) => (
                                  <p key={index} className="truncate">• {file.name}</p>
                                ))}
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground">Upload certificates, licenses (max 5 files)</p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="caregiverReferralCode" className="flex items-center gap-2">
                              Referral Code (Optional)
                              {referralCodeFromUrl && (
                                <Badge variant="secondary" className="text-xs">Auto-filled</Badge>
                              )}
                            </Label>
                            <Input
                              id="caregiverReferralCode"
                              placeholder="Enter referral code if you have one"
                              value={formData.referralCode}
                              onChange={(e) => setFormData({ ...formData, referralCode: e.target.value.toUpperCase() })}
                              className="uppercase"
                            />
                            <p className="text-xs text-muted-foreground">
                              Have a referral code from another caregiver? Enter it here to support them!
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-3">
                    {/* Location Fields */}
                    <div className="grid md:grid-cols-2 gap-3 pb-3 border-b">
                      <div className="space-y-2">
                        <Label htmlFor="region">Region <span className="text-destructive">*</span></Label>
                        <Select
                          value={formData.region}
                          onValueChange={(value) => {
                            setFormData({ ...formData, region: value, district: "", traditionalAuthority: "", village: "" });
                            fetchDistricts(value);
                          }}
                          disabled={loadingRegions}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={loadingRegions ? "Loading regions..." : "Select region"} />
                            {loadingRegions && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                          </SelectTrigger>
                          <SelectContent>
                            {loadingRegions ? (
                              <div className="flex items-center justify-center py-4 text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                <span className="text-sm">Loading...</span>
                              </div>
                            ) : regions.length === 0 ? (
                              <div className="py-4 text-center text-sm text-muted-foreground">No regions available</div>
                            ) : (
                              regions.map((region: string) => (
                                <SelectItem key={region} value={region}>{region}</SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="district">District <span className="text-destructive">*</span></Label>
                        <Select
                          value={formData.district}
                          onValueChange={(value) => {
                            setFormData({ ...formData, district: value, traditionalAuthority: "", village: "" });
                            fetchTraditionalAuthorities(formData.region, value);
                          }}
                          disabled={!formData.region || loadingDistricts}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={loadingDistricts ? "Loading districts..." : !formData.region ? "Select a region first" : "Select district"} />
                            {loadingDistricts && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                          </SelectTrigger>
                          <SelectContent>
                            {loadingDistricts ? (
                              <div className="flex items-center justify-center py-4 text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                <span className="text-sm">Loading...</span>
                              </div>
                            ) : districts.length === 0 ? (
                              <div className="py-4 text-center text-sm text-muted-foreground">
                                {!formData.region ? "Select a region first" : "No districts available"}
                              </div>
                            ) : (
                              districts.map((district: string) => (
                                <SelectItem key={district} value={district}>{district}</SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="traditionalAuthority">
                          Traditional Authority <span className="text-destructive">*</span>
                          {formData.userType === 'caregiver' && <span className="text-xs text-muted-foreground ml-2">(Select multiple)</span>}
                        </Label>
                        {formData.userType === 'caregiver' ? (
                          // Multi-select for caregivers
                          <div className="border rounded-md p-3 max-h-40 overflow-y-auto space-y-2">
                            {loadingTAs ? (
                              <div className="flex items-center justify-center py-4 text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                <span className="text-sm">Loading TAs...</span>
                              </div>
                            ) : !formData.district ? (
                              <p className="text-sm text-muted-foreground">Select a district first</p>
                            ) : traditionalAuthorities.length === 0 ? (
                              <p className="text-sm text-muted-foreground">No TAs available</p>
                            ) : (
                              traditionalAuthorities.map((ta: string) => (
                                <div key={ta} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`ta-${ta}`}
                                    checked={Array.isArray(formData.traditionalAuthority) && formData.traditionalAuthority.includes(ta)}
                                    onCheckedChange={(checked) => {
                                      const currentTAs = Array.isArray(formData.traditionalAuthority) ? formData.traditionalAuthority : [];
                                      const newTAs = checked
                                        ? [...currentTAs, ta]
                                        : currentTAs.filter(t => t !== ta);
                                      setFormData({ ...formData, traditionalAuthority: newTAs, village: [] });
                                      // Fetch villages for all selected TAs
                                      if (newTAs.length > 0) {
                                        setLoadingVillages(true);
                                        Promise.all(newTAs.map(selectedTa =>
                                          api.get(`/locations/villages/${encodeURIComponent(formData.region)}/${encodeURIComponent(formData.district)}/${encodeURIComponent(selectedTa)}`)
                                        )).then(responses => {
                                          const allVillages = [...new Set(responses.flatMap(r => r.data.data || []))];
                                          setVillages(allVillages);
                                        }).catch(error => {
                                          console.error('Failed to fetch villages:', error);
                                          toast.error('Failed to load villages.');
                                        }).finally(() => {
                                          setLoadingVillages(false);
                                        });
                                      } else {
                                        setVillages([]);
                                      }
                                    }}
                                  />
                                  <label htmlFor={`ta-${ta}`} className="text-sm cursor-pointer">{ta}</label>
                                </div>
                              ))
                            )}
                          </div>
                        ) : (
                          // Single select for patients
                          <Select
                            value={formData.traditionalAuthority as string}
                            onValueChange={(value) => {
                              setFormData({ ...formData, traditionalAuthority: value, village: "" });
                              fetchVillages(formData.region, formData.district, value);
                            }}
                            disabled={!formData.district || loadingTAs}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={loadingTAs ? "Loading TAs..." : !formData.district ? "Select a district first" : "Select TA"} />
                              {loadingTAs && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                            </SelectTrigger>
                            <SelectContent>
                              {loadingTAs ? (
                                <div className="flex items-center justify-center py-4 text-muted-foreground">
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  <span className="text-sm">Loading...</span>
                                </div>
                              ) : traditionalAuthorities.length === 0 ? (
                                <div className="py-4 text-center text-sm text-muted-foreground">
                                  {!formData.district ? "Select a district first" : "No TAs available"}
                                </div>
                              ) : (
                                traditionalAuthorities.map((ta: string) => (
                                  <SelectItem key={ta} value={ta}>{ta}</SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="village">
                          Village <span className="text-destructive">*</span>
                          {formData.userType === 'caregiver' && <span className="text-xs text-muted-foreground ml-2">(Select multiple)</span>}
                        </Label>
                        {formData.userType === 'caregiver' ? (
                          // Multi-select for caregivers
                          <div className="border rounded-md p-3 max-h-40 overflow-y-auto space-y-2">
                            {loadingVillages ? (
                              <div className="flex items-center justify-center py-4 text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                <span className="text-sm">Loading villages...</span>
                              </div>
                            ) : (!Array.isArray(formData.traditionalAuthority) || formData.traditionalAuthority.length === 0) ? (
                              <p className="text-sm text-muted-foreground">Select at least one TA first</p>
                            ) : villages.length === 0 ? (
                              <p className="text-sm text-muted-foreground">No villages available</p>
                            ) : (
                              villages.map((village: string) => (
                                <div key={village} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`village-${village}`}
                                    checked={Array.isArray(formData.village) && formData.village.includes(village)}
                                    onCheckedChange={(checked) => {
                                      const currentVillages = Array.isArray(formData.village) ? formData.village : [];
                                      const newVillages = checked
                                        ? [...currentVillages, village]
                                        : currentVillages.filter(v => v !== village);
                                      setFormData({ ...formData, village: newVillages });
                                    }}
                                  />
                                  <label htmlFor={`village-${village}`} className="text-sm cursor-pointer">{village}</label>
                                </div>
                              ))
                            )}
                          </div>
                        ) : (
                          // Single select for patients
                          <Select
                            value={formData.village as string}
                            onValueChange={(value) => setFormData({ ...formData, village: value })}
                            disabled={!formData.traditionalAuthority || loadingVillages}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={loadingVillages ? "Loading villages..." : !formData.traditionalAuthority ? "Select a TA first" : "Select village"} />
                              {loadingVillages && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                            </SelectTrigger>
                            <SelectContent>
                              {loadingVillages ? (
                                <div className="flex items-center justify-center py-4 text-muted-foreground">
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  <span className="text-sm">Loading...</span>
                                </div>
                              ) : villages.length === 0 ? (
                                <div className="py-4 text-center text-sm text-muted-foreground">
                                  {!formData.traditionalAuthority ? "Select a TA first" : "No villages available"}
                                </div>
                              ) : (
                                villages.map((village: string) => (
                                  <SelectItem key={village} value={village}>{village}</SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a strong password"
                          className="pl-10 pr-10"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          type={showPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          className="pl-10"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="terms"
                        checked={formData.agreeTerms}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, agreeTerms: checked as boolean })
                        }
                        required
                      />
                      <label
                        htmlFor="terms"
                        className="text-sm text-muted-foreground cursor-pointer leading-tight"
                      >
                        I agree to the{" "}
                       
                        <button
                          type="button"
                          onClick={() => {
                            const termsRole = ['patient', 'child_patient', 'elderly_patient'].includes(formData.userType) ? 'patient' : formData.userType;
                            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                            window.open(`${apiUrl}/terms/${termsRole}/pdf`, '_blank');
                          }}
                          className="text-primary hover:underline"
                        >
                          Terms of Service and Privacy Policy
                        </button>
                      </label>
                    </div>
                  </div>
                )}

                {step === 4 && formData.userType === 'caregiver' && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        Set Your Availability
                        <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Add the days and times you're available to work. You can also set or update this later from your Schedule page.
                      </p>
                    </div>

                    <div className="space-y-2">
                      {regAvailability.map((slot, index) => (
                        <div key={index} className="flex flex-wrap items-center gap-2 p-3 border rounded-lg">
                          <select
                            value={slot.dayOfWeek}
                            onChange={(e) => updateAvailabilitySlot(index, 'dayOfWeek', parseInt(e.target.value))}
                            className="px-2 py-1.5 border rounded-md text-sm bg-background"
                          >
                            {AVAILABILITY_DAYS.map((day) => (
                              <option key={day.value} value={day.value}>{day.label}</option>
                            ))}
                          </select>
                          <Input
                            type="time"
                            value={slot.startTime}
                            onChange={(e) => updateAvailabilitySlot(index, 'startTime', e.target.value)}
                            className="w-28 h-8 text-sm"
                          />
                          <span className="text-muted-foreground text-sm">to</span>
                          <Input
                            type="time"
                            value={slot.endTime}
                            onChange={(e) => updateAvailabilitySlot(index, 'endTime', e.target.value)}
                            className="w-28 h-8 text-sm"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeAvailabilitySlot(index)}
                            className="h-8 w-8 shrink-0"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addAvailabilitySlot}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Time Slot
                    </Button>

                    {regAvailability.length === 0 && (
                      <p className="text-xs text-muted-foreground italic">
                        No availability added. You can skip this step and configure it later.
                      </p>
                    )}
                  </div>
                )}

                <div className="flex gap-3 mt-4">
                  {step > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 gap-2 h-9"
                      onClick={() => setStep(step - 1)}
                    >
                      <ArrowLeft className="h-3 w-3" />
                      Back
                    </Button>
                  )}
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-primary hover:opacity-90 gap-2 h-9"
                    disabled={isLoading}
                  >
                    {step < (formData.userType === 'caregiver' ? 4 : 3) ? (
                      <>
                        Continue
                        <ArrowRight className="h-3 w-3" />
                      </>
                    ) : isLoading ? (
                      "Creating account..."
                    ) : (
                      <>
                        Create Account
                        <ArrowRight className="h-3 w-3" />
                      </>
                    )}
                  </Button>
                </div>
              </form>

              <p className="text-center text-xs text-muted-foreground mt-4">
                Already have an account?{" "}
                <Link to="/login" className="text-primary font-medium hover:underline">
                  Sign in
                </Link>
              </p>
                </CardContent>
              </div>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
      
      <Dialog open={showRateCard} onOpenChange={setShowRateCard}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              CareConnect Rate Card
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Platform Commission</h3>
              <p className="text-sm text-muted-foreground mb-2">
                CareConnect charges a {platformCommission}% commission on all completed sessions.
              </p>
              <p className="text-xs text-muted-foreground">
                This covers platform maintenance, payment processing, and customer support.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Specialty Rates</h3>
              <div className="space-y-2">
                {specialties.map((specialty: any) => {
                  const sessionFee = parseFloat(specialty.sessionFee || 0);
                  const caregiverEarnings = sessionFee * (1 - platformCommission / 100);
                  
                  return (
                    <div key={specialty.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-sm">{specialty.name}</h4>
                        <div className="text-right">
                          <p className="text-sm font-semibold">MWK {sessionFee.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">Session Fee</p>
                        </div>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mb-3">
                        {specialty.description}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div className="bg-green-50 p-2 rounded">
                          <p className="font-medium text-green-800">Your Earnings</p>
                          <p className="text-green-600 font-semibold">
                            MWK {caregiverEarnings.toLocaleString()}
                          </p>
                          <p className="text-green-600 text-xs">
                            ({100 - platformCommission}% of session fee)
                          </p>
                        </div>
                        
                        <div className="bg-blue-50 p-2 rounded">
                          <p className="font-medium text-blue-800">Platform Fee</p>
                          <p className="text-blue-600 font-semibold">
                            MWK {(sessionFee - caregiverEarnings).toLocaleString()}
                          </p>
                          <p className="text-blue-600 text-xs">
                            ({platformCommission}% commission)
                          </p>
                        </div>
                      </div>
                      
                      {specialty.bookingFee && (
                        <div className="mt-2 pt-2 border-t">
                          <p className="text-xs text-muted-foreground">
                            Booking Fee: MWK {parseFloat(specialty.bookingFee).toLocaleString()} (paid by patient)
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">Important Notes</h4>
              <ul className="text-xs text-yellow-700 space-y-1">
                <li>• All fees are in Malawian Kwacha (MWK)</li>
                <li>• Commission is deducted from completed sessions only</li>
                <li>• Booking fees go directly to the platform</li>
                <li>• Payments are processed weekly to your account</li>
                <li>• Additional taxes may apply based on local regulations</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showTerms} onOpenChange={setShowTerms}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Terms and Conditions</DialogTitle>
          </DialogHeader>
          <div className="whitespace-pre-wrap text-sm">
            {termsContent}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Register;