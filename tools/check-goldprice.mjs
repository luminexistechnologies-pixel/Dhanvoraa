const url='https://data-asg.goldprice.org/dbXRates/INR';
try{
 const response=await fetch(url,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(10000)});
 const body=await response.text();console.log(JSON.stringify({url,status:response.status,type:response.headers.get('content-type'),date:response.headers.get('date'),body:body.slice(0,1800)}));
}catch(error){console.log(JSON.stringify({error:error.message,cause:error.cause?.code}));process.exitCode=1;}
