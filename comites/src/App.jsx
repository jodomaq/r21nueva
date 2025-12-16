import React, { useEffect, useMemo, useState } from 'react';
import Layout from './components/Layout';
import CommitteeForm from './components/CommitteeForm';
import CommitteeList from './components/CommitteeList';
import MemberList from './components/MemberList';
import AddMember from './components/AddMember';
import AdminDashboard from './components/AdminDashboard';
import { useAuth } from './AuthContext';

export default function App() {
  const [view, setView] = useState('committees');
  const [selectedCommitteeId, setSelectedCommitteeId] = useState(null);
  const { assignment } = useAuth();

  const role = assignment?.role ?? null;
  const ownedCommitteeId = useMemo(() => assignment?.committees_owned?.[0]?.id ?? null, [assignment]);

  // If role is 6 (PRESIDENTE_COMITE): force member management of their own committee
  useEffect(() => {
    if (role === 6) {
      if (ownedCommitteeId) {
        setSelectedCommitteeId(ownedCommitteeId);
        setView('members');
      } else {
        // No committee created yet: they cannot create committees per requirement; show a friendly message via committees list disabled
        setView('committees');
      }
    }
  }, [role, ownedCommitteeId]);

  //const canManageMembers = role === 6 && !!ownedCommitteeId;
  const canManageMembers = true; // all roles can manage members
  const canCreateCommittees = role !== 6; // others can capture committees but not members
  return (
    <Layout onNavigate={(next) => {
      // Enforce access rules on navigation
      if (next === 'new' && !canCreateCommittees) {
        // ignore; presidents cannot create committees
        return;
      }
      if (next === 'committees') {
        setView('committees');
        return;
      }
      setView(next);
    }}>
      {view === 'new' && canCreateCommittees && (
        <CommitteeForm onCreated={() => setView('committees')} />
      )}
      {view === 'committees' && (
        <CommitteeList
          canCreate={canCreateCommittees}
          canOpenMembers={canManageMembers}
          onOpenMembers={(committee) => {
            if (canManageMembers) {
              // only open if it's their own committee
              const committeeId = committee.id;
              if (committeeId && committee.id === committeeId) {
                setSelectedCommitteeId(committeeId);
                setView('members');
              }
            }
          }}
        />
      )}
      {view === 'admin' && <AdminDashboard />}
      {view === 'members' && selectedCommitteeId != null && canManageMembers && (
        <MemberList
          committeeId={selectedCommitteeId}
          onBack={() => setView('committees')}
          onAddMember={() => setView('addMember')}
          readonly={!canManageMembers}
        />
      )}
      {view === 'addMember' && selectedCommitteeId != null && canManageMembers && (
        <AddMember
          committeeId={selectedCommitteeId}
          onAdded={() => setView('members')}
          onCancel={() => setView('members')}
        />
      )}
    </Layout>
  );
}