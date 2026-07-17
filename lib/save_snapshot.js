/* EagleEyE — save-snapshot
   POST /api/save-snapshot
   Body: { value }  (total portfolio value today)
   Saves or updates today's snapshot in portfolio_history
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
    const userRes=await fetch(`${SUPABASE_URL}/auth/v1/user`,{headers:{'apikey':SUPABASE_ANON_KEY,'Authorization':`Bearer ${token}`}});
    if(!userRes.ok) return {statusCode:401,headers,body:JSON.stringify({error:'Session expired.'})};
    const user=await userRes.json();
    const {value}=JSON.parse(event.body);
    if(!value||parseFloat(value)<0) return {statusCode:400,headers,body:JSON.stringify({error:'Value required.'})};
    const today=new Date().toISOString().split('T')[0];
    // Upsert — update today's snapshot if it exists, otherwise insert
    const res=await fetch(`${SUPABASE_URL}/rest/v1/portfolio_history`,{
      method:'POST',
      headers:{'Content-Type':'application/json','apikey':SUPABASE_ANON_KEY,'Authorization':`Bearer ${token}`,'Prefer':'resolution=merge-duplicates,return=minimal'},
      body:JSON.stringify({user_id:user.id,snapshot_date:today,value:parseFloat(value)}),
    });
    if(!res.ok){const e=await res.text();return {statusCode:400,headers,body:JSON.stringify({error:'Could not save snapshot.'})};}
    return {statusCode:200,headers,body:JSON.stringify({success:true,date:today,value:parseFloat(value)})};
  }catch(err){
    return {statusCode:500,headers,body:JSON.stringify({error:'Server error.'})};
  }
};
