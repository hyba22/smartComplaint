import React from 'react';
import ConseillerSidebar from 'app/shared/layout/sidebar/conseiller-sidebar';
import DeadlineAnimation from 'app/shared/components/deadline-animation/deadline-animation';

const ConseillerPlanning = () => (
  <div className="flex min-h-screen bg-slate-100">
    <ConseillerSidebar />
    <main className="flex flex-1 items-center justify-center ml-[280px] p-6">
      <DeadlineAnimation initialDays={5} animationSpeed={1.5} />
    </main>
  </div>
);

export default ConseillerPlanning;
