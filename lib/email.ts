const EMAIL_API_URL=process.env.EMAIL_API_URL;
const EMAIL_API_KEY=process.env.EMAIL_API_KEY;
const EMAIL_FROM=process.env.EMAIL_FROM||"NARARYA GARAGE <no-reply@localhost>";

export function emailConfigured(){
  return Boolean(EMAIL_API_URL&&EMAIL_API_KEY&&EMAIL_FROM);
}

export async function sendEmail(input:{to:string;subject:string;text:string;html:string}){
  if(!emailConfigured())return false;
  const response=await fetch(EMAIL_API_URL!,{
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      Authorization:"Bearer "+EMAIL_API_KEY
    },
    body:JSON.stringify({
      from:EMAIL_FROM,
      to:input.to,
      subject:input.subject,
      text:input.text,
      html:input.html
    })
  });
  if(!response.ok)throw new Error("Email provider rejected the message");
  return true;
}
