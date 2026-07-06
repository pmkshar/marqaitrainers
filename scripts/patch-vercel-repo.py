#!/usr/bin/env python3
"""Patch the Vercel-connected repo (marqaitrainers) with subscription gating,
corporate dashboard, and admin subscription approval features."""

import re, os

REPO = '/tmp/marqaitrainers-check'

# ============================================================
# 1. Add SubscriptionRequest type + approvedCourseIds to types.ts
# ============================================================
types_path = f'{REPO}/src/lib/types.ts'
with open(types_path) as f:
    types_content = f.read()

# Add SubscriptionRequest type before the last export
if 'SubscriptionRequest' not in types_content:
    # Add approvedCourseIds to User type
    types_content = types_content.replace(
        '  corporateId?: string;',
        '  corporateId?: string;\n  // ---- Subscription gating ----\n  approvedCourseIds?: string[];  // course IDs approved by admin for this user'
    )
    
    # Add SubscriptionRequest type at the end
    sub_request_type = '''

// ============================================================
// Subscription Request — course access approval workflow
// ============================================================

export type SubscriptionRequestStatus = 'pending' | 'approved' | 'rejected';

export interface SubscriptionRequest {
  id: string;
  userId: string;
  userName: string;
  courseId: string;
  courseTitle: string;
  status: SubscriptionRequestStatus;
  requestedAt: number;
  reviewedAt?: number;
  reviewedBy?: string;  // admin user id
  reviewNote?: string;
}
'''
    types_content += sub_request_type
    with open(types_path, 'w') as f:
        f.write(types_content)
    print('✅ Patched types.ts: added SubscriptionRequest type + approvedCourseIds')
else:
    print('⏭️ types.ts already has SubscriptionRequest')

# ============================================================
# 2. Add subscription store actions to store.ts
# ============================================================
store_path = f'{REPO}/src/lib/store.ts'
with open(store_path) as f:
    store_content = f.read()

