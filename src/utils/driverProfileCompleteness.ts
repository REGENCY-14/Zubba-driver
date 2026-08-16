import type { DriverDetailsDto } from '../types/request.types';
import type { KycData, VehicleType } from '../slices/driverProfile/driverProfile.types';

const REQUIRED_DRIVER_FIELDS = [
  'ghana_card_number',
  'ghana_card_photo',
  'drivers_license_number',
  'drivers_license_photo',
  'vehicle_type',
  'vehicle_plate',
  'vehicle_photo',
  'profile_picture',
] as const satisfies readonly (keyof DriverDetailsDto)[];

export function isDriverProfileComplete(driver: DriverDetailsDto): boolean {
  return REQUIRED_DRIVER_FIELDS.every(field => Boolean(driver[field] && String(driver[field]).trim()));
}

export function toKycData(driver: DriverDetailsDto): KycData {
  return {
    ghanaCardNumber: driver.ghana_card_number ?? '',
    ghanaCardImage: driver.ghana_card_photo,
    driversLicenseNumber: driver.drivers_license_number ?? '',
    driversLicenseImage: driver.drivers_license_photo,
    vehicleType: (driver.vehicle_type as VehicleType) ?? 'tricycle',
    plateNumber: driver.vehicle_plate ?? '',
    vehiclePhoto: driver.vehicle_photo,
    profilePhoto: driver.profile_picture,
  };
}
