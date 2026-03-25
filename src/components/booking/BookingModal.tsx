import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Video, MapPin, CreditCard, Smartphone, Loader2, CheckCircle2 } from 'lucide-react';
import { timeSlotService, TimeSlot } from '@/services/timeSlotService';
import { appointmentService } from '@/services/appointmentService';
import { paymentService, FeePreview } from '@/services/paymentService';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

type PaymentMethod = 'card' | 'mobile_money';

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  caregiverId: number;
  caregiverName: string;
  specialties: any[];
}

export const BookingModal = ({ open, onClose, caregiverId, caregiverName, specialties }: BookingModalProps) => {
  const today = new Date();
  const currentMonth = String(today.getMonth() + 1);
  const currentYear = String(today.getFullYear());
  const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD

  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mobile_money');
  const [sessionType, setSessionType] = useState<'teleconference' | 'in_person'>('teleconference');
  const [specialty, setSpecialty] = useState<any>(specialties?.[0] || null);
  const [feePreview, setFeePreview] = useState<FeePreview | null>(null);
  const [loadingFees, setLoadingFees] = useState(false);
  const [searchDay, setSearchDay] = useState('');
  const [searchMonth, setSearchMonth] = useState(currentMonth);
  const [searchYear, setSearchYear] = useState(currentYear);
  const [searchDate, setSearchDate] = useState(''); // YYYY-MM-DD from date picker
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (open && caregiverId) {
      fetchAvailableSlots('', currentMonth, currentYear);
      setSpecialty(specialties?.[0] || null);
      setSelectedSlot(null);
      setSearchDay('');
      setSearchMonth(currentMonth);
      setSearchYear(currentYear);
      setSearchDate('');
    }
  }, [open, caregiverId]);

  useEffect(() => {
    if (!specialty?.id) return;
    setLoadingFees(true);
    paymentService.getFeePreview({ paymentMethod, specialtyId: specialty.id, feeType: 'booking_fee' })
      .then(setFeePreview)
      .catch(() => setFeePreview(null))
      .finally(() => setLoadingFees(false));
  }, [paymentMethod, specialty?.id]);

  const fetchAvailableSlots = async (day: string, month: string, year: string, date = '') => {
    setLoading(true);
    try {
      const params: { caregiverId: number; day?: number; month?: number; year?: number; date?: string } = { caregiverId };
      if (date) {
        // date picker gives YYYY-MM-DD — send as exact date
        params.date = date;
      } else {
        if (day) params.day = Number(day);
        if (month) params.month = Number(month);
        if (year) params.year = Number(year);
      }
      const available = await timeSlotService.getAvailableSlots(params);
      const now = new Date();
      setSlots(available.filter((s: TimeSlot) => new Date(`${s.date} ${s.startTime}`) > now).slice(0, 50));
    } catch {
      toast.error('Failed to load available slots');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => fetchAvailableSlots(searchDay, searchMonth, searchYear, searchDate), 300);
    return () => clearTimeout(timer);
  }, [searchDate, searchDay, searchMonth, searchYear, open]);

  const handleBookSlot = async () => {
    if (!selectedSlot) return;
    if (!isAuthenticated) { toast.error('Please login to book'); onClose(); return; }
    setBooking(true);
    try {
      await timeSlotService.lockSlot(selectedSlot.id);
      const res = await appointmentService.createAppointment({
        timeSlotId: selectedSlot.id,
        specialtyId: specialty.id,
        sessionType,
        paymentMethod
      });
      if (res.checkoutUrl) { onClose(); window.location.href = res.checkoutUrl; }
      else throw new Error('Payment URL not received');
    } catch (error: any) {
      toast.error(error.response?.data?.error || error.message || 'Booking failed');
      try { await timeSlotService.unlockSlot(selectedSlot.id); } catch {}
    } finally {
      setBooking(false);
    }
  };

  const slotsByDate = slots.reduce((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = [];
    acc[slot.date].push(slot);
    return acc;
  }, {} as Record<string, TimeSlot[]>);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-full max-h-[95vh] overflow-y-auto p-0 sm:max-w-lg mx-2 sm:mx-auto">

        {/* Header */}
        <DialogHeader className="px-4 sm:px-5 pt-4 sm:pt-5 pb-3 sm:pb-4 border-b">
          <DialogTitle className="text-base font-semibold">Book with {caregiverName}</DialogTitle>
          {specialty && <p className="text-xs text-muted-foreground mt-0.5">{specialty.name}</p>}
        </DialogHeader>

        <div className="px-4 sm:px-5 py-4 space-y-4 sm:space-y-5">

          {/* Specialty pills */}
          {specialties.length > 1 && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Specialty</p>
              <div className="flex flex-wrap gap-2">
                {specialties.map((sp: any) => (
                  <button
                    key={sp.id}
                    onClick={() => { setSpecialty(sp); setSelectedSlot(null); }}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      specialty?.id === sp.id
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border hover:border-primary/50 text-muted-foreground'
                    }`}
                  >
                    {sp.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Date filter */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Filter by Date</p>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={searchDate}
                min={todayStr}
                onChange={e => { setSearchDate(e.target.value); setSearchDay(''); setSearchMonth(''); setSearchYear(''); }}
                className="flex-1 h-9 px-3 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {searchDate && (
                <button
                  onClick={() => { setSearchDate(''); setSearchDay(''); setSearchMonth(currentMonth); setSearchYear(currentYear); }}
                  className="text-xs text-muted-foreground hover:text-foreground underline whitespace-nowrap"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Time slot list — own loading state */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Select Time Slot</p>
              {loading
                ? <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                : <p className="text-xs text-muted-foreground">Tap a slot to select</p>
              }
            </div>
            <div className="max-h-72 sm:max-h-80 overflow-y-auto border rounded-lg divide-y">
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : slots.length === 0 ? (
                <div className="text-center py-10">
                  <Calendar className="h-7 w-7 mx-auto text-muted-foreground opacity-40 mb-2" />
                  <p className="text-sm font-medium">No slots found</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {(searchDay || searchMonth || searchYear) ? 'Try a different date filter' : 'No upcoming availability'}
                  </p>
                </div>
              ) : (
                Object.entries(slotsByDate).map(([date, dateSlots]) => (
                  <div key={date}>
                    <div className="px-3 py-1.5 bg-muted/40 sticky top-0">
                      <p className="text-xs font-semibold text-muted-foreground">
                        {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    {(dateSlots as TimeSlot[]).map(slot => (
                      <button
                        key={slot.id}
                        onClick={() => setSelectedSlot(slot)}
                        className={`w-full flex items-center justify-between px-3 py-3 sm:py-2.5 text-left transition-colors border-t first:border-t-0 ${
                          selectedSlot?.id === slot.id ? 'bg-primary/10' : 'hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Clock className={`h-3.5 w-3.5 flex-shrink-0 ${selectedSlot?.id === slot.id ? 'text-primary' : 'text-muted-foreground'}`} />
                          <span className={`text-sm font-medium ${selectedSlot?.id === slot.id ? 'text-primary' : ''}`}>
                            {slot.startTime.slice(0, 5)} – {slot.endTime.slice(0, 5)}
                          </span>
                          <span className="text-xs text-muted-foreground">{slot.duration || 180} min</span>
                        </div>
                        <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          selectedSlot?.id === slot.id ? 'border-primary bg-primary' : 'border-muted-foreground/40'
                        }`}>
                          {selectedSlot?.id === slot.id && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                        </div>
                      </button>
                    ))}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Rest of form — only shown after slot selected */}
          {selectedSlot && specialty && (
            <>
              {/* Selected slot summary */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm">
                <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="font-medium">
                  {new Date(selectedSlot.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  {' · '}{selectedSlot.startTime.slice(0, 5)} – {selectedSlot.endTime.slice(0, 5)}
                </span>
                <Badge variant="secondary" className="ml-auto text-xs">{selectedSlot.duration || 180} min</Badge>
              </div>

              {/* Session type */}
              <div className="space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Session Type</p>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { value: 'teleconference' as const, label: 'Video Call', icon: Video, desc: 'Online' },
                    { value: 'in_person' as const, label: 'In-Person', icon: MapPin, desc: 'Face-to-face' },
                  ]).map(({ value, label, icon: Icon, desc }) => (
                    <button
                      key={value}
                      onClick={() => setSessionType(value)}
                      className={`flex items-center gap-2 p-2.5 rounded-lg border-2 text-left transition-colors ${
                        sessionType === value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                      }`}
                    >
                      <Icon className={`h-4 w-4 flex-shrink-0 ${sessionType === value ? 'text-primary' : 'text-muted-foreground'}`} />
                      <div>
                        <p className="text-xs font-semibold">{label}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment method */}
              <div className="space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Payment Method</p>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { value: 'mobile_money' as const, label: 'M-PESA', icon: Smartphone },
                    { value: 'card' as const, label: 'Card', icon: CreditCard },
                  ]).map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => setPaymentMethod(value)}
                      className={`flex items-center gap-2 p-2.5 rounded-lg border-2 transition-colors ${
                        paymentMethod === value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                      }`}
                    >
                      <Icon className={`h-4 w-4 flex-shrink-0 ${paymentMethod === value ? 'text-primary' : 'text-muted-foreground'}`} />
                      <p className="text-xs font-semibold">{label}</p>
                      {paymentMethod === value && <CheckCircle2 className="h-3.5 w-3.5 text-primary ml-auto" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fee summary */}
              <div className="rounded-lg border overflow-hidden text-sm">
                <div className="p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">Pay Now</span>
                    <Badge variant="outline" className="text-xs text-green-600 border-green-300 h-5">Booking fee</Badge>
                  </div>
                  {loadingFees ? (
                    <div className="flex items-center gap-2 py-1">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Calculating...</span>
                    </div>
                  ) : feePreview ? (
                    <>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Booking fee</span>
                        <span>KES {Number(feePreview.baseFee).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Transaction cost</span>
                        <span>KES {Number(feePreview.convenienceFee).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-semibold pt-1 border-t">
                        <span>Total</span>
                        <span className="text-primary">KES {Number(feePreview.totalAmount).toLocaleString()}</span>
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground">Unable to load fees</p>
                  )}
                </div>
                <div className="p-3 border-t bg-muted/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">Pay After Session</span>
                    <Badge variant="outline" className="text-xs text-blue-600 border-blue-300 h-5">Session fee</Badge>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Session fee</span>
                    <span>KES {Number(specialty.sessionFee || 0).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">+ transaction cost at time of payment</p>
                </div>
              </div>

              {/* CTA */}
              <div className="space-y-2 pb-1">
                <Button
                  className="w-full h-10 font-semibold"
                  onClick={handleBookSlot}
                  disabled={booking || loadingFees || !feePreview}
                >
                  {booking ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" />Processing...</>
                  ) : (
                    <>
                      {paymentMethod === 'card' ? <CreditCard className="h-4 w-4 mr-2" /> : <Smartphone className="h-4 w-4 mr-2" />}
                      Pay KES {feePreview ? Number(feePreview.totalAmount).toLocaleString() : '...'} via {paymentMethod === 'card' ? 'Card' : 'M-PESA'}
                    </>
                  )}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Redirects to Paystack · Session fee collected after your appointment
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
