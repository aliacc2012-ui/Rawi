export type PlanId="free"|"creator"|"pro";

export type PlanConfig={
  id:PlanId;
  name:"Free"|"Creator"|"Pro";
  priceAed:number;
  storageBytes:number;
  activeGalleryLimit:number|null;
  availabilityDays:number|null;
  featured?:boolean;
  features:string[];
};

export const PLAN_CONFIG:Record<PlanId,PlanConfig>={
  free:{
    id:"free",
    name:"Free",
    priceAed:0,
    storageBytes:5*1024**3,
    activeGalleryLimit:3,
    availabilityDays:7,
    features:["5 GB storage","3 active galleries","7-day availability","RAWI branding"],
  },
  creator:{
    id:"creator",
    name:"Creator",
    priceAed:49,
    storageBytes:250*1024**3,
    activeGalleryLimit:null,
    availabilityDays:null,
    featured:true,
    features:["250 GB storage","Unlimited galleries","Custom branding","Password protection","Download analytics"],
  },
  pro:{
    id:"pro",
    name:"Pro",
    priceAed:129,
    storageBytes:1*1024**4,
    activeGalleryLimit:null,
    availabilityDays:null,
    features:["1 TB storage","Unlimited galleries","Custom branding","Password protection","Download analytics"],
  },
};

export const PLAN_ORDER:PlanId[]=["free","creator","pro"];
