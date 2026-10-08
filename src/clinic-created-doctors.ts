import { ProviderApiError } from "./provider-app";

export type ClinicCreatedDoctor={id:string;clinicId:string;doctorProfileId:string;accountId:string;displayName:string;email:string;mobileNumber:string;dateOfBirth:string;sex:"FEMALE"|"MALE"|"NON_BINARY"|"NOT_SPECIFIED";specialization:string;status:"PENDING"|"APPROVED"|"REJECTED";rejectionReason:string|null};

export function clinicCreatedDoctorError(cause:unknown){
  if(cause instanceof ProviderApiError){
    if(cause.status===401)return "Your provider session has expired. Sign in again.";
    if(cause.status===403)return "You are not permitted to create doctors for this clinic.";
    if(cause.status===409)return "This email is already in use, or your clinic has reached its configured doctor limit. Contact the platform administrator if you need additional capacity.";
    if(cause.status===400)return "Check the doctor details and try again.";
  }
  return cause instanceof Error?cause.message:"The doctor could not be created.";
}

export function platformStatus(status:ClinicCreatedDoctor["status"]){return status==="PENDING"?"Pending approval":status==="APPROVED"?"Approved":"Rejected";}
