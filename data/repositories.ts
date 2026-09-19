export type ManagedRepository={fullName:string,name:string,purpose:string,visibility:"public"|"private",sync:string[]};
export const managedRepositories:ManagedRepository[]=[
{fullName:"nararyajayautamagroub/nararyagarage-website",name:"NARARYA GARAGE Website",purpose:"Community website, member, event, modding, showcase",visibility:"public",sync:["content","commits","issues","actions"]},
{fullName:"nararyajayautamagroub/nararyastudio-website",name:"NARARYA STUDIO Website",purpose:"Digital creative studio, products and services",visibility:"public",sync:["content","commits","issues","actions"]},
{fullName:"nararyajayautamagroub/narasacakraperwana-website",name:"NARASA CAKRA PERWANA Website",purpose:"PO/community simulator ecosystem",visibility:"public",sync:["content","commits","issues","actions"]},
{fullName:"nararyajayautamagroub/nexovonarsacorporation-website",name:"NEXOVONARSA CORPORATION Website",purpose:"Corporate headquarters and project control center",visibility:"public",sync:["content","commits","issues","actions"]},
{fullName:"nararyajayautamagroub/nararya-customer-service-platform",name:"NARARYA Customer Service Platform",purpose:"Customer service and business automation",visibility:"private",sync:["content","commits","issues","actions"]},
{fullName:"nararyajayautamagroub/nararya-bot-discord",name:"NARARYA Discord Bot",purpose:"Discord community automation",visibility:"public",sync:["content","commits","issues","actions"]},
{fullName:"nararyajayautamagroub/modbussid-converter",name:"Mod BUSSID Converter",purpose:"BUSSID mod conversion tooling",visibility:"public",sync:["content","commits","issues","actions"]}
];