if 'requestSubscription' not in store_content:
    # Add SubscriptionRequest import
    store_content = store_content.replace(
        "from './types'",
        "from './types'\nimport type { SubscriptionRequest, SubscriptionRequestStatus } from './types'"
    )
    
    # Add subscription state to the store interface
    # Find the state interface
    state_pattern = r'(purchaseCourse:\s*\(courseId:\s*string,\s*model:\s*[\'"]one_time[\'"]\s*\|\s*[\'"]subscription_monthly[\'"]\s*\|\s*[\'"]subscription_annual[\'"],\s*amount:\s*number\)\s*=>\s*void;)'
    
    subscription_actions = r'''\1
  // ---- Subscription gating ----
  subscriptionRequests: SubscriptionRequest[];
  requestSubscription: (courseId: string, courseTitle: string) => void;
  approveSubscription: (requestId: string) => void;
  rejectSubscription: (requestId: string, note?: string) => void;
  pendingSubscriptions: (userId?: string) => SubscriptionRequest[];
  isCourseApproved: (userId: string, courseId: string) => boolean;'''
    
    store_content = re.sub(state_pattern, subscription_actions, store_content, count=1)
    
    # Add subscription state to initial state
    # Find the partialize function or the state creation
    if 'subscriptionRequests:' not in store_content:
        # Add to initial state - find a good insertion point
        # Look for the state object creation
        init_pattern = r'(purchaseCourse:\s*\([^)]*\)\s*=>\s*\{[^}]*\},)'
        
        subscription_init = r'''\1

  subscriptionRequests: [] as SubscriptionRequest[],
  requestSubscription: (courseId: string, courseTitle: string) => {
    const s = get();
    const user = s.currentUser();
    if (!user) return;
    const req: SubscriptionRequest = {
      id: \`sub-req-\${Date.now()}\`,
      userId: user.id,
      userName: user.name,
      courseId,
      courseTitle,
      status: 'pending',
      requestedAt: Date.now(),
    };
    set({ subscriptionRequests: [...s.subscriptionRequests, req] });
  },
  approveSubscription: (requestId: string) => {
    const s = get();
    const req = s.subscriptionRequests.find(r => r.id === requestId);
    if (!req) return;
    const updated = s.subscriptionRequests.map(r =>
      r.id === requestId ? { ...r, status: 'approved' as SubscriptionRequestStatus, reviewedAt: Date.now(), reviewedBy: s.currentUserId } : r
    );
    // Add courseId to user's approvedCourseIds
    const users = s.users.map(u => {
      if (u.id === req.userId) {
        return { ...u, approvedCourseIds: [...(u.approvedCourseIds || []), req.courseId] };
      }
      return u;
    });
    set({ subscriptionRequests: updated, users });
  },
  rejectSubscription: (requestId: string, note?: string) => {
    const s = get();
    const updated = s.subscriptionRequests.map(r =>
      r.id === requestId ? { ...r, status: 'rejected' as SubscriptionRequestStatus, reviewedAt: Date.now(), reviewedBy: s.currentUserId, reviewNote: note } : r
    );
    set({ subscriptionRequests: updated });
  },
  pendingSubscriptions: (userId?: string) => {
    const s = get();
    let reqs = s.subscriptionRequests.filter(r => r.status === 'pending');
    if (userId) reqs = reqs.filter(r => r.userId === userId);
    return reqs;
  },
  isCourseApproved: (userId: string, courseId: string) => {
    const s = get();
    const user = s.users.find(u => u.id === userId);
    if (!user) return false;
    return (user.approvedCourseIds || []).includes(courseId);
  },'''
        
        store_content = re.sub(init_pattern, subscription_init, store_content, count=1, flags=re.DOTALL)
    
    # Add subscriptionRequests to partialize (persist)
    if 'subscriptionRequests' not in store_content.split('partialize:')[1].split(']')[0] if 'partialize:' in store_content else '':
        # Add to the partialize list
        partialize_pattern = r'(partialize:\s*\(state\)\s*=>\s*\(\{[^)]*?)\]\s*,'
        # Find the partialize section and add subscriptionRequests
        if 'partialize:' in store_content:
            # Find the last item in the partialize object
            store_content = store_content.replace(
                'partialize: (state) => ({',
                'partialize: (state) => ({\n    subscriptionRequests: state.subscriptionRequests,'
            )
    
    with open(store_path, 'w') as f:
        f.write(store_content)
    print('✅ Patched store.ts: added subscription gating actions')
else:
    print('⏭️ store.ts already has subscription actions')

# ============================================================
# 3. Add corporate dashboard rendering in dashboard.tsx
# ============================================================
dash_path = f'{REPO}/src/components/dashboard.tsx'
with open(dash_path) as f:
    dash_content = f.read()

if "user.role === 'corporate_admin'" not in dash_content.split('return (')[1].split('<section')[0] if 'return (' in dash_content else '':
    # Add corporate user rendering - show CandidateDashboard for corporate users too
    dash_content = dash_content.replace(
        "{user.role === 'candidate' && <CandidateDashboard />}",
        "{(user.role === 'candidate' || user.role === 'corporate_admin' || user.role === 'corporate_user') && <CandidateDashboard />}"
    )
    
    # Also add subscription status widget to DashboardHeader for corporate users
    # Add after the candidate info section
    corporate_info = '''
            {(user.role === 'corporate_admin' || user.role === 'corporate_user') && (
              <p className="mt-0.5 text-xs text-white/70">
                Corporate Account · {pendingSubscriptions.length} pending subscription requests
              </p>
            )}'''
    
    # Find a good place to insert - after the tutor info
    if 'Corporate Account' not in dash_content:
        dash_content = dash_content.replace(
            "{user.role === 'tutor' && user.tutorProfile && ` · ${user.tutorProfile.sessionsCompleted} sessions · ★ ${user.tutorProfile.rating}`}",
            "{user.role === 'tutor' && user.tutorProfile && ` · ${user.tutorProfile.sessionsCompleted} sessions · ★ ${user.tutorProfile.rating}`}" + corporate_info
        )
    
    with open(dash_path, 'w') as f:
        f.write(dash_content)
    print('✅ Patched dashboard.tsx: corporate users now see CandidateDashboard')
