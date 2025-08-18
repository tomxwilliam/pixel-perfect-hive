import React from 'react';
import { SupportDashboard } from '@/components/support/SupportDashboard';
import Seo from '@/components/Seo';

const Support = () => {
  return (
    <>
      <Seo 
        title="Support Center - 404 Code Lab"
        description="Professional support system for 404 Code Lab customers. Create tickets, track progress, and get help with your projects."
      />
      <SupportDashboard />
    </>
  );
};

export default Support;