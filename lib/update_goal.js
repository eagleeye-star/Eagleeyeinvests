/* EagleEyE — update-goal
   POST /api/update-goal
   Body: { goal }
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
    // Get user id from token
    const userRes=await fetch(`${SUPABASE_URL}/auth/v1/user`,{headers:{'apikey':SUPABASE_ANON_KEY,'Authorization':`Bearer ${token}`}});
    if(!userRes.ok) return {statusCode:401,headers,body:JSON.stringify({error:'Session expired.'})};
    const user=await userRes.json();
    const {goal}=JSON.parse(event.body);
    if(!goal||parseFloat(goal)<=0) return {statusCode:400,headers,body:JSON.stringify({error:'Goal must be a positive number.'})};
    const res=await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}`,{
      method:'PATCH',
      headers:{'Content-Type':'application/json','apikey':SUPABASE_ANON_KEY,'Authorization':`Bearer ${token}`,'Prefer':'return=minimal'},
      body:JSON.stringify({goal:parseFloat(goal)}),
    });
    if(!res.ok){const e=await res.text();return {statusCode:400,headers,body:JSON.stringify({error:'Could not update goal.'})};}
    return {statusCode:200,headers,body:JSON.stringify({success:true,goal:parseFloat(goal)})};
  }catch(err){
    return {statusCode:500,headers,body:JSON.stringify({error:'Server error.'})};
  }
};
