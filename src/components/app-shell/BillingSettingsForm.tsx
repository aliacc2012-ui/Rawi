"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function BillingSettingsForm({workspaceId,initialDays}:{workspaceId:string;initialDays:number}){
  const [days,setDays]=useState(initialDays);const [saving,setSaving]=useState(false);const [message,setMessage]=useState("");
  async function save(){setSaving(true);setMessage("");const value=Math.max(1,Math.min(30,Number(days)||3));const supabase=createClient();const{error}=await supabase.from("workspaces").update({renewal_reminder_days:value}).eq("id",workspaceId);setSaving(false);if(error){setMessage("Couldn't save. Please try again.");return}setDays(value);setMessage("Saved");}
  return <div className="bg-white border border-gray-200 rounded-[22px] p-5 md:p-6 shadow-sm"><h2 className="text-xl font-bold">Billing settings</h2><p className="text-sm text-gray-400 mt-1">Control when Creator and Pro customers see their renewal reminder.</p><div className="mt-6 max-w-sm"><label className="block text-xs font-extrabold uppercase tracking-wide mb-2">Renewal reminder</label><div className="flex items-center gap-3"><input type="number" min={1} max={30} value={days} onChange={e=>setDays(Number(e.target.value))} className="w-24 rounded-xl border border-gray-200 px-4 py-3 font-bold outline-none focus:border-black"/><span className="text-sm text-gray-500">days before expiry</span></div><p className="text-xs text-gray-400 mt-2">Allowed range: 1–30 days. Free accounts are not affected.</p><button type="button" onClick={save} disabled={saving} className="mt-5 rounded-full bg-black text-white px-6 py-3 text-sm font-extrabold disabled:opacity-50">{saving?"Saving…":"Save billing settings"}</button>{message&&<span className={`ml-3 text-sm ${message==="Saved"?"text-emerald-600":"text-red-600"}`}>{message}</span>}</div></div>;
}
