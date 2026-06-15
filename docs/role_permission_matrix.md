# Role-Permission Matrix

This matrix defines the strict Role-Based Access Control (RBAC) and Department-Based Access Control (DBAC) constraints enforced by the SmartLearn backend.

| Resource/Action | Super Admin | Dept Admin | Lecturer | Student | Researcher | Alumni / Partner |
|-----------------|-------------|------------|----------|---------|------------|------------------|
| **System Settings** | ✅ Allow | ❌ Deny | ❌ Deny | ❌ Deny | ❌ Deny | ❌ Deny |
| **Manage Users** | ✅ Allow | ✅ Dept Only | ❌ Deny | ❌ Deny | ❌ Deny | ❌ Deny |
| **Upload Resources**| ✅ Allow | ✅ Dept Only | ✅ Dept Only | ❌ Deny | ✅ Dept Only | ❌ Deny |
| **Download Resources**| ✅ Allow | ✅ Dept Only | ✅ Dept Only | ✅ Dept Only | ✅ Dept Only | ❌ Deny |
| **Import External** | ✅ Allow | ✅ Dept Only | ❌ Deny | ❌ Deny | ❌ Deny | ❌ Deny |
| **Post Job/Internship**| ✅ Allow | ✅ Dept Only | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Own Profile |
| **View Audit Logs** | ✅ Allow | ❌ Deny | ❌ Deny | ❌ Deny | ❌ Deny | ❌ Deny |
