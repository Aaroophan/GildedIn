import type {Metadata} from 'next';
import type {ReactNode} from 'react';
import {requireOwnerPage} from '@/server/owner/context.ts';
import {OwnerShell} from '@/ui/owner/shell.tsx';
export const dynamic='force-dynamic';
export const metadata:Metadata={title:{default:'Owner dashboard',template:'%s | GildedIn'},robots:{index:false,follow:false}};
export default async function DashboardLayout({children}:{children:ReactNode}){
  const ctx=await requireOwnerPage();
  return <OwnerShell ctx={ctx}>{children}</OwnerShell>;
}
