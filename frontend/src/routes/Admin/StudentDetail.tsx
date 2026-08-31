--- a/frontend/src/routes/Admin/StudentDetail.tsx
+++ b/frontend/src/routes/Admin/StudentDetail.tsx
@@
 import StudentCertificatesSection from '@/components/StudentCertificatesSection'
+import StudentPaymentsSection from '@/components/StudentPaymentsSection'
@@
   return (
     <div className="space-y-6">
@@
       <div className="bg-white p-6 rounded">
         <h2 className="font-semibold">Profile</h2>
@@
       </div>
 
       <div className="bg-white p-6 rounded">
         <h2 className="font-semibold">Photo</h2>
@@
       </div>
+
+      <div>
+        <StudentPaymentsSection studentId={student.id} />
+      </div>
 
       <div className="bg-white p-6 rounded">
         <h2 className="font-semibold">Certificates</h2>
@@
     </div>
   )
 }
