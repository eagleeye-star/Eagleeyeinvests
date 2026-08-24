/* EagleEyE — alerts
   GET  /api/alerts          → list user's alerts
   POST /api/alerts          → create alert { ticker, alert_type, target_price }
   Body for DELETE: { alert_id }
*/
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

module.exports = async (event) => {
  const headers = { 'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type,Authorization','Content-Type':'application/json' };
  if(event.httpMethod==='OPTIONS') return {statusCode:200,headers,body:''};
  const token=(event.headers.authorization||'').replace('Bearer ','').trim();
  if(!token) return {statusCode:401,headers,body:JSON.stringify({error:'Not authenticated.'})};

  try{
    // GET — list alerts
    if(event.httpMethod==='GET'){
      const res=await fetch(`${SUPABASE_URL}/rest/v1/price_alerts?select=*&order=created_at.desc`,{
        headers:{'apikey':SUPABASE_ANON_KEY,'Authorization':`Bearer ${token}`},
      });
      const data=await res.json();
      return {statusCode:200,headers,body:JSON.stringify({alerts:Array.isArray(data)?data:[]})};
    }

    // POST — create alert
    if(event.httpMethod==='POST'){
      const userRes=await fetch(`${SUPABASE_URL}/auth/v1/user`,{headers:{'apikey':SUPABASE_ANON_KEY,'Authorization':`Bearer ${token}`}});
      if(!userRes.ok) return {statusCode:401,headers,body:JSON.stringify({error:'Session expired.'})};
      const user=await userRes.json();
      const {ticker,alert_type,target_price}=JSON.parse(event.body);
      if(!ticker||!alert_type||!target_price) return {statusCode:400,headers,body:JSON.stringify({error:'ticker, alert_type and target_price required.'})};
      if(!['above','below'].includes(alert_type)) return {statusCode:400,headers,body:JSON.stringify({error:'alert_type must be "above" or "below".'})};
      if(parseFloat(target_price)<=0) return {statusCode:400,headers,body:JSON.stringify({error:'Target price must be positive.'})};
      const res=await fetch(`${SUPABASE_URL}/rest/v1/price_alerts`,{
        method:'POST',
        headers:{'Content-Type':'application/json','apikey':SUPABASE_ANON_KEY,'Authorization':`Bearer ${token}`,'Prefer':'return=representation'},
        body:JSON.stringify({user_id:user.id,ticker:ticker.toUpperCase(),alert_type,target_price:parseFloat(target_price),is_active:true}),
      });
      const data=await res.json();
      if(!res.ok) return {statusCode:400,headers,body:JSON.stringify({error:'Could not create alert.'})};
      return {statusCode:201,headers,body:JSON.stringify({success:true,alert:data[0]})};
    }

    // DELETE — remove alert
    if(event.httpMethod==='DELETE'){
      const {alert_id}=JSON.parse(event.body);
      if(!alert_id) return {statusCode:400,headers,body:JSON.stringify({error:'alert_id required.'})};
      await fetch(`${SUPABASE_URL}/rest/v1/price_alerts?id=eq.${alert_id}`,{
        method:'DELETE',
        headers:{'apikey':SUPABASE_ANON_KEY,'Authorization':`Bearer ${token}`,'Prefer':'return=minimal'},
      });
      return {statusCode:200,headers,body:JSON.stringify({success:true})};
    }

    return {statusCode:405,headers,body:JSON.stringify({error:'Method not allowed'})};
  }catch(err){
    return {statusCode:500,headers,body:JSON.stringify({error:'Server error.'})};
  }
};
