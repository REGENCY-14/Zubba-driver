export type ApplicationStatus = 'not_submitted' | 'pending_review' | 'approved' | 'rejected';
export type VehicleType = 'tricycle' | 'motorbike' | 'van' | 'truck';

export interface KycData {
  ghanaCardNumber: string;
  ghanaCardImage: string | null;
  driversLicenseNumber: string;
  driversLicenseImage: string | null;
  vehicleType: VehicleType;
  plateNumber: string;
  vehiclePhoto: string | null;
  profilePhoto: string | null;
}

export interface DriverProfileState {
  applicationStatus: ApplicationStatus;
  rejectionReason: string | null;
  kyc: KycData | null;
  termsAcceptedAt: string | null;
}