else:
    print('⏭️ dashboard.tsx already has corporate dashboard rendering')

# ============================================================
# 4. Add subscription gating to course-detail.tsx
# ============================================================
course_path = f'{REPO}/src/components/course-detail.tsx'
with open(course_path) as f:
    course_content = f.read()

if 'isCourseApproved' not in course_content:
    # Add the isCourseApproved check
    # Find where the course content is rendered and add gating
    
    # Add import for subscription check
    course_content = course_content.replace(
        "from '../lib/store'",
        "from '../lib/store'\n// Subscription gating"
    )
    
    # Add isCourseApproved hook usage inside the component
    # Find the component function and add the check
    if 'function CourseDetail' in course_content:
        # Add after the store hooks
        gating_hook = '''
  const isCourseApproved = useAppStore((s) => s.isCourseApproved);
  const requestSubscription = useAppStore((s) => s.requestSubscription);
  const currentUser = useAppStore((s) => s.currentUser());
  const isApproved = currentUser ? isCourseApproved(currentUser.id, course.id) : true;
  const pendingSubscriptions = useAppStore((s) => s.subscriptionRequests);
  const hasPendingRequest = currentUser ? pendingSubscriptions.some(r => r.userId === currentUser.id && r.courseId === course.id && r.status === 'pending') : false;
'''
        # Insert after the first useAppStore line in the component
        first_store_line = re.search(r"(const \w+ = useAppStore\([^)]+\);)", course_content)
        if first_store_line:
            # Find the last useAppStore line before the first return
            lines_before_return = course_content.split('return (')[0]
            last_store = lines_before_return.rfind('useAppStore')
            if last_store > 0:
                # Find the end of that line
                line_end = course_content.index(';', last_store) + 1
                course_content = course_content[:line_end] + gating_hook + course_content[line_end:]
    
    # Add lock overlay for unapproved courses
    lock_overlay = '''
          {!isApproved && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl">
              <Lock className="h-12 w-12 text-amber-500 mb-3" />
              <h3 className="text-lg font-bold text-gray-800">Subscription Required</h3>
              <p className="text-sm text-gray-600 mb-4 text-center max-w-xs">
                This course requires admin approval before you can access the content.
              </p>
              {hasPendingRequest ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-medium text-amber-700">
                  <Clock className="h-4 w-4" /> Request pending approval
                </span>
              ) : (
                <Button onClick={() => requestSubscription(course.id, course.title)} className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                  Request Access
                </Button>
              )}
            </div>
          )}
'''
    
    # Find where lessons are rendered and add the lock overlay
    # Look for the lessons section
    lesson_section_pattern = r'(<div[^>]*className="[^"]*space-y-2[^"]*"[^>]*>\s*\{course\.lessons)'
    if re.search(lesson_section_pattern, course_content):
        course_content = re.sub(
            lesson_section_pattern,
            r'<div className="relative">' + lock_overlay + r'\1',
            course_content,
            count=1
        )
    
    # Make sure Lock and Clock icons are imported
    if 'Lock' not in course_content.split('import')[0:5]:
        # Add to lucide-react imports
        lucide_pattern = r"import\s+\{([^}]+)\}\s+from\s+'lucide-react'"
        match = re.search(lucide_pattern, course_content)
        if match:
            imports = match.group(1)
            if 'Lock' not in imports:
                imports += ', Lock'
            if 'Clock' not in imports:
                imports += ', Clock'
            course_content = course_content.replace(match.group(0), f"import {{{imports}}} from 'lucide-react'")
    
    with open(course_path, 'w') as f:
        f.write(course_content)
    print('✅ Patched course-detail.tsx: added subscription gating')
else:
    print('⏭️ course-detail.tsx already has subscription gating')

# ============================================================
# 5. Add admin subscription panel
# ============================================================
admin_path = f'{REPO}/src/components/admin-portal.tsx'
with open(admin_path) as f:
    admin_content = f.read()

