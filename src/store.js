import {seedServices} from './data.js';
export function read(key, fallback=null){try{return JSON.parse(localStorage.getItem(key)) ?? fallback}catch{return fallback}}
export function save(key,value){localStorage.setItem(key,JSON.stringify(value))}
export const money=n=>'₹'+Number(n).toLocaleString('en-IN');
export const services=()=>read('travease_services',seedServices);
export const types={train:'Trains',flight:'Flights',bus:'Buses',hotel:'Hotels'};
export const bookings=()=>read('travease_bookings',[]);
export const seatKey=s=>'travease_bookedSeats_'+s.id;

// Local demo accounts are kept separately from the active login session.
const accountKey='travease_accounts';
const normalizeId=id=>id.trim().toLowerCase();
const hex=bytes=>Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
async function passwordHash(pass,salt){
  const encoder=new TextEncoder();
  const key=await crypto.subtle.importKey('raw',encoder.encode(pass),'PBKDF2',false,['deriveBits']);
  const bits=await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:encoder.encode(salt),iterations:100000},key,256);
  return hex(new Uint8Array(bits));
}
export async function registerAccount({name,id,pass}){
  id=normalizeId(id);
  name=name.trim();
  if(!name||!id||!pass)throw new Error('Please complete all fields.');
  if(id==='admin'||id==='user@travease.com')throw new Error('This ID is reserved. Please use another mobile number or email.');
  if(read(accountKey,[]).some(a=>a.id===id))throw new Error('An account already exists. Please log in.');
  const salt=hex(crypto.getRandomValues(new Uint8Array(16)));
  const hash=await passwordHash(pass,salt);
  const accounts=read(accountKey,[]);
  if(accounts.some(a=>a.id===id))throw new Error('An account already exists. Please log in.');
  save(accountKey,[...accounts,{name,id,salt,hash}]);
  return {name,id,role:'user'};
}
export async function authenticateAccount(id,pass){
  id=normalizeId(id);
  if(id==='admin'&&pass==='admin123')return {name:'Admin',id,role:'admin'};
  if(id==='user@travease.com'&&pass==='1234')return {name:'Traveller',id,role:'user'};
  const account=read(accountKey,[]).find(a=>a.id===id);
  if(account&&await passwordHash(pass,account.salt)===account.hash)return {name:account.name,id,role:'user'};
  throw new Error('Invalid mobile/email or password.');
}
