import type {NextConfig} from "next";

const isDevelopment=process.env.NODE_ENV!=="production";

const securityHeaders=[
  {key:"X-Content-Type-Options",value:"nosniff"},
  {key:"Referrer-Policy",value:"strict-origin-when-cross-origin"},
  {key:"X-Frame-Options",value:"DENY"},
  {key:"Permissions-Policy",value:"camera=(), microphone=(), geolocation=()"},
  {key:"Cross-Origin-Opener-Policy",value:"same-origin"},
  {key:"Cross-Origin-Resource-Policy",value:"same-site"},
  {key:"Content-Security-Policy",value:[
    "default-src 'self'",
    "img-src 'self' data: https:",
    "media-src 'self' https:",
    "style-src 'self' 'unsafe-inline'",
    `script-src 'self' 'unsafe-inline'${isDevelopment?" 'unsafe-eval'":""}`,
    "connect-src 'self' https:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join("; ")+";"},
  ...(isDevelopment?[]:[{key:"Strict-Transport-Security",value:"max-age=31536000; includeSubDomains"}])
];

const nextConfig:NextConfig={
  reactStrictMode:true,
  poweredByHeader:false,
  async headers(){
    return [{source:"/(.*)",headers:securityHeaders}];
  }
};

export default nextConfig;