if 'Subscription Requests' not in admin_content:
    # Add a new tab for Subscription Requests
    # Find the TABS array
    tabs_pattern = r"(const TABS\s*=\s*\[)"
    if re.search(tabs_pattern, admin_content):
        # Add the tab entry
        sub_tab = r"""\1
  { id: 'subscriptions', label: 'Subscriptions', icon: ShieldCheck },"""
        admin_content = re.sub(tabs_pattern, sub_tab, admin_content, count=1)
    
    # Add the tab content - find the last TabsContent and add after it
    last_tab_content = admin_content.rfind('</TabsContent>')
    if last_tab_content > 0:
        subscription_panel = '''

      <TabsContent value="subscriptions">
        <SubscriptionRequestsPanel />
      </TabsContent>'''
        admin_content = admin_content[:last_tab_content + len('</TabsContent>')] + subscription_panel + admin_content[last_tab_content + len('</TabsContent>'):]
    
    # Add the SubscriptionRequestsPanel component before the export
    sub_panel_component = '''
function SubscriptionRequestsPanel() {
  const subscriptionRequests = useAppStore((s) => s.subscriptionRequests);
  const approveSubscription = useAppStore((s) => s.approveSubscription);
  const rejectSubscription = useAppStore((s) => s.rejectSubscription);
  const pending = subscriptionRequests.filter(r => r.status === 'pending');
  const approved = subscriptionRequests.filter(r => r.status === 'approved');
  const rejected = subscriptionRequests.filter(r => r.status === 'rejected');

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Subscription Requests</h3>
        <p className="text-sm text-muted-foreground">Approve or reject course access requests from candidates and corporate users.</p>
      </div>

      {pending.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">No pending subscription requests</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {pending.map(req => (
            <Card key={req.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <p className="font-medium">{req.userName}</p>
                  <p className="text-sm text-muted-foreground">{req.courseTitle}</p>
                  <p className="text-xs text-muted-foreground">Requested {new Date(req.requestedAt).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => approveSubscription(req.id)} className="bg-emerald-600 hover:bg-emerald-700">Approve</Button>
                  <Button size="sm" variant="destructive" onClick={() => rejectSubscription(req.id)}>Reject</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {approved.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-2">Approved ({approved.length})</h4>
          <div className="space-y-2">
            {approved.map(req => (
              <Card key={req.id}><CardContent className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium">{req.userName} — {req.courseTitle}</p>
                  <p className="text-xs text-muted-foreground">Approved {req.reviewedAt ? new Date(req.reviewedAt).toLocaleDateString() : ''}</p>
                </div>
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Approved</span>
              </CardContent></Card>
            ))}
          </div>
        </div>
      )}

      {rejected.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-2">Rejected ({rejected.length})</h4>
          <div className="space-y-2">
            {rejected.map(req => (
              <Card key={req.id}><CardContent className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium">{req.userName} — {req.courseTitle}</p>
                  <p className="text-xs text-muted-foreground">Rejected {req.reviewedAt ? new Date(req.reviewedAt).toLocaleDateString() : ''}</p>
                </div>
                <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">Rejected</span>
              </CardContent></Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

'''
    
    # Add before the export function
    export_pattern = r'(export function AdminPortal)'
    admin_content = re.sub(export_pattern, sub_panel_component + r'\1', admin_content, count=1)
    
    with open(admin_path, 'w') as f:
        f.write(admin_content)
    print('✅ Patched admin-portal.tsx: added Subscription Requests panel')
else:
    print('⏭️ admin-portal.tsx already has Subscription Requests')

# ============================================================
# 6. Fix vercel.json installCommand
# ============================================================
vercel_path = f'{REPO}/vercel.json'
with open(vercel_path) as f:
    vc = f.read()
if 'bun install' in vc:
    vc = vc.replace('"installCommand": "bun install"', '"installCommand": "npm install"')
    with open(vercel_path, 'w') as f:
        f.write(vc)
    print('✅ Patched vercel.json: changed bun install to npm install')
else:
    print('⏭️ vercel.json already uses npm install')

print('\n🎉 All patches applied! Ready to build and push.')
