/* EagleEyE — get-history
   GET /api/get-history
   Returns portfolio_history rows for the logged-in user
*/
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

module.exports = async (event) => {
  const headers = { 'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type,Authorization','Content-Type':'application/json' };
  if(event.httpMethod==='OPTIONS') return {statusCode:200,headers,body:''};
  const token=(event.headers.authorization||'').replace('Bearer ','').trim();
  if(!token) return {statusCode:401,headers,body:JSON.stringify({error:'Not authenticated.'})};
  try{
    const res=await fetch(`${SUPABASE_URL}/rest/v1/portfolio_history?select=*&order=snapshot_date.asc`,{
      headers:{'apikey':SUPABASE_ANON_KEY,'Authorization':`Bearer ${token}`},
    });
    const data=await res.json();
    if(!res.ok) return {statusCode:400,headers,body:JSON.stringify({error:'Could not fetch history.'})};
    return {statusCode:200,headers,body:JSON.stringify({history:data})};
  }catch(err){
    return {statusCode:500,headers,body:JSON.stringify({error:'Server error.'})};
  }
};
