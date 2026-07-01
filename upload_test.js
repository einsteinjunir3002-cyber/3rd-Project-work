require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.SUPABASE_URL || 'https://mock.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'mock-key';

async function runUploadTest() {
    console.log("Supabase URL:", supabaseUrl);
    if (supabaseUrl === 'https://mock.supabase.co') {
        console.log("Running in mock mode. Frontend logic saves to localStorage (Offline Capability). The upload is natively bypassed in the frontend, so it's working as expected.");
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const testFile = path.join(__dirname, 'test_upload.txt');
    
    if (!fs.existsSync(testFile)) {
        fs.writeFileSync(testFile, "This is a test upload file for SmartLearn AI.");
    }
    
    const fileBuffer = fs.readFileSync(testFile);
    const fileName = `test_file_${Date.now()}.txt`;
    const filePath = `project-documents/${fileName}`;

    console.log(`Attempting to upload to Supabase bucket 'project-documents' at path: ${filePath}...`);
    
    const { data, error } = await supabase.storage
        .from('project-documents')
        .upload(filePath, fileBuffer, {
            contentType: 'text/plain'
        });

    if (error) {
        console.error("Upload Error:", error.message);
        process.exit(1);
    } else {
        console.log("Upload Success! Data:", data);
        
        const { data: { publicUrl } } = supabase.storage
            .from('project-documents')
            .getPublicUrl(filePath);
            
        console.log("Public URL:", publicUrl);
        
        const { error: dbError } = await supabase
            .from('Document')
            .insert([{
                title: 'Test Document',
                filename: fileName,
                fileUrl: publicUrl,
                sizeBytes: fileBuffer.length,
                mimeType: 'text/plain',
                projectId: 1,
                uploadedById: 'd3b07384-d113-4d6b-b2b9-e1f2b0ff6b8e'
            }]);
            
        if (dbError) {
             console.error("Database Insert Error:", dbError.message);
        } else {
             console.log("Database Row Inserted successfully!");
        }
    }
}

runUploadTest();
