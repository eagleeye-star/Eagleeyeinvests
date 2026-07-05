/* EagleEyE — delete-holding
   DELETE /api/delete-holding
   Body: { holding_id }
*/
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

module.exports = async (event) => {
  const headers = { 'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type,Authorization','Content-Type':'application/json' };
  if(event.httpMethod==='OPTIONS') return {statusCode:200,headers,body:''};
  if(event.httpMethod!=='DELETE'&&event.httpMethod!=='POST') return {statusCode:405,headers,body:JSON.stringify({error:'Method not allowed'})};
  const token=(event.headers.authorization||'').replace('Bearer ','').trim();
  if(!token) return {statusCode:401,headers,body:JSON.stringify({error:'Not authenticated.'})};
  try{
    const {holding_id}=JSON.parse(event.body);
    if(!holding_id) return {statusCode:400,headers,body:JSON.stringify({error:'holding_id required.'})};
    // Verify user owns this holding via RLS
    const res=await fetch(`${SUPABASE_URL}/rest/v1/holdings?id=eq.${holding_id}`,{
      method:'DELETE',
      headers:{'apikey':SUPABASE_ANON_KEY,'Authorization':`Bearer ${token}`,'Prefer':'return=minimal'},
    });
    if(!res.ok){const e=await res.json();return {statusCode:400,headers,body:JSON.stringify({error:e.message||'Could not delete holding.'})};}
    return {statusCode:200,headers,body:JSON.stringify({success:true})};
  }catch(err){
    return {statusCode:500,headers,body:JSON.stringify({error:'Server error.'})};
  }
};
