import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { organizationsApi } from '../api/organizations.api';
import { useAuth } from './AuthContext';

const OrgContext = createContext(null);

export function OrgProvider({ children }) {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState([]);
  const [activeOrg, setActiveOrg] = useState(null);
  const [userRole, setUserRole] = useState(null); // 'owner' | 'staff'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrganizations = useCallback(async () => {
    if (!user) {
      setOrganizations([]);
      setActiveOrg(null);
      setUserRole(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await organizationsApi.getMyOrganizations();
      const list = res.data?.organizations || [];
      setOrganizations(list);

      if (list.length > 0) {
        // Try to restore saved active org from localStorage
        const savedOrgId = localStorage.getItem('reservex_active_org_id');
        const matched = list.find((item) => item.organization?._id === savedOrgId);

        if (matched) {
          setActiveOrg(matched.organization);
          setUserRole(matched.role);
        } else {
          setActiveOrg(list[0].organization);
          setUserRole(list[0].role);
          localStorage.setItem('reservex_active_org_id', list[0].organization?._id);
        }
      } else {
        setActiveOrg(null);
        setUserRole(null);
        localStorage.removeItem('reservex_active_org_id');
      }
    } catch (err) {
      setError(err.message || 'Failed to load organizations');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  const switchOrganization = (orgId) => {
    const found = organizations.find((item) => item.organization?._id === orgId);
    if (found) {
      setActiveOrg(found.organization);
      setUserRole(found.role);
      localStorage.setItem('reservex_active_org_id', orgId);
    }
  };

  const createOrganization = async (data) => {
    const res = await organizationsApi.createOrganization(data);
    await fetchOrganizations();
    return res;
  };

  return (
    <OrgContext.Provider
      value={{
        organizations,
        activeOrg,
        activeOrgId: activeOrg?._id,
        userRole,
        isOwner: userRole === 'owner',
        isStaff: userRole === 'staff' || userRole === 'owner',
        loading,
        error,
        refreshOrganizations: fetchOrganizations,
        switchOrganization,
        createOrganization
      }}
    >
      {children}
    </OrgContext.Provider>
  );
}

export function useOrg() {
  const context = useContext(OrgContext);
  if (!context) {
    throw new Error('useOrg must be used within an OrgProvider');
  }
  return context;
}
