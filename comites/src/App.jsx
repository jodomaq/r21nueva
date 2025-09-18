import React, { useState } from 'react';
import Layout from './components/Layout';
import CommitteeForm from './components/CommitteeForm';
import CommitteeList from './components/CommitteeList';
import MemberList from './components/MemberList';
import AddMember from './components/AddMember';

export default function App() {
  const [view, setView] = useState('committees');
  const [selectedCommitteeId, setSelectedCommitteeId] = useState(null);
  return (
    <Layout onNavigate={setView}>
      {view === 'new' && (
        <CommitteeForm onCreated={() => setView('committees')} />
      )}
      {view === 'committees' && (
        <CommitteeList
          onOpenMembers={(committee) => {
            setSelectedCommitteeId(committee.id);
            setView('members');
          }}
        />
      )}
      {view === 'members' && selectedCommitteeId != null && (
        <MemberList
          committeeId={selectedCommitteeId}
          onBack={() => setView('committees')}
          onAddMember={() => setView('addMember')}
        />
      )}
      {view === 'addMember' && selectedCommitteeId != null && (
        <AddMember
          committeeId={selectedCommitteeId}
          onAdded={() => setView('members')}
          onCancel={() => setView('members')}
        />
      )}
    </Layout>
  );
}