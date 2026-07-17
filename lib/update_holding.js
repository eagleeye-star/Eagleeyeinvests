/* EagleEyE — update-holding
   POST /api/update-holding
   Body: { holding_id, shares, avg_cost }
*/
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

module.exports = async (event) => {
  const headers = { 'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type,Authorization','Content-Type':'application/json' };
  if(event.httpMethod==='OPTIONS') return {statusCode:200,headers,body:''};
  if(event.httpMethod!=='POST') return {statusCode:405,headers,body:JSON.stringify({error:'Method not allowed'})};
  const token=(event.headers.authorization||'').replace('Bearer ','').trim();
  if(!token) return {statusCode:401,headers,body:JSON.stringify({error:'Not authenticated.'})};
  try{
    const {holding_id,shares,avg_cost}=JSON.parse(event.body);
    if(!holding_id||!shares||!avg_cost) return {statusCode:400,headers,body:JSON.stringify({error:'holding_id, shares and avg_cost required.'})};
    if(parseFloat(shares)<=0) return {statusCode:400,headers,body:JSON.stringify({error:'Shares must be greater than 0.'})};
    if(parseFloat(avg_cost)<=0) return {statusCode:400,headers,body:JSON.stringify({error:'Average cost must be greater than 0.'})};
    const res=await fetch(`${SUPABASE_URL}/rest/v1/holdings?id=eq.${holding_id}`,{
      method:'PATCH',
      headers:{'Content-Type':'application/json','apikey':SUPABASE_ANON_KEY,'Authorization':`Bearer ${token}`,'Prefer':'return=representation'},
      body:JSON.stringify({shares:parseFloat(shares),avg_cost:parseFloat(avg_cost)}),
    });
    const data=await res.json();
    if(!res.ok) return {statusCode:400,headers,body:JSON.stringify({error:data.message||'Could not update holding.'})};
    return {statusCode:200,headers,body:JSON.stringify({success:true,holding:data[0]})};
  }catch(err){
    return {statusCode:500,headers,body:JSON.stringify({error:'Server error.'})};
  }
};
