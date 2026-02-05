// app/admin/providers/view/[id]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import withAuth from '@/app/(main)/authGuard';
import ProviderViewPage from '@/app/(main)/components/admin/ProviderViewPage';

const ViewProviderPage = () => {
  const params = useParams();
  const providerId = params?.id ? parseInt(params.id as string) : 0;
  
  if (!providerId) {
    return <div>Provider ID not found</div>;
  }
  
  return <ProviderViewPage providerId={providerId} />;
};

export default withAuth(ViewProviderPage);