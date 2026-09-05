const base=(process.env.RAWI_BASE_URL||"https://rawi-five.vercel.app").replace(/\/$/,"");
const checks=[
  {name:"Home",path:"/",expect:[200]},
  {name:"Login",path:"/login",expect:[200]},
  {name:"Protected dashboard",path:"/dashboard",expect:[200,307,308]},
  {name:"Protected projects",path:"/projects",expect:[200,307,308]},
  {name:"Protected settings",path:"/settings",expect:[200,307,308]},
  {name:"Monitoring endpoint method guard",path:"/api/client-error",method:"GET",expect:[400,404,405]},
];
let failed=0;
for(const check of checks){const started=performance.now();try{const response=await fetch(`${base}${check.path}`,{method:check.method||"GET",redirect:"manual",headers:{"user-agent":"RAWI-production-smoke/1.0"}});const ms=Math.round(performance.now()-started);const ok=check.expect.includes(response.status);console.log(`${ok?"✓":"✗"} ${check.name}: ${response.status} (${ms} ms)`);if(!ok)failed++}catch(error){failed++;console.error(`✗ ${check.name}: ${error instanceof Error?error.message:String(error)}`)}}
if(failed){console.error(`\n${failed} smoke check${failed===1?"":"s"} failed.`);process.exit(1)}
console.log(`\nAll ${checks.length} RAWI production smoke checks passed.`);
